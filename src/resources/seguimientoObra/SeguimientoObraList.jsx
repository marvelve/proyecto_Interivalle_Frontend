import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import { Title } from "react-admin";
import { apiUrl } from "../../app/httpClient";
import {
  centeredPageSx,
  compactTableContainerSx,
  compactTableSx,
  tableHeaderGreen,
} from "../../app/listStyles";
import { ClienteProyectoCards } from "../../components/ClienteProyectoCards";

const SeguimientoObraList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [registros, setRegistros] = useState([]);

  const token = localStorage.getItem("token");
  const idRol = String(localStorage.getItem("idRol") || "");

  const esAdmin = idRol === "1";
  const esSupervisor = idRol === "2";
  const esCliente = idRol === "3";

  const puedeVerColumnasInternas = esAdmin || esSupervisor;

  useEffect(() => {
    cargarSeguimientos();
  }, []);

  const cargarSeguimientos = async () => {
    try {
      setLoading(true);

      const responseCronogramas = await fetch(
        `${apiUrl}/api/cliente/cronogramas`,
         {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!responseCronogramas.ok) {
        const txt = await responseCronogramas.text();
        throw new Error(txt || "No se pudieron cargar los cronogramas");
      }

      const cronogramas = await responseCronogramas.json();

      const resultados = await Promise.all(
        (cronogramas || []).map(async (cronograma) => {
          try {
            const responseAvances = await fetch(
              `${apiUrl}/api/avances/cronograma/${cronograma.idCronograma}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              }
            );

            if (!responseAvances.ok) {
              return null;
            }

            const avances = await responseAvances.json();

            if (Array.isArray(avances) && avances.length > 0) {
              return {
                ...cronograma,
                cantidadAvances: avances.length,
              };
            }

            return null;
          } catch (error) {
            console.error(
              `Error consultando avances del cronograma ${cronograma.idCronograma}:`,
              error
            );
            return null;
          }
        })
      );

      setRegistros(
        resultados
          .filter(Boolean)
          .sort(
            (a, b) =>
              Number(b.idCronograma || 0) - Number(a.idCronograma || 0)
          )
      );
    } catch (error) {
      console.error("Error cargando seguimiento de obra:", error);
      alert(error.message || "No se pudo cargar el seguimiento de obra");
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3} sx={centeredPageSx}>
      <Title title="Seguimiento de Obra" />

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          {loading ? (
            <Box display="flex" alignItems="center" gap={2}>
              <CircularProgress size={24} />
              <Typography>Cargando seguimientos...</Typography>
            </Box>
          ) : registros.length === 0 ? (
            <Typography>
              No hay cotizaciones con seguimiento registrado.
            </Typography>
          ) : esCliente ? (
            <ClienteProyectoCards
              records={registros}
              emptyText="No tienes seguimientos registrados."
              getProyecto={(record) => record.nombreProyecto}
              getEstado={(record) => record.estadoCronograma}
              getFecha={(record) => record.fechaInicio}
              getFechaLabel={() => "Fecha inicio"}
              getDetalle={(record) => `Avances registrados: ${record.cantidadAvances || 0}`}
              onOpen={(record) =>
                record?.idCronograma &&
                navigate(`/cronogramas/${record.idCronograma}/seguimiento`)
              }
            />
          ) : (
            <TableContainer component={Paper} sx={compactTableContainerSx}>
              <Table size="small" sx={compactTableSx}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: tableHeaderGreen }}>
                    {puedeVerColumnasInternas && (
                      <TableCell sx={{ fontWeight: "bold" }}>
                        ID Cronograma
                      </TableCell>
                    )}

                    {puedeVerColumnasInternas && (
                      <TableCell sx={{ fontWeight: "bold" }}>
                        ID Cotización
                      </TableCell>
                    )}

                    <TableCell sx={{ fontWeight: "bold" }}>Proyecto</TableCell>

                    {puedeVerColumnasInternas && (
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Cliente
                      </TableCell>
                    )}

                    <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Fecha inicio</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Fecha fin</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Avances</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="center">
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {registros.map((item) => (
                    <TableRow key={item.idCronograma} hover>
                      {puedeVerColumnasInternas && (
                        <TableCell>{item.idCronograma}</TableCell>
                      )}

                      {puedeVerColumnasInternas && (
                        <TableCell>{item.idCotizacion}</TableCell>
                      )}

                      <TableCell>{item.nombreProyecto || "-"}</TableCell>

                      {puedeVerColumnasInternas && (
                        <TableCell>{item.nombreCliente || "-"}</TableCell>
                      )}

                      <TableCell>{item.estadoCronograma || "-"}</TableCell>
                      <TableCell>{item.fechaInicio || "-"}</TableCell>
                      <TableCell>{item.fechaFin || "-"}</TableCell>
                      <TableCell>{item.cantidadAvances || 0}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() =>
                            navigate(`/cronogramas/${item.idCronograma}/seguimiento`)
                          }
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SeguimientoObraList;
