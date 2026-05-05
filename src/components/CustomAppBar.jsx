import * as React from "react";
import { AppBar, TitlePortal } from "react-admin";
import { Box } from "@mui/material";
import NotificacionesMenu from "../resources/Notificaciones/NotificacionMenu";

const LOGO_APPBAR = "/imagenes/landing/Logo_Interivalle2.png";

const CustomAppBar = () => (
  <AppBar
    toolbar={false}
    sx={{
      backgroundColor: "primary.main",
      color: "primary.contrastText",
      boxShadow: "0 3px 12px rgba(0, 0, 0, 0.18)",
      "& .RaAppBar-toolbar": {
        minHeight: 56,
        px: { xs: 1.5, md: 2 },
        gap: 1,
      },
      "& .RaAppBar-menuButton": {
        display: "none",
      },
      "& .MuiIconButton-root": {
        color: "inherit",
      },
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        minWidth: 0,
        fontWeight: 800,
        fontSize: "1.05rem",
      }}
    >
      <Box
        component="img"
        src={LOGO_APPBAR}
        alt="Interivalle"
        sx={{
          display: "block",
          width: { xs: 118, sm: 150, md: 170 },
          height: 42,
          objectFit: "contain",
          bgcolor: "#ffffff",
          borderRadius: 1,
          px: 1,
          py: 0.4,
          flexShrink: 0,
        }}
      />

      <TitlePortal
        sx={{
          flex: "initial",
          minWidth: 0,
          fontWeight: 800,
        }}
      />
    </Box>
    <Box flex="1" />
    <NotificacionesMenu />
  </AppBar>
);

export default CustomAppBar;
