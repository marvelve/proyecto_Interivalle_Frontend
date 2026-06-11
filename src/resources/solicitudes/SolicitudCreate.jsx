import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useNotify } from "react-admin";
import httpClient, { apiUrl } from "../../app/httpClient";

const SERVICIOS_DISPONIBLES = [
  { id: 1, nombre: "Mano de Obra" },
  { id: 2, nombre: "Carpintería" },
  { id: 3, nombre: "Divisiones en Vidrio" },
  { id: 4, nombre: "Mesones en Mármol" },
];

const TIPOS_SOLICITUD = [
  { value: "COTIZACION_BASE", label: "Cotización Base" },
  { value: "VISITA_TECNICA", label: "Visita Técnica" },
];

const HORARIOS_VISITA = [
  { value: "08:00", label: "08:00 AM" },
  { value: "09:00", label: "09:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "16:00", label: "04:00 PM" },
  { value: "17:00", label: "05:00 PM" },
];

const FORM_INICIAL = {
  tipoSolicitud: "COTIZACION_BASE",
  nombreProyecto: "",
  fechaVisita: "",
  horaVisita: "08:00",
  direccionVisita: "",
  celularCliente: "",
};

const limpiarDatosSolicitudLocal = () => {
  localStorage.removeItem("idSolicitud");
  localStorage.removeItem("serviciosSeleccionados");
  localStorage.removeItem("tipoSolicitud");
  localStorage.removeItem("nombreProyecto");
  localStorage.removeItem("fechaVisita");
  localStorage.removeItem("horaVisita");
  localStorage.removeItem("direccionVisita");
  localStorage.removeItem("celularCliente");
};

const obtenerServiciosGuardados = () => {
  try {
    const servicios = JSON.parse(
      localStorage.getItem("serviciosSeleccionados") || "[]"
    );

    return Array.isArray(servicios) ? servicios.map(Number) : [];
  } catch (error) {
    return [];
  }
};

const obtenerFechaMinima = () => {
  const hoy = new Date();
  hoy.setDate(hoy.getDate() + 1);
  return hoy.toISOString().split("T")[0];
};

const esFechaFutura = (fecha) => {
  if (!fecha) return false;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaIngresada = new Date(`${fecha}T00:00:00`);
  return fechaIngresada > hoy;
};

const validarHoraVisita = (hora) =>
  HORARIOS_VISITA.some((item) => item.value === hora);

const SolicitudCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();

  const correoUsuario = localStorage.getItem("correoUsuario");

  const [formData, setFormData] = React.useState(FORM_INICIAL);
  const [serviciosSeleccionados, setServiciosSeleccionados] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [idSolicitud, setIdSolicitud] = React.useState(null);

  const esVisitaTecnica = formData.tipoSolicitud === "VISITA_TECNICA";
  const actualizandoSolicitudBase =
    location.state?.conservarDatosCotizacionBase === true;
  const idCotizacionRetorno = location.state?.idCotizacionRetorno;

  React.useEffect(() => {
    const conservarDatos =
      location.state?.conservarDatosCotizacionBase === true;

    if (!conservarDatos) {
      limpiarDatosSolicitudLocal();
      return;
    }

    setFormData((prev) => ({
      ...prev,
      tipoSolicitud:
        localStorage.getItem("tipoSolicitud") || prev.tipoSolicitud,
      nombreProyecto:
        localStorage.getItem("nombreProyecto") || prev.nombreProyecto,
      fechaVisita: localStorage.getItem("fechaVisita") || prev.fechaVisita,
      horaVisita: localStorage.getItem("horaVisita") || prev.horaVisita,
      direccionVisita:
        localStorage.getItem("direccionVisita") || prev.direccionVisita,
      celularCliente:
        localStorage.getItem("celularCliente") || prev.celularCliente,
    }));
    setServiciosSeleccionados(obtenerServiciosGuardados());
    setIdSolicitud(localStorage.getItem("idSolicitud"));
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "nombreProyecto"
          ? value.toUpperCase()
          : name === "celularCliente"
          ? value.replace(/\D/g, "")
          : value,
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
      celularCliente: value === "VISITA_TECNICA" ? prev.celularCliente : "",
    }));

    // Las visitas tecnicas no llevan servicios seleccionados.
    if (value === "VISITA_TECNICA") {
      setServiciosSeleccionados([]);
    }
  };

  const handleServicioChange = (id) => {
    setServiciosSeleccionados((prev) =>
      prev.includes(id)
        ? prev.filter((servicioId) => servicioId !== id)
        : [...prev, id]
    );
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

    // Cotizacion base requiere al menos un servicio.
    if (formData.tipoSolicitud === "COTIZACION_BASE" && serviciosSeleccionados.length === 0) {
      notify("Seleccione al menos un servicio", { type: "warning" });
      return false;
    }

    if (formData.tipoSolicitud === "VISITA_TECNICA") {
      // Visita tecnica requiere fecha futura, hora permitida y datos de contacto.
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
          type: "warning",
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
          type: "warning",
        });
        return false;
      }
    }

    return true;
  };

  const construirPayload = () => ({
    correoUsuario,
    tipoSolicitud: formData.tipoSolicitud,
    nombreProyecto: formData.nombreProyecto.trim(),
    servicios: esVisitaTecnica ? [] : serviciosSeleccionados,
    fechaVisita: esVisitaTecnica ? formData.fechaVisita : null,
    horaVisita: esVisitaTecnica ? formData.horaVisita : null,
    direccionVisita: esVisitaTecnica ? formData.direccionVisita.trim() : null,
    celularCliente: esVisitaTecnica ? formData.celularCliente.trim() : null,
  });

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

    // Envia la solicitud al backend. El token se agrega desde httpClient.
    const { json } = await httpClient(`${apiUrl}/api/solicitudes`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });

    if (!json?.idSolicitud) {
      throw new Error("La solicitud se creó, pero no se recibió el idSolicitud");
    }

    return json;
  };

  const actualizarSolicitudExistente = async () => {
    const solicitudIdActual = idSolicitud || localStorage.getItem("idSolicitud");

    if (!solicitudIdActual) {
      throw new Error("No se encontrÃ³ la solicitud para actualizar servicios");
    }

    const payload = construirPayload();

    const { json } = await httpClient(
      `${apiUrl}/api/solicitudes/${solicitudIdActual}/servicios`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      }
    );

    if (!json?.idSolicitud) {
      throw new Error("La solicitud se actualizÃ³, pero no se recibiÃ³ el idSolicitud");
    }

    return json;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);

      const json = actualizandoSolicitudBase
        ? await actualizarSolicitudExistente()
        : await crearNuevaSolicitud();

      setIdSolicitud(json.idSolicitud);
      guardarEnLocalStorage(json.idSolicitud);

      notify(
        actualizandoSolicitudBase
          ? "Servicios de la solicitud actualizados"
          : "Solicitud guardada en estado PENDIENTE",
        { type: "success" }
      );
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

      const json = actualizandoSolicitudBase
        ? await actualizarSolicitudExistente()
        : await crearNuevaSolicitud();
      const solicitudIdNueva = json.idSolicitud;

      setIdSolicitud(solicitudIdNueva);
      guardarEnLocalStorage(solicitudIdNueva);

      if (formData.tipoSolicitud === "COTIZACION_BASE") {
        notify(
          actualizandoSolicitudBase
            ? "Servicios actualizados. Complete la cotizacion nuevamente."
            : "Solicitud creada correctamente. Estado: PENDIENTE",
          { type: "success" }
        );

        navigate(
          idCotizacionRetorno
            ? `/cotizacion-base/${idCotizacionRetorno}/editar`
            : "/cotizacion-base"
        );
      } else {
        notify("Visita técnica creada correctamente", {
          type: "success",
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
                  {TIPOS_SOLICITUD.map((tipo) => (
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
                  {SERVICIOS_DISPONIBLES.map((servicio) => (
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
                      {HORARIOS_VISITA.map((hora) => (
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
                  variant="outlined"
                  onClick={handleGuardar}
                  disabled={loading}
                  sx={{
                    bgcolor: "#ffffff",
                    color: "#2e7d32",
                    borderColor: "#2e7d32",
                    "&:hover": {
                      bgcolor: "#f7fbf7",
                      borderColor: "#1b5e20",
                    },
                  }}
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
                  "&:hover": { backgroundColor: "#1b5e20" },
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
