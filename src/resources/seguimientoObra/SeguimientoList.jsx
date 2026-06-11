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
import SeguimientoForm from "./SeguimientoForm";
import SeguimientoDetalle from "./SeguimientoDetalle";
import {
  listarAvancesPorCronograma,
  obtenerCronogramaPorId,
} from "./SeguimientoService";

const normalizarAvancesPorSemana = (items) => {
  const avancesPorSemana = new Map();

  (Array.isArray(items) ? items : []).forEach((avance) => {
    const numeroSemana = Number(avance?.numeroSemana);
    if (!numeroSemana) return;

    const actual = avancesPorSemana.get(numeroSemana);

    if (!actual) {
      avancesPorSemana.set(numeroSemana, avance);
      return;
    }

    const idOriginal = Math.min(
      Number(actual.idAvance || Number.MAX_SAFE_INTEGER),
      Number(avance.idAvance || Number.MAX_SAFE_INTEGER)
    );
    const avanceMasCompleto =
      Number(avance.porcentajeSemana || 0) >= Number(actual.porcentajeSemana || 0)
        ? avance
        : actual;

    avancesPorSemana.set(numeroSemana, {
      ...avanceMasCompleto,
      idAvance: idOriginal,
    });
  });

  return [...avancesPorSemana.values()].sort(
    (a, b) => Number(a.numeroSemana) - Number(b.numeroSemana)
  );
};

const SeguimientoList = () => {
  const { idCronograma } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [avances, setAvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [avanceEditar, setAvanceEditar] = useState(null);
  const [avanceSeleccionado, setAvanceSeleccionado] = useState(null);
  const [cronogramaInfo, setCronogramaInfo] = useState(null);

  const idRol = Number(localStorage.getItem("idRol"));
  const puedeEditar = idRol === 1 || idRol === 2;

  const cargarAvances = async () => {
    try {
      setLoading(true);
      const [data, cronograma] = await Promise.all([
        listarAvancesPorCronograma(idCronograma),
        obtenerCronogramaPorId(idCronograma).catch((error) => {
          console.error("Error cargando proyecto del cronograma:", error);
          return null;
        }),
      ]);

      setCronogramaInfo(cronograma || null);
      setAvanceSeleccionado(null);
      setAvances(normalizarAvancesPorSemana(data));
    } catch (error) {
      console.error("Error cargando avances:", error);
      alert(error.message || "No se pudieron cargar los avances");
      setAvances([]);
    } finally {
      setLoading(false);
    }
  };

  const nombreProyecto =
    cronogramaInfo?.nombreProyecto ||
    cronogramaInfo?.proyecto ||
    cronogramaInfo?.nombre ||
    "";

  const avanceGeneralCronograma = Number(cronogramaInfo?.avanceGeneral || 0);
  const avanceGeneralRegistrado = Math.max(
    0,
    ...avances.map((avance) => Number(avance?.porcentajeGeneral || 0))
  );
  const estadoCronograma = String(cronogramaInfo?.estadoCronograma || "").toUpperCase();
  const cronogramaPendienteInterValle =
    estadoCronograma === "PENDIENTE_APROBACION_EMPRESA" ||
    estadoCronograma === "PENDIENTE_APROBACION_INTERIVALLE";
  const cronogramaFinalizado =
    estadoCronograma === "FINALIZADO" &&
    Math.max(avanceGeneralCronograma, avanceGeneralRegistrado) >= 100;

  useEffect(() => {
    if (idCronograma) {
      cargarAvances();
    }
  }, [idCronograma]);

  useEffect(() => {
    const nuevo = searchParams.get("nuevo");

    if (
      nuevo === "1" &&
      avances.length === 0 &&
      puedeEditar &&
      !cronogramaFinalizado &&
      !cronogramaPendienteInterValle
    ) {
      setMostrarForm(true);
      setAvanceEditar(null);
      setAvanceSeleccionado(null);
    }
  }, [searchParams, avances, puedeEditar, cronogramaFinalizado, cronogramaPendienteInterValle]);

  useEffect(() => {
    const idAvance = Number(searchParams.get("avance"));

    if (!idAvance || loading || avances.length === 0) {
      return;
    }

    const avance = avances.find((item) => Number(item.idAvance) === idAvance);

    if (avance) {
      setAvanceSeleccionado(avance);
    }
  }, [searchParams, avances, loading]);

  const handleNuevo = () => {
    if (cronogramaFinalizado || cronogramaPendienteInterValle) {
      return;
    }

    setAvanceEditar(null);
    setMostrarForm(true);
    setAvanceSeleccionado(null);
  };

  const handleEditar = (avance) => {
    if (cronogramaPendienteInterValle) {
      return;
    }

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
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Seguimiento de obra
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mt: 0.5,
              color: "#2E7D32",
              fontWeight: 800,
              lineHeight: 1.25,
            }}
          >
            Proyecto: {nombreProyecto || "Cargando proyecto..."}
          </Typography>
        </Box>

        <Box display="flex" gap={2} flexWrap="wrap">
          {puedeEditar && (
            <Button
              variant="contained"
              onClick={handleNuevo}
              disabled={cronogramaFinalizado || cronogramaPendienteInterValle}
            >
              Registrar avance
            </Button>
          )}

          <Button variant="outlined" onClick={() => navigate(-1)}>
            Volver
          </Button>
        </Box>
      </Box>

      {cronogramaPendienteInterValle && (
        <Box
          mb={3}
          p={2}
          sx={{
            borderRadius: 2,
            border: "1px solid #90CAF9",
            bgcolor: "#E3F2FD",
            color: "#0D47A1",
          }}
        >
          <Typography fontWeight="bold">
            El seguimiento todavía no está activo.
          </Typography>
          <Typography variant="body2">
            InterValle debe aprobar el cronograma para iniciar el registro de avances.
          </Typography>
        </Box>
      )}

      {mostrarForm && !cronogramaPendienteInterValle && (
        <SeguimientoForm
          idCronograma={idCronograma}
          avanceInicial={avanceEditar}
          avancesExistentes={avances}
          totalSemanas={cronogramaInfo?.totalSemanas}
          onGuardado={handleGuardado}
          onEditarExistente={handleEditar}
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
                      variant="contained"
                      onClick={() => setAvanceSeleccionado(avance)}
                    >
                      Ver detalle
                    </Button>

                    {puedeEditar && (
                      <Button
                        variant="outlined"
                        disabled={cronogramaPendienteInterValle}
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
