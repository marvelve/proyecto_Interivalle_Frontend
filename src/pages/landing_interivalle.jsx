import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CalculateIcon from "@mui/icons-material/Calculate";
import ConstructionIcon from "@mui/icons-material/Construction";
import CarpenterIcon from "@mui/icons-material/Carpenter";
import DiamondIcon from "@mui/icons-material/Diamond";
import DoorSlidingIcon from "@mui/icons-material/DoorSliding";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import EngineeringIcon from "@mui/icons-material/Engineering";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const COLORS = {
  primary: "#17b978",
  primaryDark: "#0f8f5f",
  dark: "#071b1b",
  text: "#17202a",
  textSoft: "#5f6b76",
  white: "#ffffff",
  section: "#f6f8f7",
  border: "#dfe7e2",
};

const ASSETS = {
  logo: "/imagenes/landing/Logo_Landing.png",
  hero: "/imagenes/landing/hero-cocina.png",
  obraBlanca: "/imagenes/landing/obra-blanca.png",
  carpinteria: "/imagenes/landing/Carpinteria.png",
  vidrio: "/imagenes/landing/vidrio.png",
  marmol: "/imagenes/landing/Marmol.png",
};

const services = [
  {
    title: "Obra Blanca",
    description: "Instalacion, adecuacion y acabados para hogares y negocios.",
    icon: <ConstructionIcon sx={{ fontSize: 34 }} />,
    image: ASSETS.obraBlanca,
  },
  {
    title: "Carpinteria",
    description: "Diseno e instalacion de muebles, puertas, closets y soluciones en madera.",
    icon: <CarpenterIcon sx={{ fontSize: 34 }} />,
    image: ASSETS.carpinteria,
  },
  {
    title: "Marmol y Granito",
    description: "Fabricacion e instalacion de mesones, lavamanos y superficies decorativas.",
    icon: <DiamondIcon sx={{ fontSize: 34 }} />,
    image: ASSETS.marmol,
  },
  {
    title: "Divisiones en Vidrio",
    description: "Disenos modernos para banos, oficinas y espacios interiores.",
    icon: <DoorSlidingIcon sx={{ fontSize: 34 }} />,
    image: ASSETS.vidrio,
  },
];

const benefits = [
  { title: "Atencion personalizada", icon: <ScheduleIcon /> },
  { title: "Cotizaciones claras", icon: <AssignmentTurnedInIcon /> },
  { title: "Seguimiento del proyecto", icon: <EngineeringIcon /> },
  { title: "Servicios para diferentes areas de remodelacion", icon: <ConstructionIcon /> },
  { title: "Cotizacion en linea", icon: <SupportAgentIcon /> },
];

const initialForm = {
  tipoSolicitud: "Visita Tecnica",
  nombreProyecto: "",
  fechaVisita: "",
  horaVisita: "08:00",
  direccionProyecto: "",
  numeroCelular: "",
};

export function getTomorrowDateString(baseDate = new Date()) {
  const tomorrow = new Date(baseDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

export function isVisitFormValid(form) {
  return Boolean(
    form?.tipoSolicitud &&
      String(form?.nombreProyecto || "").trim() &&
      form?.fechaVisita &&
      form?.horaVisita &&
      String(form?.direccionProyecto || "").trim() &&
      String(form?.numeroCelular || "").trim()
  );
}

function defaultNavigate(path) {
  if (typeof window !== "undefined" && path) {
    window.location.assign(path);
  }
}

function ServiceCard({ service }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        overflow: "hidden",
        borderRadius: 2.5,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 14px 26px rgba(15, 23, 42, 0.08)",
      }}
    >
      <Box
        sx={{
          height: { xs: 180, md: 210 },
          backgroundImage: `url(${service.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 18,
            bottom: -26,
            width: 64,
            height: 64,
            borderRadius: 2,
            bgcolor: COLORS.white,
            color: COLORS.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 22px rgba(15, 23, 42, 0.18)",
          }}
        >
          {service.icon}
        </Box>
      </Box>

      <CardContent sx={{ pt: 5, px: 2.4, pb: 2.6 }}>
        <Typography fontWeight={900} sx={{ mb: 1, fontSize: 18 }}>
          {service.title}
        </Typography>
        <Typography color={COLORS.textSoft} sx={{ lineHeight: 1.5, fontSize: 14 }}>
          {service.description}
        </Typography>
      </CardContent>
    </Card>
  );
}

function BenefitItem({ item }) {
  return (
    <Stack alignItems="center" spacing={1.1} sx={{ textAlign: "center", color: COLORS.white }}>
      <Box
        sx={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.16)",
          bgcolor: "rgba(23, 185, 120, 0.16)",
          color: "#baf7dc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "& svg": { fontSize: 30 },
        }}
      >
        {item.icon}
      </Box>
      <Typography fontWeight={800} sx={{ fontSize: 14, lineHeight: 1.25, maxWidth: 150 }}>
        {item.title}
      </Typography>
    </Stack>
  );
}

function BrandLogo({ footer = false }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        bgcolor: footer ? COLORS.white : "transparent",
        borderRadius: footer ? 2 : 0,
        px: footer ? 1.5 : 0,
        py: footer ? 1 : 0,
      }}
    >
      <Box
        component="img"
        src={ASSETS.logo}
        alt="Interivalle Construccion y Remodelacion"
        sx={{
          display: "block",
          width: footer
            ? { xs: 210, sm: 240, md: 260 }
            : { xs: 190, sm: 230, md: 255 },
          maxWidth: footer ? "72vw" : "48vw",
          height: "auto",
          objectFit: "contain",
        }}
      />
    </Box>
  );
}

export default function LandingInterivalle({ onNavigate }) {
  const [form, setForm] = useState(initialForm);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const redirectTimerRef = useRef(null);

  const navigateTo = useMemo(() => {
    return typeof onNavigate === "function" ? onNavigate : defaultNavigate;
  }, [onNavigate]);

  const isAuthenticated = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const scrollToSection = (id) => {
    const element = typeof document !== "undefined" ? document.getElementById(id) : null;
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePrimaryCTA = () => {
    if (isAuthenticated) {
      navigateTo("/solicitudes/create");
      return;
    }

    navigateTo("/login");
  };

  const handleVisitSubmit = (event) => {
    event.preventDefault();

    if (!isVisitFormValid(form)) {
      setToast({
        open: true,
        severity: "warning",
        message: "Completa todos los campos de la visita tecnica antes de continuar.",
      });
      return;
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("landingVisitaPrefill", JSON.stringify(form));
    }

    if (isAuthenticated) {
      navigateTo("/solicitudes/create");
      return;
    }

    setToast({
      open: true,
      severity: "success",
      message: "Tus datos fueron preparados. Ahora inicia sesion o registrate para continuar.",
    });

    redirectTimerRef.current = setTimeout(() => {
      navigateTo("/login");
    }, 700);
  };

  const tomorrowMinDate = getTomorrowDateString();

  return (
    <Box sx={{ bgcolor: COLORS.white, color: COLORS.text }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: COLORS.white,
          color: COLORS.text,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 58, md: 62 },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <BrandLogo />

            <Stack
              direction="row"
              spacing={{ md: 2.5, lg: 4 }}
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              {[
                ["Inicio", "inicio"],
                ["Servicios", "servicios"],
                ["¿Por que elegirnos?", "porque"],
                ["Contacto", "contacto"],
              ].map(([label, target]) => (
                <Button
                  key={target}
                  color="inherit"
                  onClick={() => scrollToSection(target)}
                  sx={{
                    minWidth: 0,
                    px: 0.5,
                    fontWeight: 900,
                    fontSize: 13,
                    textTransform: "none",
                    color: COLORS.text,
                  }}
                >
                  {label}
                </Button>
              ))}
            </Stack>

            <Button
              variant="contained"
              onClick={handlePrimaryCTA}
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                bgcolor: COLORS.primary,
                "&:hover": { bgcolor: COLORS.primaryDark },
                borderRadius: 1.4,
                px: { sm: 2, md: 2.5 },
                py: 0.9,
                fontWeight: 900,
                textTransform: "none",
                flexShrink: 0,
              }}
            >
              Cotizar
            </Button>

            <Button
              variant="contained"
              startIcon={<WhatsAppIcon />}
              href="https://wa.me/573154185077"
              target="_blank"
              rel="noreferrer"
              sx={{
                bgcolor: COLORS.primary,
                "&:hover": { bgcolor: COLORS.primaryDark },
                borderRadius: 1.4,
                px: { xs: 1.4, sm: 2.2 },
                py: 0.9,
                fontWeight: 900,
                textTransform: "none",
                flexShrink: 0,
              }}
            >
              WhatsApp
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Box
        id="inicio"
        sx={{
          minHeight: { xs: 480, md: 440 },
          display: "flex",
          alignItems: "center",
          backgroundImage: `linear-gradient(90deg, rgba(4,21,22,0.95) 0%, rgba(4,21,22,0.84) 38%, rgba(4,21,22,0.36) 70%, rgba(4,21,22,0.08) 100%), url(${ASSETS.hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ maxWidth: 560, color: COLORS.white, py: { xs: 7, md: 8 } }}>
            <Typography
              sx={{
                color: COLORS.primary,
                fontWeight: 900,
                fontSize: 14,
                letterSpacing: 0.4,
                mb: 2,
              }}
            >
              CONSTRUCCION Y REMODELACION
            </Typography>

            <Typography
              sx={{
                fontWeight: 950,
                lineHeight: 1.02,
                fontSize: { xs: 40, sm: 52, md: 58 },
                mb: 2,
              }}
            >
              COTIZAMOS Y GESTIONAMOS
              <Box component="span" sx={{ display: "block", color: COLORS.primary }}>
                TUS PROYECTOS
              </Box>
            </Typography>

            <Typography sx={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.65, mb: 3, maxWidth: 430 }}>
              Transformamos tus espacios con soluciones en obra blanca, carpinteria,
              marmol y divisiones en vidrio. Solicita tu cotizacion de forma rapida y personalizada.
            </Typography>

            <Button
              variant="contained"
              startIcon={<CalculateIcon />}
              onClick={handlePrimaryCTA}
              sx={{
                bgcolor: COLORS.primary,
                "&:hover": { bgcolor: COLORS.primaryDark },
                borderRadius: 1.2,
                px: 3,
                py: 1.3,
                fontWeight: 900,
                textTransform: "uppercase",
              }}
            >
              Solicitar cotizacion
            </Button>
          </Box>
        </Container>
      </Box>

      <Box id="servicios" sx={{ bgcolor: COLORS.section, py: { xs: 5, md: 5.5 } }}>
        <Container maxWidth="xl">
          <Stack alignItems="center" sx={{ textAlign: "center", mb: 3 }}>
            <Typography sx={{ color: COLORS.primaryDark, fontWeight: 900, fontSize: { xs: 28, md: 34 }}}>
              NUESTROS SERVICIOS
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: { xs: 2.5, md: 3 },
              alignItems: "stretch",
            }}
          >
            {services.map((service) => (
              <Box key={service.title} sx={{ minWidth: 0 }}>
                <ServiceCard service={service} />
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Box
        id="porque"
        sx={{
          py: { xs: 5, md: 6 },
          backgroundImage: `linear-gradient(90deg, rgba(5,24,24,0.97), rgba(5,24,24,0.9)), url(${ASSETS.hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={3.4}>
              <Typography sx={{ color: COLORS.primary, fontWeight: 900, fontSize: 14, mb: 1 }}>
                POR QUE ELEGIRNOS
              </Typography>
              <Typography sx={{ color: COLORS.white, fontSize: { xs: 32, md: 38 }, fontWeight: 900, lineHeight: 1.08 }}>
                Tu proyecto en
                <Box component="span" sx={{ display: "block", color: COLORS.primary }}>
                  buenas manos
                </Box>
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.6, mt: 2 }}>
                En Interivalle nos enfocamos en ofrecerte una experiencia confiable,
                clara y personalizada desde la primera consulta hasta la entrega de tu proyecto.
              </Typography>
            </Grid>

            <Grid item xs={12} md={8.6}>
              <Grid container spacing={2.5}>
                {benefits.map((item) => (
                  <Grid item xs={6} sm={4} md key={item.title}>
                    <BenefitItem item={item} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box id="visita-tecnica" sx={{ bgcolor: COLORS.white }}>
        <Container maxWidth="xl">
        <Grid container>
          <Grid item xs={12} md={7}>
            <Box sx={{ px: { xs: 3, md: 6 }, py: { xs: 4, md: 5 } }}>
              <Typography sx={{ color: COLORS.primaryDark, fontWeight: 900, fontSize: 13 }}>
                SOLICITA TU VISITA TECNICA
              </Typography>
              <Typography sx={{ fontSize: { xs: 30, md: 36 }, fontWeight: 900, mb: 0.5 }}>
                Agenda tu visita tecnica
              </Typography>
              <Typography sx={{ color: COLORS.textSoft, mb: 2.8 }}>
                Completa el formulario y uno de nuestros asesores se pondra en contacto
                contigo para agendar tu visita.
              </Typography>

              <Paper
                component="form"
                onSubmit={handleVisitSubmit}
                elevation={0}
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Tipo de solicitud"
                      value={form.tipoSolicitud}
                      onChange={handleChange("tipoSolicitud")}
                    >
                      <MenuItem value="Visita Tecnica">Visita Tecnica</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Nombre del proyecto"
                      value={form.nombreProyecto}
                      onChange={handleChange("nombreProyecto")}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Fecha de visita"
                      type="date"
                      value={form.fechaVisita}
                      onChange={handleChange("fechaVisita")}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: tomorrowMinDate }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Hora de visita"
                      value={form.horaVisita}
                      onChange={handleChange("horaVisita")}
                    >
                      <MenuItem value="08:00">08:00 AM</MenuItem>
                      <MenuItem value="09:00">09:00 AM</MenuItem>
                      <MenuItem value="10:00">10:00 AM</MenuItem>
                      <MenuItem value="11:00">11:00 AM</MenuItem>
                      <MenuItem value="14:00">02:00 PM</MenuItem>
                      <MenuItem value="15:00">03:00 PM</MenuItem>
                      <MenuItem value="16:00">04:00 PM</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Direccion del proyecto"
                      value={form.direccionProyecto}
                      onChange={handleChange("direccionProyecto")}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Numero celular del cliente"
                      value={form.numeroCelular}
                      onChange={handleChange("numeroCelular")}
                    />
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 2.5 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setForm(initialForm)}
                    sx={{ textTransform: "uppercase", fontWeight: 800 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<CalendarMonthIcon />}
                    sx={{
                      bgcolor: COLORS.primary,
                      "&:hover": { bgcolor: COLORS.primaryDark },
                      textTransform: "uppercase",
                      fontWeight: 800,
                    }}
                  >
                    Crear visita
                  </Button>
                </Stack>
              </Paper>
            </Box>
          </Grid>
        </Grid>
        </Container>
      </Box>

      <Box id="contacto" sx={{ bgcolor: COLORS.dark, color: COLORS.white, py: 4 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <BrandLogo footer />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography sx={{ fontSize: { xs: 20, md: 22 }, lineHeight: 1.55 }}>
                Haz realidad tu proyecto con
                <Box component="span" sx={{ color: "#9be69f", fontWeight: 900 }}>
                  {" "}una cotizacion confiable y profesional.
                </Box>
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1.1}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <PhoneIcon sx={{ color: "#9be69f" }} />
                  <Typography>+57 315 4185077</Typography>
                </Stack>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <EmailIcon sx={{ color: "#9be69f" }} />
                  <Typography>interivalle@gmail.com</Typography>
                </Stack>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <LocationOnIcon sx={{ color: "#9be69f" }} />
                  <Typography>Cali, Colombia</Typography>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={2800}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export const landingInterivalleTestCases = [
  {
    name: "Valida formulario incompleto",
    input: {
      tipoSolicitud: "Visita Tecnica",
      nombreProyecto: "",
      fechaVisita: "2026-05-01",
      horaVisita: "08:00",
      direccionProyecto: "Calle 1 # 2-3",
      numeroCelular: "3001234567",
    },
    expected: false,
  },
  {
    name: "Valida formulario completo",
    input: {
      tipoSolicitud: "Visita Tecnica",
      nombreProyecto: "Proyecto Alameda",
      fechaVisita: "2026-05-01",
      horaVisita: "08:00",
      direccionProyecto: "Calle 1 # 2-3",
      numeroCelular: "3001234567",
    },
    expected: true,
  },
  {
    name: "Calcula manana en formato ISO",
    input: new Date("2026-05-01T10:00:00Z"),
    expected: "2026-05-02",
  },
];
