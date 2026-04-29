import * as React from "react";
import {
  Title,
  useNotify,
  useRedirect,
  useDataProvider,
} from "react-admin";
import {
  Card,
  CardContent,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  TextField,
  Button,
  FormGroup,
  Divider,
} from "@mui/material";
import logo from "../imagenes/Logo_interivalle.jpg";

const serviciosDisponibles = [
  { id: 1, nombre: "Mano de Obra y Materiales" },
  { id: 2, nombre: "Carpintería" },
  { id: 3, nombre: "Divisiones en Vidrio" },
  { id: 4, nombre: "Mesón Granito" },
];

const SolicitudSelector = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const dataProvider = useDataProvider();

  const [tipoSolicitud, setTipoSolicitud] = React.useState("");
  const [nombreProyecto, setNombreProyecto] = React.useState("");
  const [serviciosSeleccionados, setServiciosSeleccionados] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  // Ajusta esta línea si en login guardas otro nombre
  const correoUsuario = localStorage.getItem("correoUsuario") || "";

  const handleTipoChange = (event) => {
    setTipoSolicitud(event.target.value);
    setServiciosSeleccionados([]);
  };

  const handleServicioChange = (idServicio) => {
    setServiciosSeleccionados((prev) =>
      prev.includes(idServicio)
        ? prev.filter((id) => id !== idServicio)
        : [...prev, idServicio]
    );
  };

  const validarFormulario = () => {
    if (!correoUsuario) {
      notify("No se encontró el correo del usuario logueado", { type: "warning" });
      return false;
    }

    if (!tipoSolicitud) {
      notify("Debe seleccionar un tipo de solicitud", { type: "warning" });
      return false;
    }

    if (serviciosSeleccionados.length === 0) {
      notify("Debe seleccionar al menos un servicio", { type: "warning" });
      return false;
    }

    if (!nombreProyecto.trim()) {
      notify("Debe ingresar el nombre del proyecto", { type: "warning" });
      return false;
    }

    return true;
  };

  const handleContinuar = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    const payload = {
      correoUsuario,
      tipoSolicitud,
      nombreProyecto,
      servicios: serviciosSeleccionados,
    };

    console.log("Payload enviado:", payload);

    try {
      setLoading(true);

      const response = await dataProvider.create("solicitudes", {
        data: payload,
      });

      console.log("Respuesta backend:", response);

      const solicitudCreada = response.data;

      notify("Solicitud creada correctamente", { type: "success" });

      localStorage.setItem("tipoSolicitud", tipoSolicitud);
      localStorage.setItem("nombreProyecto", nombreProyecto);
      localStorage.setItem(
        "serviciosSeleccionados",
        JSON.stringify(serviciosSeleccionados)
      );

      if (solicitudCreada?.id) {
        localStorage.setItem("idSolicitud", solicitudCreada.id);
      }

      if (solicitudCreada?.idSolicitud) {
        localStorage.setItem("idSolicitud", solicitudCreada.idSolicitud);
      }

      if (tipoSolicitud === "COTIZACION_BASE") {
        redirect("/cotizacion-base");
      } else if (tipoSolicitud === "COTIZACION_PERSONALIZADA") {
        redirect("/cotizacion-personalizada");
      } else if (tipoSolicitud === "VISITA_TECNICA") {
        redirect("/visita-tecnica");
      }
    } catch (error) {
      console.error("Error al crear la solicitud:", error);
      notify(
        error?.body?.message ||
          error?.message ||
          "Ocurrió un error al crear la solicitud",
        { type: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#d9d9d9"
      p={2}
    >
      <Title title="Solicitud" />

      <Card
        sx={{
          width: 500,
          borderRadius: 3,
          boxShadow: 4,
          backgroundColor: "#e0e0e0",
        }}
      >
        <CardContent>
          <Box textAlign="center" mb={3}>
            <Box
              component="img"
              src={logo}
              alt="Logo Interivalle"
              sx={{
                width: 220,
                borderRadius: 2,
                boxShadow: 2,
                mb: 2,
              }}
            />
            <Typography variant="h4" fontWeight="bold">
              Solicitud
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleContinuar}>
            <Typography variant="h6" mb={2}>
              Seleccione una opción:
            </Typography>

            <RadioGroup value={tipoSolicitud} onChange={handleTipoChange}>
              <FormControlLabel
                value="COTIZACION_BASE"
                control={<Radio />}
                label="Cotización Base"
              />
              <FormControlLabel
                value="COTIZACION_PERSONALIZADA"
                control={<Radio />}
                label="Cotización Personalizada"
              />
              <FormControlLabel
                value="VISITA_TECNICA"
                control={<Radio />}
                label="Visita Técnica"
              />
            </RadioGroup>

            {tipoSolicitud && (
              <>
                <Divider sx={{ my: 2 }} />

                <Typography variant="h5" fontWeight="bold" mb={2}>
                  Seleccione los servicios
                </Typography>

                <FormGroup>
                  {serviciosDisponibles.map((servicio) => (
                    <FormControlLabel
                      key={servicio.id}
                      control={
                        <Checkbox
                          checked={serviciosSeleccionados.includes(servicio.id)}
                          onChange={() => handleServicioChange(servicio.id)}
                        />
                      }
                      label={servicio.nombre}
                    />
                  ))}
                </FormGroup>

                <Box mt={3}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    Nombre del Proyecto:
                  </Typography>

                  <TextField
                    fullWidth
                    value={nombreProyecto}
                    onChange={(e) => setNombreProyecto(e.target.value)}
                    placeholder="Ingrese el nombre del proyecto"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        backgroundColor: "#dfe9dc",
                      },
                    }}
                  />
                </Box>

                <Box mt={4}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      borderRadius: 4,
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      backgroundColor: "#0aa000",
                      "&:hover": {
                        backgroundColor: "#0aa000",
                      },
                    }}
                  >
                    {loading ? "Guardando..." : "Continuar"}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SolicitudSelector;