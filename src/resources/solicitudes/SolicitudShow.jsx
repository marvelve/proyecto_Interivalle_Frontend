import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Chip
} from "@mui/material";
import { useNotify } from "react-admin";
import httpClient, { apiUrl } from "../../app/httpClient";

const SolicitudShow = () => {
  const { idSolicitud } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();

  const idRol = String(localStorage.getItem("idRol") || "");
  const esAdmin = idRol === "1";
  const esSupervisor = idRol === "2";
  const puedeMarcarRealizada = esAdmin || esSupervisor;

  const [loading, setLoading] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [marcandoRealizada, setMarcandoRealizada] = useState(false);
  const [solicitud, setSolicitud] = useState(null);

  const cargarSolicitud = async () => {
    try {
      setLoading(true);

      const { json } = await httpClient(
        `${apiUrl}/api/solicitudes/${idSolicitud}`
      );

      setSolicitud(json);
    } catch (error) {
      console.error(error);
      notify(
        error?.body?.message ||
          error?.message ||
          "No se pudo cargar la solicitud",
        { type: "error" }
      );
      navigate("/solicitudes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitud();
  }, [idSolicitud]);

  const handleMarcarRealizada = async () => {
    try {
      setMarcandoRealizada(true);
      const { json } = await httpClient(`${apiUrl}/api/solicitudes/${idSolicitud}/realizada`, {
        method: "PUT",
        headers: new Headers({
          "Content-Type": "application/json"
        })
      });

      notify("Visita técnica marcada como REALIZADA", {
        type: "success"
      });

      setSolicitud(json);
    } catch (error) {
      console.error(error);
      notify(
        error?.body?.message ||
          error?.message ||
          "No se pudo marcar la visita como realizada",
        { type: "error" }
      );
    } finally {
      setMarcandoRealizada(false);
    }
  };

  const handleConfirmarVisita = async () => {
    try {
      setConfirmando(true);

      const { json } = await httpClient(
        `${apiUrl}/api/solicitudes/${idSolicitud}/confirmar-visita`,
        {
          method: "PUT",
          headers: new Headers({
            "Content-Type": "application/json"
          })
        }
      );

      notify("Visita tecnica confirmada y notificada al cliente", {
        type: "success"
      });

      setSolicitud(json);
    } catch (error) {
      console.error(error);
      notify(
        error?.body?.message ||
          error?.message ||
          "No se pudo confirmar la visita tecnica",
        { type: "error" }
      );
    } finally {
      setConfirmando(false);
    }
  };

  const renderEstado = (estado) => {
    if (estado === "PENDIENTE") {
      return <Chip label="PENDIENTE" color="warning" />;
    }

    if (estado === "GENERADA") {
      return <Chip label="GENERADA" color="success" />;
    }

    if (estado === "REPROGRAMADA") {
      return <Chip label="REPROGRAMADA" color="secondary" />;
    }

    if (estado === "CONFIRMADA") {
      return <Chip label="CONFIRMADA" color="primary" />;
    }

    if (estado === "REALIZADA") {
      return <Chip label="REALIZADA" color="success" />;
    }

    if (estado === "BORRADOR") {
      return <Chip label="BORRADOR" color="info" />;
    }

    return <Chip label={estado || "-"} />;
  };

  const renderServicios = () => {
    if (
      !solicitud?.solicitudServicios ||
      solicitud.solicitudServicios.length === 0
    ) {
      return "Sin servicios";
    }

    return solicitud.solicitudServicios
      .map((servicio) => servicio.nombreServicio)
      .join(", ");
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  if (!solicitud) {
    return (
      <Box p={3}>
        <Typography>No se encontró la solicitud.</Typography>
      </Box>
    );
  }

  const esVisitaTecnica = solicitud.tipoSolicitud === "VISITA_TECNICA";
  const visitaEditable =
    solicitud?.estado === "PENDIENTE" ||
    solicitud?.estado === "REPROGRAMADA";
  const visitaPuedeRealizarse =
    visitaEditable ||
    solicitud?.estado === "CONFIRMADA";
  const puedeConfirmarVisita =
    esVisitaTecnica && esSupervisor && visitaEditable;
  const puedeMarcarVisitaRealizada =
    esVisitaTecnica && puedeMarcarRealizada && visitaPuedeRealizarse;

  return (
    <Box p={3}>
      <Card sx={{ maxWidth: 1000, mx: "auto", borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" mb={3}>
            Solicitud
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Número Solicitud"
                fullWidth
                value={solicitud.idSolicitud || ""}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                label="Proyecto"
                fullWidth
                value={solicitud.nombreProyecto || ""}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Tipo Solicitud"
                fullWidth
                value={solicitud.tipoSolicitud || ""}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Correo Usuario"
                fullWidth
                value={solicitud.correoUsuario || ""}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Fecha Solicitud"
                fullWidth
                value={solicitud.fechaSolicitud || ""}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Box>
                <Typography variant="body2" fontWeight="bold" mb={1}>
                  Estado
                </Typography>
                {renderEstado(solicitud.estado)}
              </Box>
            </Grid>

            {esVisitaTecnica ? (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Fecha de Visita"
                    fullWidth
                    value={solicitud.fechaVisita || ""}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Hora de Visita"
                    fullWidth
                    value={solicitud.horaVisita || ""}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Número Celular"
                    fullWidth
                    value={solicitud.celularCliente || ""}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Dirección del Proyecto"
                    fullWidth
                    value={solicitud.direccionVisita || ""}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <TextField
                  label="Servicios"
                  fullWidth
                  value={renderServicios()}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            )}
          </Grid>

          <Box display="flex" justifyContent="flex-end" mt={4} gap={2}>
            <Button
              variant="outlined"
              onClick={() => navigate("/solicitudes")}
            >
              Volver
            </Button>

            {puedeConfirmarVisita && (
              <Button
                variant="contained"
                color="success"
                onClick={handleConfirmarVisita}
                disabled={confirmando}
              >
                {confirmando ? "Confirmando..." : "Confirmar"}
              </Button>
            )}

            {puedeMarcarVisitaRealizada && (
              <Button
                variant="contained"
                onClick={handleMarcarRealizada}
                disabled={marcandoRealizada}
                sx={{
                  backgroundColor: "#2e7d32",
                  "&:hover": { backgroundColor: "#1b5e20" }
                }}
              >
                {marcandoRealizada ? "Guardando..." : "Realizada"}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SolicitudShow;
