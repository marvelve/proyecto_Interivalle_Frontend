import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Tooltip,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { useNotify } from "react-admin";
import httpClient, { apiUrl } from "../../app/httpClient";

const ESTADOS = [
  "PENDIENTE",
  "EN_PROCESO",
  "COMPLETADA",
  "ATRASADA",
  "EN_REVISION",
];

const getEstadoColor = (estado) => {
  switch (estado) {
    case "COMPLETADA":
      return {
        bg: "#E8F5E9",
        text: "#2E7D32",
        chip: "success",
      };
    case "EN_PROCESO":
      return {
        bg: "#FFF3E0",
        text: "#EF6C00",
        chip: "warning",
      };
    case "ATRASADA":
      return {
        bg: "#FFEBEE",
        text: "#C62828",
        chip: "error",
      };
    case "EN_REVISION":
      return {
        bg: "#E3F2FD",
        text: "#1565C0",
        chip: "info",
      };
    case "PENDIENTE":
    default:
      return {
        bg: "#F5F5F5",
        text: "#616161",
        chip: "default",
      };
  }
};

const CronogramaVista = () => {
  const { idCotizacion } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cronograma, setCronograma] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [formEdit, setFormEdit] = useState({
    estado: "",
    trabajador: "",
    porcentaje: 0,
    novedades: "",
  });

  const [tieneSeguimiento, setTieneSeguimiento] = useState(false);
  const [verificandoSeguimiento, setVerificandoSeguimiento] = useState(false);

  const idRol = Number(localStorage.getItem("idRol"));
  const esAdmin = idRol === 1;
  const esSupervisor = idRol === 2;
  const esCliente = idRol === 3;

    const puedeGestionarSeguimiento = esAdmin || esSupervisor;
    const puedeVerSeguimiento = esAdmin || esSupervisor || esCliente;

  useEffect(() => {
    cargarCronograma();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCotizacion]);

const cargarCronograma = async () => {
  try {
    setLoading(true);

    const { json } = await httpClient(
      `${apiUrl}/api/cliente/cronogramas/cotizacion/${idCotizacion}`
    );

    setCronograma(json);

    if (json?.idCronograma) {
      await verificarSeguimiento(json.idCronograma);
    } else {
      setTieneSeguimiento(false);
    }
  } catch (error) {
    console.error("Error cargando cronograma:", error);
    notify(
      error?.body?.message || error?.message || "No se pudo cargar el cronograma",
      { type: "error" }
    );
  } finally {
    setLoading(false);
  }
};
const verificarSeguimiento = async (idCronograma) => {
  if (!idCronograma) {
    setTieneSeguimiento(false);
    return;
  }

  try {
    setVerificandoSeguimiento(true);

    const { json } = await httpClient(
      `${apiUrl}/api/avances/cronograma/${idCronograma}`
    );

    setTieneSeguimiento(Array.isArray(json) && json.length > 0);
  } catch (error) {
    console.error("Error verificando seguimiento:", error);
    setTieneSeguimiento(false);
  } finally {
    setVerificandoSeguimiento(false);
  }
};

  const semanas = useMemo(() => {
    if (!cronograma?.semanas) return [];

    return [...cronograma.semanas].sort((a, b) => a.numero - b.numero);
  }, [cronograma]);

  const detalles = useMemo(() => {
    if (!cronograma?.detalles) return [];
    return cronograma.detalles;
  }, [cronograma]);

  const avanceGeneral = useMemo(() => {
    if (cronograma?.avanceGeneral !== undefined && cronograma?.avanceGeneral !== null) {
      return cronograma.avanceGeneral;
    }

    if (!detalles.length) return 0;

    const suma = detalles.reduce(
      (acc, item) => acc + Number(item.porcentaje || 0),
      0
    );

    return Math.round(suma / detalles.length);
  }, [cronograma, detalles]);

  const abrirEdicion = (detalle) => {
    setDetalleSeleccionado(detalle);
    setFormEdit({
      estado: detalle.estado || "PENDIENTE",
      trabajador: detalle.trabajador || "",
      porcentaje: detalle.porcentaje || 0,
      novedades: detalle.novedades || "",
    });
    setOpenEdit(true);
  };

  const cerrarEdicion = () => {
    setOpenEdit(false);
    setDetalleSeleccionado(null);
    setFormEdit({
      estado: "",
      trabajador: "",
      porcentaje: 0,
      novedades: "",
    });
  };

  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    setFormEdit((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const guardarEdicion = async () => {
    if (!detalleSeleccionado?.idDetalle && !detalleSeleccionado?.idCronogramaDetalle) {
      notify("No se encontró el identificador del detalle", { type: "warning" });
      return;
    }

    const idDetalle =
      detalleSeleccionado.idDetalle || detalleSeleccionado.idCronogramaDetalle;

    try {
      setGuardando(true);

      await httpClient(`${apiUrl}/api/cronogramas/detalle/${idDetalle}`, {
        method: "PUT",
        body: JSON.stringify({
          estado: formEdit.estado,
          trabajador: formEdit.trabajador,
          porcentaje: Number(formEdit.porcentaje),
          novedades: formEdit.novedades,
        }),
      });

      notify("Actividad actualizada correctamente", { type: "success" });
      cerrarEdicion();
      cargarCronograma();
    } catch (error) {
      console.error("Error actualizando detalle:", error);
      notify(
        error?.body?.message || error?.message || "No se pudo actualizar la actividad",
        { type: "error" }
      );
    } finally {
      setGuardando(false);
    }
  };

  const renderBarraSemana = (detalle, semana) => {
    const mismaSemana = Number(detalle.semana) === Number(semana.numero);

    if (!mismaSemana) {
      return (
        <Box
          sx={{
            height: 16,
            borderRadius: 2,
            backgroundColor: "#EEEEEE",
            border: "1px solid #E0E0E0",
          }}
        />
      );
    }

    const colorEstado = getEstadoColor(detalle.estado);

    return (
      <Tooltip
        title={`${detalle.actividad || detalle.descripcion || "Actividad"} - ${
          detalle.estado || "PENDIENTE"
        }`}
      >
        <Box
          sx={{
            height: 16,
            borderRadius: 2,
            backgroundColor: colorEstado.text,
            opacity: 0.75,
          }}
        />
      </Tooltip>
    );
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Cargando cronograma...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!cronograma) {
    return (
      <Box p={3}>
        <Typography variant="h6">
          No se encontró información del cronograma.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack
  direction="row"
  justifyContent="space-between"
  alignItems="center"
  mb={3}
  flexWrap="wrap"
  gap={2}
>
  <Typography variant="h4" fontWeight="bold">
    Cronograma cotización #{cronograma.idCotizacion || idCotizacion}
  </Typography>

    <Stack direction="row" spacing={2} flexWrap="wrap">
    {puedeGestionarSeguimiento && (
      <Button
        variant="contained"
        color="success"
        disabled={verificandoSeguimiento || tieneSeguimiento}
        onClick={() =>
          navigate(`/cronogramas/${cronograma.idCronograma}/seguimiento?nuevo=1`)
        }
        sx={{ textTransform: "none", borderRadius: 2 }}
      >
        Crear seguimiento
      </Button>
    )}

    {puedeGestionarSeguimiento ? (
      <Button
        variant="contained"
        disabled={verificandoSeguimiento || !tieneSeguimiento}
        onClick={() =>
          navigate(`/cronogramas/${cronograma.idCronograma}/seguimiento`)
        }
        sx={{ textTransform: "none", borderRadius: 2 }}
      >
        Ver seguimiento de obra
      </Button>
    ) : esCliente ? (
      <Button
        variant="contained"
        onClick={() =>
          navigate(`/cronogramas/${cronograma.idCronograma}/seguimiento`)
        }
        sx={{ textTransform: "none", borderRadius: 2 }}
      >
        Ver seguimiento de obra
      </Button>
    ) : null}

    <Button
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate(-1)}
      sx={{ textTransform: "none", borderRadius: 2 }}
    >
      Volver
    </Button>
  </Stack>
</Stack>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Proyecto
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {cronograma.nombreProyecto || "Sin nombre"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Estado cronograma
              </Typography>
              <Chip
                label={cronograma.estadoCronograma || "EN_PROCESO"}
                color={
                  getEstadoColor(cronograma.estadoCronograma).chip === "default"
                    ? undefined
                    : getEstadoColor(cronograma.estadoCronograma).chip
                }
                sx={{ mt: 1, fontWeight: "bold" }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Fecha inicio
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {cronograma.fechaInicio || "-"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Fecha fin
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {cronograma.fechaFin || "-"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Avance general
              </Typography>
              <Typography variant="h6" fontWeight="bold" mb={1}>
                {avanceGeneral}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={avanceGeneral}
                sx={{
                  height: 10,
                  borderRadius: 5,
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Plan de actividades
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F3F0FF" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Actividad</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Trabajador</TableCell>

                  {semanas.map((semana) => (
                    <TableCell
                      key={semana.numero}
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 120 }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          Semana {semana.numero}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {semana.inicio}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {semana.fin}
                        </Typography>
                      </Box>
                    </TableCell>
                  ))}

                  <TableCell sx={{ fontWeight: "bold" }}>%</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Novedades</TableCell>
                  {esSupervisor && (
                    <TableCell sx={{ fontWeight: "bold" }}>Acciones</TableCell>
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {detalles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={semanas.length + (esSupervisor ? 7 : 6)}
                      align="center"
                    >
                      No hay actividades registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  detalles.map((detalle, index) => {
                    const estiloEstado = getEstadoColor(detalle.estado);

                    return (
                      <TableRow key={detalle.idDetalle || index} hover>
                        <TableCell>
                          <Box>
                            <Typography fontWeight="bold">
                              {detalle.actividad || detalle.descripcion || "-"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {detalle.descripcion || "-"}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={detalle.estado || "PENDIENTE"}
                            sx={{
                              fontWeight: "bold",
                              backgroundColor: estiloEstado.bg,
                              color: estiloEstado.text,
                            }}
                          />
                        </TableCell>

                        <TableCell>{detalle.trabajador || "-"}</TableCell>

                        {semanas.map((semana) => (
                          <TableCell
                            key={`${detalle.idDetalle || index}-sem-${semana.numero}`}
                            align="center"
                          >
                            {renderBarraSemana(detalle, semana)}
                          </TableCell>
                        ))}

                        <TableCell>{detalle.porcentaje || 0}%</TableCell>

                        <TableCell sx={{ minWidth: 180 }}>
                          {detalle.novedades || "-"}
                        </TableCell>

                        {esSupervisor && (
                          <TableCell>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => abrirEdicion(detalle)}
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                              }}
                            >
                              Editar
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {esCliente && (
            <Typography variant="body2" color="text.secondary" mt={2}>
              Vista solo lectura para cliente.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={openEdit}
        onClose={cerrarEdicion}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Actualizar actividad</DialogTitle>

        <DialogContent>
          <Box mt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Actividad"
              value={detalleSeleccionado?.actividad || detalleSeleccionado?.descripcion || ""}
              fullWidth
              disabled
            />

            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                name="estado"
                value={formEdit.estado}
                label="Estado"
                onChange={handleChangeEdit}
              >
                {ESTADOS.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Trabajador"
              name="trabajador"
              value={formEdit.trabajador}
              onChange={handleChangeEdit}
              fullWidth
            />

            <TextField
              label="Porcentaje"
              name="porcentaje"
              type="number"
              value={formEdit.porcentaje}
              onChange={handleChangeEdit}
              inputProps={{ min: 0, max: 100 }}
              fullWidth
            />

            <TextField
              label="Novedades"
              name="novedades"
              value={formEdit.novedades}
              onChange={handleChangeEdit}
              fullWidth
              multiline
              minRows={3}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={cerrarEdicion}>Cancelar</Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={guardarEdicion}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CronogramaVista;