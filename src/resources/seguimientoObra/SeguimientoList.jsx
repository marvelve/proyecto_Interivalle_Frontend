import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import SeguimientoForm from "./seguimientoForm";
import SeguimientoDetalle from "./SeguimientoDetalle";
import { listarAvancesPorCronograma } from "./seguimientoService";

const SeguimientoList = () => {
  const { idCronograma } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [avances, setAvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [avanceEditar, setAvanceEditar] = useState(null);
  const [avanceSeleccionado, setAvanceSeleccionado] = useState(null);

  const idRol = Number(localStorage.getItem("idRol"));
  const puedeEditar = idRol === 1 || idRol === 2;

  const cargarAvances = async () => {
    try {
      setLoading(true);
      const data = await listarAvancesPorCronograma(idCronograma);
      setAvances(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando avances:", error);
      alert(error.message || "No se pudieron cargar los avances");
      setAvances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idCronograma) {
      cargarAvances();
    }
  }, [idCronograma]);

  useEffect(() => {
    const nuevo = searchParams.get("nuevo");

    if (nuevo === "1" && avances.length === 0 && puedeEditar) {
      setMostrarForm(true);
      setAvanceEditar(null);
      setAvanceSeleccionado(null);
    }
  }, [searchParams, avances, puedeEditar]);

  const handleNuevo = () => {
    setAvanceEditar(null);
    setMostrarForm(true);
    setAvanceSeleccionado(null);
  };

  const handleEditar = (avance) => {
    setAvanceEditar(avance);
    setMostrarForm(true);
    setAvanceSeleccionado(null);
  };

  const handleGuardado = async () => {
    setMostrarForm(false);
    setAvanceEditar(null);
    await cargarAvances();
  };

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h4" fontWeight="bold">
          Seguimiento de obra
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap">
          {puedeEditar && (
            <Button variant="contained" onClick={handleNuevo}>
              Registrar avance
            </Button>
          )}

          <Button variant="outlined" onClick={() => navigate(-1)}>
            Volver
          </Button>
        </Box>
      </Box>

      {mostrarForm && (
        <SeguimientoForm
          idCronograma={idCronograma}
          avanceInicial={avanceEditar}
          onGuardado={handleGuardado}
          onCancelar={() => {
            setMostrarForm(false);
            setAvanceEditar(null);
          }}
        />
      )}

      {loading ? (
        <Typography>Cargando avances...</Typography>
      ) : avances.length === 0 ? (
        <Typography>No hay avances registrados para este cronograma.</Typography>
      ) : (
        <Grid container spacing={2}>
          {avances.map((avance) => (
            <Grid item xs={12} md={6} lg={4} key={avance.idAvance}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    Semana {avance.numeroSemana}
                  </Typography>

                  <Typography fontWeight="bold" mt={1}>
                    {avance.titulo}
                  </Typography>

                  <Typography variant="body2" mt={1}>
                    {avance.descripcion}
                  </Typography>

                  <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                    <Chip label={`Semana: ${avance.porcentajeSemana || 0}%`} />
                    <Chip label={`General: ${avance.porcentajeGeneral || 0}%`} />
                    <Chip
                      label={avance.estado || "REGISTRADO"}
                      color="success"
                    />
                  </Box>

                  <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      onClick={() => setAvanceSeleccionado(avance)}
                    >
                      Ver detalle
                    </Button>

                    {puedeEditar && (
                      <Button
                        variant="contained"
                        onClick={() => handleEditar(avance)}
                      >
                        Editar
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {avanceSeleccionado && (
        <SeguimientoDetalle
          avance={avanceSeleccionado}
          onCerrar={() => setAvanceSeleccionado(null)}
          onActualizar={cargarAvances}
        />
      )}
    </Box>
  );
};

export default SeguimientoList;