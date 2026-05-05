import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button
} from "@mui/material";
import { useNotify } from "react-admin";
import httpClient, { apiUrl } from "../../app/httpClient";

const serviciosDisponibles = [
  { id: 1, nombre: "Mano de Obra" },
  { id: 2, nombre: "Carpintería" },
  { id: 3, nombre: "Divisiones en Vidrio" },
  { id: 4, nombre: "Mesones en Mármol" }
];

const tiposSolicitud = [
  { value: "COTIZACION_BASE", label: "Cotización Base" },
  { value: "VISITA_TECNICA", label: "Visita Técnica" }
];

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

const SolicitudCreate = () => {
  const navigate = useNavigate();
  const notify = useNotify();

  const correoUsuario = localStorage.getItem("correoUsuario");

  const [formData, setFormData] = React.useState({
    tipoSolicitud: "COTIZACION_BASE",
    nombreProyecto: "",
    fechaVisita: "",
    horaVisita: "08:00",
    direccionVisita: "",
    celularCliente: ""
  });

  const [serviciosSeleccionados, setServiciosSeleccionados] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [idSolicitud, setIdSolicitud] = React.useState(null);

  const esVisitaTecnica = formData.tipoSolicitud === "VISITA_TECNICA";

  React.useEffect(() => {
    localStorage.removeItem("idSolicitud");
    localStorage.removeItem("serviciosSeleccionados");
    localStorage.removeItem("tipoSolicitud");
    localStorage.removeItem("nombreProyecto");
    localStorage.removeItem("fechaVisita");
    localStorage.removeItem("horaVisita");
    localStorage.removeItem("direccionVisita");
    localStorage.removeItem("celularCliente");
  }, []);

  const obtenerFechaMinima = () => {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1);
    return hoy.toISOString().split("T")[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "nombreProyecto"
          ? value.toUpperCase()
          : name === "celularCliente"
          ? value.replace(/\D/g, "")
          : value
    }));
  };

  const handleTipoSolicitudChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      tipoSolicitud: value,
      fechaVisita: value === "VISITA_TECNICA" ? prev.fechaVisita : "",
      horaVisita: value === "VISITA_TECNICA" ? prev.horaVisita : "08:00",
      direccionVisita: value === "VISITA_TECNICA" ? prev.direccionVisita : "",
      celularCliente: value === "VISITA_TECNICA" ? prev.celularCliente : ""
    }));

    if (value === "VISITA_TECNICA") {
      setServiciosSeleccionados([]);
    }
  };

  const handleServicioChange = (id) => {
    if (serviciosSeleccionados.includes(id)) {
      setServiciosSeleccionados(serviciosSeleccionados.filter((s) => s !== id));
    } else {
      setServiciosSeleccionados([...serviciosSeleccionados, id]);
    }
  };

  const esFechaFutura = (fecha) => {
    if (!fecha) return false;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaIngresada = new Date(fecha + "T00:00:00");
    return fechaIngresada > hoy;
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

  const validarFormulario = () => {
    if (!formData.tipoSolicitud) {
      notify("Seleccione el tipo de solicitud", { type: "warning" });
      return false;
    }

    if (!formData.nombreProyecto || !formData.nombreProyecto.trim()) {
      notify("Ingrese el nombre del proyecto", { type: "warning" });
      return false;
    }

    if (formData.tipoSolicitud === "COTIZACION_BASE") {
      if (serviciosSeleccionados.length === 0) {
        notify("Seleccione al menos un servicio", { type: "warning" });
        return false;
      }
    }

    if (formData.tipoSolicitud === "VISITA_TECNICA") {
      if (!formData.fechaVisita) {
        notify("Ingrese la fecha de la visita técnica", { type: "warning" });
        return false;
      }

      if (!esFechaFutura(formData.fechaVisita)) {
        notify("La fecha de visita debe ser futura", { type: "warning" });
        return false;
      }

      if (!formData.horaVisita) {
        notify("Seleccione la hora de la visita técnica", { type: "warning" });
        return false;
      }

      if (!validarHoraVisita(formData.horaVisita)) {
        notify("La hora debe estar entre 8 a 12 M o 2 a 5 PM", {
          type: "warning"
        });
        return false;
      }

      if (!formData.direccionVisita || !formData.direccionVisita.trim()) {
        notify("Ingrese la dirección del proyecto", { type: "warning" });
        return false;
      }

      if (!formData.celularCliente || !formData.celularCliente.trim()) {
        notify("Ingrese el número celular del cliente", { type: "warning" });
        return false;
      }

      if (formData.celularCliente.length < 10) {
        notify("El número celular debe tener al menos 10 dígitos", {
          type: "warning"
        });
        return false;
      }
    }

    return true;
  };

  const construirPayload = () => {
    return {
      correoUsuario,
      tipoSolicitud: formData.tipoSolicitud,
      nombreProyecto: formData.nombreProyecto.trim(),
      servicios: esVisitaTecnica ? [] : serviciosSeleccionados,
      fechaVisita: esVisitaTecnica ? formData.fechaVisita : null,
      horaVisita: esVisitaTecnica ? formData.horaVisita : null,
      direccionVisita: esVisitaTecnica ? formData.direccionVisita.trim() : null,
      celularCliente: esVisitaTecnica ? formData.celularCliente.trim() : null
    };
  };

  const guardarEnLocalStorage = (solicitudId) => {
    localStorage.setItem("idSolicitud", solicitudId);
    localStorage.setItem(
      "serviciosSeleccionados",
      JSON.stringify(serviciosSeleccionados)
    );
    localStorage.setItem("tipoSolicitud", formData.tipoSolicitud);
    localStorage.setItem("nombreProyecto", formData.nombreProyecto.trim());

    if (esVisitaTecnica) {
      localStorage.setItem("fechaVisita", formData.fechaVisita);
      localStorage.setItem("horaVisita", formData.horaVisita);
      localStorage.setItem("direccionVisita", formData.direccionVisita);
      localStorage.setItem("celularCliente", formData.celularCliente);
    }
  };

  const crearNuevaSolicitud = async () => {
    const payload = construirPayload();

    console.log("Payload solicitud:", payload);

    const { json } = await httpClient(`${apiUrl}/api/solicitudes`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: new Headers({
        "Content-Type": "application/json"
      })
    });

    console.log("Solicitud creada:", json);

    if (!json?.idSolicitud) {
      throw new Error("La solicitud se creó, pero no se recibió el idSolicitud");
    }

    return json;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);

      const json = await crearNuevaSolicitud();

      setIdSolicitud(json.idSolicitud);
      guardarEnLocalStorage(json.idSolicitud);

      notify("Solicitud guardada en estado PENDIENTE", { type: "success" });
      navigate("/solicitudes");
    } catch (error) {
      console.error(error);
      notify(
        error?.body?.message ||
          error?.message ||
          "Error al guardar la solicitud",
        { type: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProcesarSolicitud = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);

      const json = await crearNuevaSolicitud();
      const solicitudIdNueva = json.idSolicitud;

      setIdSolicitud(solicitudIdNueva);
      guardarEnLocalStorage(solicitudIdNueva);

      if (formData.tipoSolicitud === "COTIZACION_BASE") {
        notify("Solicitud creada correctamente. Estado: PENDIENTE", {
          type: "success"
        });

        navigate("/cotizacion-base");
      } else {
        notify("Visita técnica creada correctamente", {
          type: "success"
        });

        navigate("/solicitudes");
      }
    } catch (error) {
      console.error(error);
      notify(
        error?.body?.message ||
          error?.message ||
          "Error al procesar la solicitud",
        { type: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Card sx={{ maxWidth: 900, mx: "auto", borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" mb={3}>
            Crear Solicitud
          </Typography>

          <Box component="form" onSubmit={(e) => e.preventDefault()}>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Tipo de Solicitud"
                  name="tipoSolicitud"
                  value={formData.tipoSolicitud}
                  onChange={handleTipoSolicitudChange}
                >
                  {tiposSolicitud.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre del Proyecto"
                  name="nombreProyecto"
                  value={formData.nombreProyecto}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            {!esVisitaTecnica && (
              <>
                <Typography variant="h6" mb={1}>
                  Seleccione los servicios a cotizar
                </Typography>

                <Grid container>
                  {serviciosDisponibles.map((servicio) => (
                    <Grid item xs={12} md={6} key={servicio.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={serviciosSeleccionados.includes(servicio.id)}
                            onChange={() => handleServicioChange(servicio.id)}
                          />
                        }
                        label={servicio.nombre}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {esVisitaTecnica && (
              <>
                <Typography variant="h6" mb={2}>
                  Datos de la Visita Técnica
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Fecha de Visita"
                      name="fechaVisita"
                      value={formData.fechaVisita}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: obtenerFechaMinima() }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Hora de Visita"
                      name="horaVisita"
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

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Dirección del Proyecto"
                      name="direccionVisita"
                      value={formData.direccionVisita}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Número Celular del Cliente"
                      name="celularCliente"
                      value={formData.celularCliente}
                      onChange={handleChange}
                      inputProps={{ maxLength: 10 }}
                    />
                  </Grid>
                </Grid>
              </>
            )}

            <Box display="flex" justifyContent="flex-end" mt={4} gap={2}>
              <Button
                variant="outlined"
                onClick={() => navigate("/solicitudes")}
                disabled={loading}
              >
                Cancelar
              </Button>

              {!esVisitaTecnica && (
              <Button
                variant="contained"
                onClick={handleGuardar}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            )}

              <Button
                variant="contained"
                onClick={handleProcesarSolicitud}
                disabled={loading}
                sx={{
                  backgroundColor: "#2e7d32",
                  "&:hover": { backgroundColor: "#1b5e20" }
                }}
              >
                {loading
                  ? "Procesando..."
                  : esVisitaTecnica
                  ? "Crear Visita"
                  : "Siguiente.."}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SolicitudCreate;
