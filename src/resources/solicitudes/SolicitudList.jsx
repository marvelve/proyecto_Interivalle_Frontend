import * as React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  TopToolbar,
  Button,
  useRedirect
} from "react-admin";

import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import Tooltip from "@mui/material/Tooltip";
import { Box, Chip } from "@mui/material";

import SolicitudVacia from "./SolicitudVacia";

/* ===============================
   BOTÓN CREAR COTIZACIÓN
================================= */

const CrearCotizacionButton = ({ record }) => {
  const redirect = useRedirect();

  const handleClick = () => {
    localStorage.setItem("idSolicitud", record.idSolicitud);
    redirect("/cotizacion-base");
  };

  return (
    <Button
      variant="contained"
      size="small"
      onClick={handleClick}
      sx={{
        backgroundColor: "#0aa000",
        "&:hover": { backgroundColor: "#088500" }
      }}
    >
      Crear Cotización
    </Button>
  );
};

/* ===============================
   BOTÓN CREAR NUEVA SOLICITUD
================================= */

const SolicitudesActions = () => {
  const redirect = useRedirect();

  return (
    <TopToolbar>
      <Button
        label=" Crear Solicitud"
        onClick={() => redirect("/solicitudes/create")}
      >
        <AddIcon />
      </Button>
    </TopToolbar>
  );
};

/* ===============================
   COMPONENTE PRINCIPAL
================================= */

const SolicitudList = () => {
  const correoUsuario = localStorage.getItem("correoUsuario") || "";
  const idRol = String(localStorage.getItem("idRol") || "");

  const esAdmin = idRol === "1";
  const esSupervisor = idRol === "2";

  const puedeVerColumnasInternas = esAdmin || esSupervisor;
  const puedeVerTodo = esAdmin || esSupervisor;
  const puedeVerCelular = esAdmin || esSupervisor;

  const redirect = useRedirect();

  const handleReprogramar = (record) => {
    redirect(`/solicitudes/${record.idSolicitud}/reprogramar`);
  };

  const handleVerSolicitud = (record) => {
    redirect(`/solicitudes/${record.idSolicitud}/show`);
  };

  return (
    <List
      title="Listado de Solicitudes"
      resource="solicitudes"
      actions={<SolicitudesActions />}
      empty={<SolicitudVacia />}
      filter={puedeVerTodo ? {} : { correoUsuario }}
      sort={{ field: "idSolicitud", order: "DESC" }}
      perPage={10}
    >
      <Datagrid rowClick={false} bulkActionButtons={false}>
        {puedeVerColumnasInternas && (
          <TextField source="idSolicitud" label="ID" />
        )}

        {puedeVerColumnasInternas && (
          <TextField source="correoUsuario" label="Correo Usuario" />
        )}

        <TextField source="tipoSolicitud" label="Tipo Solicitud" />
        <TextField source="nombreProyecto" label="Proyecto" />

        <FunctionField
          label="Estado"
          render={(record) => {
            if (record.estado === "PENDIENTE") {
              return <Chip label="PENDIENTE" color="warning" />;
            }

            if (record.estado === "GENERADA") {
              return <Chip label="GENERADA" color="success" />;
            }

            if (record.estado === "BORRADOR") {
              return <Chip label="BORRADOR" color="info" />;
            }

            if (record.estado === "REPROGRAMADA") {
              return <Chip label="REPROGRAMADA" color="secondary" />;
            }

            return record.estado;
          }}
        />

        <DateField source="fechaSolicitud" label="Fecha" />

        <FunctionField
          label="Fecha/Hora Visita"
          render={(record) => {
            if (record?.tipoSolicitud !== "VISITA_TECNICA") return "-";

            const fecha = record?.fechaVisita || "-";
            const hora = record?.horaVisita || "-";

            return `${fecha} - ${hora}`;
          }}
        />

        {puedeVerCelular && (
          <FunctionField
            label="Número Celular"
            render={(record) => {
              if (record?.tipoSolicitud !== "VISITA_TECNICA") return "-";
              return record?.celularCliente || "-";
            }}
          />
        )}

        <FunctionField
          label="Servicios"
          render={(record) => {
            if (
              !record?.solicitudServicios ||
              record.solicitudServicios.length === 0
            ) {
              return "Sin servicios";
            }

            return record.solicitudServicios
              .map((servicio) => servicio.nombreServicio)
              .join(", ");
          }}
        />

        <FunctionField
          label="Acciones"
          render={(record) => {
            if (
              record?.tipoSolicitud === "COTIZACION_BASE" &&
              (record?.estado === "PENDIENTE" ||
                record?.estado === "REPROGRAMADA")
            ) {
              return <CrearCotizacionButton record={record} />;
            }

            if (record?.tipoSolicitud === "VISITA_TECNICA") {
              const puedeReprogramar =
              record?.estado === "PENDIENTE" || record?.estado === "REPROGRAMADA";

              return (
                <Box display="flex" gap={1} alignItems="center">
                  <Tooltip title="Ver solicitud">
                    <Button
                      label=""
                      onClick={() => handleVerSolicitud(record)}
                      sx={{ minWidth: 36, padding: "6px" }}
                    >
                      <VisibilityIcon />
                    </Button>
                  </Tooltip>
                {puedeReprogramar && (
                  <Tooltip title="Reprogramar visita">
                    <Button
                      label=""
                      onClick={() => handleReprogramar(record)}
                      sx={{ minWidth: 36, padding: "6px", color: "#14a800" }}
                    >
                      <EventRepeatIcon />
                    </Button>
                  </Tooltip>
                )}
                </Box>
              );
            }

            return <span>-</span>;
          }}
        />
      </Datagrid>
    </List>
  );
};

export default SolicitudList;