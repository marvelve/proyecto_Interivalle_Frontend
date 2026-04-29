import React, { useEffect, useState } from "react";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Button,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate } from "react-router-dom";
import NotificacionService from "../Notificaciones/NotificacionService";

const NotificacionesMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [contador, setContador] = useState(0);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const cargarContador = async () => {
    try {
      const total = await NotificacionService.contarNoLeidas();
      console.log("CONTADOR:", total);
      setContador(total || 0);
    } catch (error) {
      console.error("Error cargando contador de notificaciones", error);
    }
  };

  const cargarNoLeidas = async () => {
    try {
      setLoading(true);
      const lista = await NotificacionService.listarNoLeidas();
       console.log("NOTIFICACIONES:", lista);
      setNotificaciones(lista || []);
    } catch (error) {
      console.error("Error cargando notificaciones", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarContador();

    const interval = setInterval(() => {
      cargarContador();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleOpen = async (event) => {
    setAnchorEl(event.currentTarget);
    await cargarNoLeidas();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const irSegunModulo = (n) => {
    if (n.modulo === "VISITA_TECNICA" && n.idReferencia) {
    navigate(`/solicitudes/${n.idReferencia}/show`);
      return;
    }

    if (n.modulo === "AVANCE" && n.idReferencia) {
    navigate(`/cronogramas/${n.idReferencia}/seguimiento`);
    return;
  }

    if (n.modulo === "CRONOGRAMA") {
      navigate("/cronogramas");
      return;
    }

    if (n.modulo === "COTIZACION") {
      navigate("/cotizaciones");
      return;
    }

    navigate("/");
  };

  const handleClickNotificacion = async (n) => {
    try {
      await NotificacionService.marcarComoLeida(n.idNotificacion);
      await cargarContador();
      await cargarNoLeidas();
      handleClose();
      irSegunModulo(n);
    } catch (error) {
      console.error("Error marcando notificación", error);
    }
  };

  const handleMarcarTodas = async () => {
    try {
      await NotificacionService.marcarTodasComoLeidas();
      await cargarContador();
      await cargarNoLeidas();
    } catch (error) {
      console.error("Error marcando todas como leídas", error);
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={contador} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{ sx: { width: 400, maxHeight: 450 } }}
      >
        <Box px={2} py={1} display="flex" justifyContent="space-between" alignItems="center">
          <Typography fontWeight="bold">Notificaciones</Typography>
          <Button size="small" onClick={handleMarcarTodas}>
            Marcar todas
          </Button>
        </Box>

        <Divider />

        {loading ? (
          <Box p={2} textAlign="center">
            <CircularProgress size={24} />
          </Box>
        ) : notificaciones.length === 0 ? (
          <MenuItem disabled>No tienes notificaciones nuevas</MenuItem>
        ) : (
          notificaciones.map((n) => (
            <MenuItem
              key={n.idNotificacion}
              onClick={() => handleClickNotificacion(n)}
              sx={{
                whiteSpace: "normal",
                alignItems: "flex-start",
                py: 1.5,
              }}
            >
              <Box>
                <Typography fontWeight="bold" variant="body2">
                  {n.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {n.mensaje}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {n.fechaCreacion}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificacionesMenu;