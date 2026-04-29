import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button
} from "@mui/material";
import { useNotify } from "react-admin";
import httpClient, { apiUrl } from "../../app/httpClient";

const horariosVisita = [
  { value: "08:00", label: "08:00 AM" },
  { value: "09:00", label: "09:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "16:00", label: "04:00 PM" },
  { value: "17:00", label: "05:00 PM" }
];

const SolicitudReprogramar = () => {
  const { idSolicitud } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({
    idSolicitud: "",
    nombreProyecto: "",
    fechaVisita: "",
    horaVisita: "08:00",
    direccionVisita: "",
    celularCliente: "",
    estado: ""
  });

  const obtenerFechaMinima = () => {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1);
    return hoy.toISOString().split("T")[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validarHoraVisita = (hora) => {
    const horasPermitidas = [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00"
    ];
    return horasPermitidas.includes(hora);
  };

  const esFechaFutura = (fecha) => {
    if (!fecha) return false;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaIngresada = new Date(fecha + "T00:00:00");
    return fechaIngresada > hoy;
  };

  const cargarSolicitud = async () => {
    try {
      setLoading(true);

      const { json } = await httpClient(
        `${apiUrl}/api/solicitudes/${idSolicitud}`
      );

      setFormData({
        idSolicitud: json?.idSolicitud || "",
        nombreProyecto: json?.nombreProyecto || "",
        fechaVisita: json?.fechaVisita || "",
        horaVisita: json?.horaVisita ? json.horaVisita.slice(0, 5) : "08:00",
        direccionVisita: json?.direccionVisita || "",
        celularCliente: json?.celularCliente || "",
        estado: json?.estado || ""
      });
    } catch (error) {
      console.error(error);
      notify(
        error?.body?.message ||
          error?.message ||
          "No se pudo cargar la visita técnica",
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

  const handleReprogramar = async () => {
    if (!formData.fechaVisita) {
      notify("La fecha de visita es obligatoria", { type: "warning" });
      return;
    }

    if (!esFechaFutura(formData.fechaVisita)) {
      notify("La fecha debe ser futura", { type: "warning" });
      return;
    }

    if (!formData.horaVisita) {
      notify("La hora de visita es obligatoria", { type: "warning" });
      return;
    }

    if (!validarHoraVisita(formData.horaVisita)) {
      notify("La hora debe estar entre 8 a 12 AM o 2 a 5 PM", {
        type: "warning"
      });
      return;
    }

    try {
      setGuardando(true);

      await httpClient(
        `${apiUrl}/api/solicitudes/${idSolicitud}/reprogramar`,
        {
          method: "PUT",
          body: JSON.stringify({
            fechaVisita: formData.fechaVisita,
            horaVisita: formData.horaVisita
          }),
          headers: new Headers({
            "Content-Type": "application/json"
          })
        }
      );

      notify("Visita técnica reprogramada correctamente", {
        type: "success"
      });

      navigate("/solicitudes");
    } catch (error) {
      console.error(error);
      notify(
        error?.body?.message ||
          error?.message ||
          "No se pudo reprogramar la visita",
        { type: "error" }
      );
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Card sx={{ maxWidth: 980, mx: "auto", borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" mb={3}>
            Reprogramar Visita Técnica
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Número de Solicitud"
                fullWidth
                value={formData.idSolicitud}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                label="Nombre del Proyecto"
                fullWidth
                value={formData.nombreProyecto}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Estado"
                fullWidth
                value={formData.estado}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                type="date"
                label="Fecha de Visita"
                name="fechaVisita"
                fullWidth
                value={formData.fechaVisita}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: obtenerFechaMinima() }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Hora de Visita"
                name="horaVisita"
                fullWidth
                value={formData.horaVisita}
                onChange={handleChange}
              >
                {horariosVisita.map((hora) => (
                  <MenuItem key={hora.value} value={hora.value}>
                    {hora.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Dirección del Proyecto"
                fullWidth
                value={formData.direccionVisita}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Número Celular del Cliente"
                fullWidth
                value={formData.celularCliente}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" mt={4} gap={2}>
            <Button
              variant="outlined"
              onClick={() => navigate("/solicitudes")}
              disabled={guardando}
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              onClick={handleReprogramar}
              disabled={guardando}
              sx={{
                backgroundColor: "#0aa000",
                "&:hover": { backgroundColor: "#088500" }
              }}
            >
              {guardando ? "Reprogramando..." : "Reprogramar"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SolicitudReprogramar;