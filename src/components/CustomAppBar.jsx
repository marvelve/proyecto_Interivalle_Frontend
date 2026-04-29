import * as React from "react";
import { AppBar, TitlePortal } from "react-admin";
import { Box } from "@mui/material";
import NotificacionesMenu from "../resources/Notificaciones/NotificacionMenu";

const CustomAppBar = () => (
  <AppBar>
    <TitlePortal />
    <Box flex="1" />
    <NotificacionesMenu />
  </AppBar>
);

export default CustomAppBar;