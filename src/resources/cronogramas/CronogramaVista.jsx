import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  Stack,
  Tooltip,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNotify } from "react-admin";
import httpClient, { apiUrl } from "../../app/httpClient";

const labelEstado = (estado) => {
  if (estado === "PENDIENTE_APROBACION_EMPRESA" || estado === "PENDIENTE_APROBACION_INTERIVALLE") {
    return "Pendiente de aprobación empresa";
  }

  return estado === "TERMINADA" ? "COMPLETADA" : String(estado || "").replace(/_/g, " ");
};

const getEstadoColor = (estado) => {
  switch (estado) {
    case "COMPLETADA":
    case "TERMINADA":
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
    case "PENDIENTE_APROBACION_EMPRESA":
    case "PENDIENTE_APROBACION_INTERIVALLE":
      return {
        bg: "#E3F2FD",
        text: "#1565C0",
        chip: "info",
      };
    case "ATRASADA":
      return {
        bg: "#FFEBEE",
        text: "#C62828",
        chip: "error",
      };
    case "EN_REVISION":
      return {
        bg: "#E8F5E9",
        text: "#2E7D32",
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

const resumenCardSx = {
  width: "100%",
  minHeight: 126,
  height: "100%",
  borderRadius: 3,
  boxShadow: 3,
  display: "flex",
  alignItems: "stretch",
  "& .MuiCardContent-root": {
    width: "100%",
    minHeight: 126,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    px: 2.5,
    py: 2,
  },
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
    trabajador: "",
    novedades: "",
  });

  const [tieneSeguimiento, setTieneSeguimiento] = useState(false);
  const [verificandoSeguimiento, setVerificandoSeguimiento] = useState(false);
  const [aprobandoCronograma, setAprobandoCronograma] = useState(false);
  const [openEditarCronograma, setOpenEditarCronograma] = useState(false);
  const [guardandoCronograma, setGuardandoCronograma] = useState(false);
  const [formCronograma, setFormCronograma] = useState({
    fechaInicio: "",
    totalSemanas: 1,
    detalles: [],
  });

  const idRol = Number(localStorage.getItem("idRol"));
  const esAdmin = idRol === 1;
  const esSupervisor = idRol === 2;
  const esCliente = idRol === 3;

  const puedeGestionarSeguimiento = esAdmin || esSupervisor;
  // Antes de iniciar seguimiento, InterValle debe aprobar el cronograma generado por la cotizacion.
  const cronogramaPendienteInterValle =
    cronograma?.estadoCronograma === "PENDIENTE_APROBACION_EMPRESA" ||
    cronograma?.estadoCronograma === "PENDIENTE_APROBACION_INTERIVALLE";
  const puedeAprobarCronograma = puedeGestionarSeguimiento && cronogramaPendienteInterValle;

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

  const aprobarCronogramaInterValle = async () => {
    if (!cronograma?.idCronograma || !puedeAprobarCronograma) {
      return;
    }

    try {
      setAprobandoCronograma(true);
      await httpClient(
        `${apiUrl}/api/cliente/cronogramas/${cronograma.idCronograma}/aprobar-interivalle`,
        { method: "PUT" }
      );

      notify("Cronograma aprobado. El seguimiento de obra queda en proceso.", {
        type: "success",
      });
      await cargarCronograma();
    } catch (error) {
      console.error("Error aprobando cronograma:", error);
      notify(
        error?.body?.message || error?.message || "No se pudo aprobar el cronograma",
        { type: "error" }
      );
    } finally {
      setAprobandoCronograma(false);
    }
  };

  const abrirEditarCronograma = () => {
    setFormCronograma({
      fechaInicio: cronograma?.fechaInicio || "",
      totalSemanas: semanas.length || cronograma?.totalSemanas || 1,
      detalles: detalles.map((detalle, index) => ({
        tmpId: `actual-${detalle.idDetalle || index}`,
        idDetalle: detalle.idDetalle,
        servicio: detalle.servicio || "Cronograma",
        actividad: detalle.actividad || detalle.descripcion || "",
        descripcion: detalle.descripcion || "",
        semana: Number(detalle.semana || 1),
      })),
    });
    setOpenEditarCronograma(true);
  };

  const cerrarEditarCronograma = () => {
    setOpenEditarCronograma(false);
  };

  const cambiarCampoCronograma = (campo, valor) => {
    setFormCronograma((prev) => ({
      ...prev,
      [campo]: campo === "totalSemanas" ? Math.max(1, Number(valor || 1)) : valor,
    }));
  };

  const cambiarDetalleCronograma = (tmpId, campo, valor) => {
    setFormCronograma((prev) => ({
      ...prev,
      detalles: prev.detalles.map((detalle) =>
        detalle.tmpId === tmpId
          ? {
              ...detalle,
              [campo]: campo === "semana" ? Math.max(1, Number(valor || 1)) : valor,
            }
          : detalle
      ),
    }));
  };

  const agregarActividadCronograma = () => {
    setFormCronograma((prev) => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        {
          tmpId: `nuevo-${Date.now()}`,
          idDetalle: null,
          servicio: "Cronograma",
          actividad: "",
          descripcion: "",
          semana: 1,
        },
      ],
    }));
  };

  const eliminarActividadCronograma = (tmpId) => {
    setFormCronograma((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((detalle) => detalle.tmpId !== tmpId),
    }));
  };

  const guardarCronogramaPendiente = async () => {
    if (!formCronograma.fechaInicio) {
      notify("Selecciona la fecha de inicio", { type: "warning" });
      return;
    }

    if (!formCronograma.detalles.length) {
      notify("El cronograma debe tener al menos una actividad", { type: "warning" });
      return;
    }

    const totalSemanas = Math.max(1, Number(formCronograma.totalSemanas || 1));
    const actividadSinNombre = formCronograma.detalles.some(
      (detalle) => !String(detalle.actividad || "").trim()
    );

    if (actividadSinNombre) {
      notify("Todas las actividades deben tener nombre", { type: "warning" });
      return;
    }

    const semanaFueraRango = formCronograma.detalles.some((detalle) => {
      const semana = Number(detalle.semana || 0);
      return semana < 1 || semana > totalSemanas;
    });

    if (semanaFueraRango) {
      notify(`Las actividades deben estar entre la semana 1 y ${totalSemanas}`, {
        type: "warning",
      });
      return;
    }

    try {
      setGuardandoCronograma(true);
      const { json } = await httpClient(
        `${apiUrl}/api/cliente/cronogramas/${cronograma.idCronograma}/pendiente`,
        {
          method: "PUT",
          body: JSON.stringify({
            fechaInicio: formCronograma.fechaInicio,
            totalSemanas,
            detalles: formCronograma.detalles.map((detalle) => ({
              idDetalle: detalle.idDetalle || null,
              servicio: detalle.servicio || "Cronograma",
              actividad: String(detalle.actividad || "").trim(),
              descripcion: String(detalle.descripcion || "").trim(),
              semana: Number(detalle.semana || 1),
            })),
          }),
        }
      );

      setCronograma(json);
      notify("Cronograma actualizado correctamente", { type: "success" });
      cerrarEditarCronograma();
    } catch (error) {
      console.error("Error actualizando cronograma:", error);
      notify(
        error?.body?.message || error?.message || "No se pudo actualizar el cronograma",
        { type: "error" }
      );
    } finally {
      setGuardandoCronograma(false);
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

  const porcentajePorSemana = useMemo(() => {
    const porcentajes = new Map();

    detalles.forEach((detalle) => {
      const numeroSemana = Number(detalle.semana);
      if (!numeroSemana) return;

      const porcentaje = Number(detalle.porcentaje || 0);
      const porcentajeActual = porcentajes.get(numeroSemana) || 0;
      porcentajes.set(numeroSemana, Math.max(porcentajeActual, porcentaje));
    });

    return porcentajes;
  }, [detalles]);

  const obtenerPorcentajeAcumulado = (detalle) => {
    const numeroSemana = Number(detalle?.semana);
    const totalSemanas = semanas.length;

    if (!numeroSemana || !totalSemanas) {
      return 0;
    }

    let sumaSemanas = 0;
    porcentajePorSemana.forEach((porcentaje, semana) => {
      if (Number(semana) <= numeroSemana) {
        sumaSemanas += Number(porcentaje || 0);
      }
    });

    return Math.min(100, Math.round(sumaSemanas / totalSemanas));
  };

  const totalColumnasTabla =
    2 + (esCliente ? 0 : 1) + semanas.length + 2 + (esSupervisor ? 1 : 0);

  const anchoColumnaSemana = semanas.length >= 9 ? 90 : 105;

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
    if (detalle.estado !== "EN_PROCESO") {
      notify("Solo se pueden editar actividades en estado EN_PROCESO", {
        type: "warning",
      });
      return;
    }

    setDetalleSeleccionado(detalle);
    setFormEdit({
      trabajador: detalle.trabajador || "",
      novedades: detalle.novedades || "",
    });
    setOpenEdit(true);
  };

  const cerrarEdicion = () => {
    setOpenEdit(false);
    setDetalleSeleccionado(null);
    setFormEdit({
      trabajador: "",
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

      await httpClient(`${apiUrl}/api/cliente/cronogramas/detalle/${idDetalle}`, {
        method: "PUT",
        body: JSON.stringify({
          trabajador: formEdit.trabajador,
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
          labelEstado(detalle.estado || "PENDIENTE")
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
    <Box
      sx={{
        width: "100%",
        maxWidth: "calc(100vw - 48px)",
        mx: "auto",
        px: { xs: 1, md: 0 },
        py: 3,
        overflowX: "hidden",
      }}
    >
      <Stack
  direction="row"
  justifyContent="space-between"
  alignItems="center"
  mb={3}
  flexWrap="wrap"
  gap={2}
>
  <Typography variant="h4" fontWeight="bold">
    Cronograma
  </Typography>

    <Stack direction="row" spacing={2} flexWrap="wrap">
    {puedeAprobarCronograma && (
      <Button
        variant="contained"
        color="primary"
        startIcon={<EditIcon />}
        onClick={abrirEditarCronograma}
        sx={{ textTransform: "none", borderRadius: 2 }}
      >
        Editar cronograma
      </Button>
    )}

    {puedeAprobarCronograma && (
      <Button
        variant="contained"
        color="warning"
        disabled={aprobandoCronograma}
        onClick={aprobarCronogramaInterValle}
        sx={{ textTransform: "none", borderRadius: 2 }}
      >
        {aprobandoCronograma ? "Aprobando..." : "Aprobar cronograma"}
      </Button>
    )}

    {puedeGestionarSeguimiento && (
      <Button
        variant="contained"
        color="success"
        disabled={verificandoSeguimiento || tieneSeguimiento || cronogramaPendienteInterValle}
        onClick={() =>
          navigate(`/cronogramas/${cronograma.idCronograma}/seguimiento`)
        }
        sx={{ textTransform: "none", borderRadius: 2 }}
      >
        Crear seguimiento
      </Button>
    )}

    {puedeGestionarSeguimiento ? (
      <Button
        variant="contained"
        disabled={verificandoSeguimiento || !tieneSeguimiento || cronogramaPendienteInterValle}
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
        disabled={cronogramaPendienteInterValle}
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

      {cronogramaPendienteInterValle && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            border: "1px solid #90CAF9",
            bgcolor: "#E3F2FD",
            color: "#0D47A1",
          }}
        >
          <Typography fontWeight="bold">
            El cronograma está pendiente de aprobación por parte de la empresa.
          </Typography>
          <Typography variant="body2">
            El seguimiento de obra se habilitará cuando un administrador o supervisor apruebe la programación.
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          mb: 3,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(180px, 1fr))",
            md: "repeat(5, minmax(150px, 180px))",
            lg: "repeat(5, minmax(150px, 180px))",
          },
          gap: 2,
          alignItems: "stretch",
        }}
      >
        <Box>
          <Card sx={resumenCardSx}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Proyecto
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {cronograma.nombreProyecto || "Sin nombre"}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={resumenCardSx}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Estado cronograma
              </Typography>
              <Chip
                label={labelEstado(cronograma.estadoCronograma || "EN_PROCESO")}
                color={
                  getEstadoColor(cronograma.estadoCronograma).chip === "default"
                    ? undefined
                    : getEstadoColor(cronograma.estadoCronograma).chip
                }
                sx={{ mt: 1, fontWeight: "bold" }}
              />
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={resumenCardSx}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Fecha inicio
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {cronograma.fechaInicio || "-"}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={resumenCardSx}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Fecha fin
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {cronograma.fechaFin || "-"}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={resumenCardSx}>
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
        </Box>
      </Box>

      <Card sx={{ borderRadius: 4, boxShadow: 4, width: "100%" }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Plan de actividades
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              overflowX: "hidden",
              width: "100%",
            }}
          >
            <Table
              size="small"
              sx={{
                width: "100%",
                tableLayout: "fixed",
                "& .MuiTableCell-root": {
                  px: { xs: 0.6, md: 0.8 },
                  py: 1.2,
                  verticalAlign: "middle",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                },
              }}
            >
              <TableHead>
                <TableRow sx={{ backgroundColor: "#E8F5E9" }}>
                  <TableCell sx={{ fontWeight: "bold", width: 210 }}>Actividad</TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: 130 }}>Estado</TableCell>
                  {!esCliente && (
                    <TableCell sx={{ fontWeight: "bold", width: 120 }}>Trabajador</TableCell>
                  )}

                  {semanas.map((semana) => (
                    <TableCell
                      key={semana.numero}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        width: anchoColumnaSemana,
                        minWidth: 0,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          fontWeight="bold"
                          display="block"
                          sx={{ lineHeight: 1.2 }}
                        >
                          Semana {semana.numero}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ lineHeight: 1.25 }}>
                          {semana.inicio}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ lineHeight: 1.25 }}>
                          {semana.fin}
                        </Typography>
                      </Box>
                    </TableCell>
                  ))}

                  <TableCell sx={{ fontWeight: "bold", width: 58 }}>%</TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: esCliente ? 100 : 150 }}>
                    Novedades
                  </TableCell>
                  {esSupervisor && (
                    <TableCell sx={{ fontWeight: "bold", width: 105 }}>Acciones</TableCell>
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {detalles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={totalColumnasTabla}
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
                            label={labelEstado(detalle.estado || "PENDIENTE")}
                            sx={{
                              fontWeight: "bold",
                              backgroundColor: estiloEstado.bg,
                              color: estiloEstado.text,
                            }}
                          />
                        </TableCell>

                        {!esCliente && (
                          <TableCell>{detalle.trabajador || "-"}</TableCell>
                        )}

                        {semanas.map((semana) => (
                          <TableCell
                            key={`${detalle.idDetalle || index}-sem-${semana.numero}`}
                            align="center"
                            sx={{ width: anchoColumnaSemana }}
                          >
                            {renderBarraSemana(detalle, semana)}
                          </TableCell>
                        ))}

                        <TableCell align="center">
                          {obtenerPorcentajeAcumulado(detalle)}%
                        </TableCell>

                        <TableCell>
                          {detalle.novedades || "-"}
                        </TableCell>

                        {esSupervisor && (
                          <TableCell>
                            {detalle.estado === "EN_PROCESO" ? (
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
                            ) : (
                              "-"
                            )}
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
        open={openEditarCronograma}
        onClose={cerrarEditarCronograma}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Editar cronograma pendiente</DialogTitle>

        <DialogContent>
          <Box mt={1} display="flex" flexDirection="column" gap={3}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Fecha inicio"
                type="date"
                value={formCronograma.fechaInicio}
                onChange={(event) =>
                  cambiarCampoCronograma("fechaInicio", event.target.value)
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Número de semanas"
                type="number"
                value={formCronograma.totalSemanas}
                onChange={(event) =>
                  cambiarCampoCronograma("totalSemanas", event.target.value)
                }
                fullWidth
                inputProps={{ min: 1, max: 52 }}
              />
            </Stack>

            <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
              <Typography variant="h6" fontWeight="bold">
                Actividades
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={agregarActividadCronograma}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Agregar actividad
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#E8F5E9" }}>
                    <TableCell sx={{ fontWeight: "bold", width: "18%" }}>
                      Servicio
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "26%" }}>
                      Actividad
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "34%" }}>
                      Descripción
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: 110 }}>
                      Semana
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: 90 }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formCronograma.detalles.map((detalle) => (
                    <TableRow key={detalle.tmpId}>
                      <TableCell>
                        <TextField
                          value={detalle.servicio}
                          onChange={(event) =>
                            cambiarDetalleCronograma(
                              detalle.tmpId,
                              "servicio",
                              event.target.value
                            )
                          }
                          size="small"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={detalle.actividad}
                          onChange={(event) =>
                            cambiarDetalleCronograma(
                              detalle.tmpId,
                              "actividad",
                              event.target.value
                            )
                          }
                          size="small"
                          fullWidth
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={detalle.descripcion}
                          onChange={(event) =>
                            cambiarDetalleCronograma(
                              detalle.tmpId,
                              "descripcion",
                              event.target.value
                            )
                          }
                          size="small"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={detalle.semana}
                          onChange={(event) =>
                            cambiarDetalleCronograma(
                              detalle.tmpId,
                              "semana",
                              event.target.value
                            )
                          }
                          size="small"
                          fullWidth
                          inputProps={{
                            min: 1,
                            max: Math.max(1, Number(formCronograma.totalSemanas || 1)),
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Eliminar actividad">
                          <span>
                            <Button
                              color="error"
                              variant="outlined"
                              size="small"
                              onClick={() => eliminarActividadCronograma(detalle.tmpId)}
                              disabled={formCronograma.detalles.length <= 1}
                              sx={{ minWidth: 42 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </Button>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={cerrarEditarCronograma}>Cancelar</Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={guardarCronogramaPendiente}
            disabled={guardandoCronograma}
          >
            {guardandoCronograma ? "Guardando..." : "Guardar cronograma"}
          </Button>
        </DialogActions>
      </Dialog>

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

            <TextField
              label="Trabajador"
              name="trabajador"
              value={formEdit.trabajador}
              onChange={handleChangeEdit}
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
