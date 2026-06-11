import * as React from "react";
import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  DateInput,
  SelectInput,
  TextInput,
  TopToolbar,
  Button,
  useRedirect,
} from "react-admin";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import CotizacionVacia from "./CotizacionVacia";
import { compactDatagridSx, compactListSx } from "../../app/listStyles";
import { ClienteProyectoCardsFromList } from "../../components/ClienteProyectoCards";

const estadoCotizacionChoices = [
  { id: "GENERADA", name: "GENERADA" },
  { id: "ENVIADA", name: "ENVIADA" },
  { id: "APROBADA", name: "APROBADA" },
  { id: "APROBADA_CLIENTE", name: "APROBADA_CLIENTE" },
  { id: "APROBADA_FINAL", name: "APROBADA_FINAL" },
  { id: "RECHAZADA", name: "RECHAZADA" },
  { id: "EN_REVISION", name: "EN_REVISION" },
];

const cotizacionFilters = [
  <DateInput key="fechaInicio" label="Fecha inicio" source="fechaInicio" alwaysOn />,
  <SelectInput
    key="estado"
    label="Estado"
    source="estado"
    choices={estadoCotizacionChoices}
    alwaysOn
  />,
  <TextInput key="nombreProyecto" label="Proyecto" source="nombreProyecto" alwaysOn />,
  <TextInput key="nombreUsuario" label="Cliente" source="nombreUsuario" alwaysOn />,
];

const esAprobada = (estado) =>
  ["APROBADA", "APROBADA_CLIENTE", "APROBADA_FINAL"].includes(
    String(estado || "").toUpperCase()
  );

const crearFechaLocal = (value) => {
  if (!value) return null;

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  const fecha = new Date(value);

  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const formatearFecha = (value) => {
  const fecha = crearFechaLocal(value);

  return fecha ? new Intl.DateTimeFormat("es-CO").format(fecha) : "-";
};

const obtenerFechaListado = (record) =>
  esAprobada(record?.estado) && record?.fechaInicio
    ? record.fechaInicio
    : record?.fechaCreacion;

const CotizacionActions = () => {
  const redirect = useRedirect();
  const idRol = Number(localStorage.getItem("idRol"));

  return (
    <TopToolbar>
      {[1, 2, 3].includes(idRol) && (
        <Button
          label="Crear solicitud"
          onClick={() => redirect("/solicitudes/create")}
        >
          <AddIcon />
        </Button>
      )}
    </TopToolbar>
  );
};

const CotizacionList = () => {
  const redirect = useRedirect();

  const idRol = Number(localStorage.getItem("idRol"));
  const correoUsuario =
    localStorage.getItem("correoUsuario") ||
    localStorage.getItem("usuarioCorreo") ||
    "";

  const esAdmin = idRol === 1;
  const esSupervisor = idRol === 2;
  const esCliente = idRol === 3;

  const puedeVerColumnasInternas = esAdmin || esSupervisor;

  const filtros = esCliente ? { correoUsuario } : {};

  if (esCliente) {
    return (
      <List
        title="Cotizaciones"
        actions={<CotizacionActions />}
        empty={<CotizacionVacia />}
        perPage={10}
        sort={{ field: "idCotizacion", order: "DESC" }}
        filter={filtros}
        storeKey={false}
        sx={compactListSx}
      >
        <ClienteProyectoCardsFromList
          emptyText="No tienes cotizaciones registradas."
          getProyecto={(record) => record.nombreProyecto}
          getEstado={(record) => record.estado}
          getFecha={(record) => record.fechaCreacion}
          getFechaLabel={() => "Fecha"}
          getServicios={(record) =>
            record.serviciosSeleccionados ||
            record.servicios ||
            record.detalles?.map((detalle) => detalle.nombreServicio)
          }
          onOpen={(record) =>
            record?.idCotizacion &&
            redirect(`/cotizaciones/${record.idCotizacion}/vista`)
          }
        />
      </List>
    );
  }

  return (
    <List
      title="Cotizaciones"
      actions={<CotizacionActions />}
      filters={puedeVerColumnasInternas ? cotizacionFilters : undefined}
      empty={<CotizacionVacia />}
      perPage={10}
      sort={{ field: "idCotizacion", order: "DESC" }}
      filter={filtros}
      storeKey={false}
      sx={compactListSx}
    >
      <Datagrid
        bulkActionButtons={false}
        rowClick={false}
        size="small"
        sx={compactDatagridSx}
      >
        {puedeVerColumnasInternas && (
          <TextField source="idCotizacion" label="ID" />
        )}

        <TextField source="nombreProyecto" label="Proyecto" />

        {puedeVerColumnasInternas && (
          <TextField source="nombreUsuario" label="Cliente" />
        )}

        <TextField source="estado" label="Estado" />
        <FunctionField
          label="Fecha"
          render={(record) => formatearFecha(obtenerFechaListado(record))}
        />

        <FunctionField
          label="Ver"
          render={(record) =>
            record?.idCotizacion ? (
              <Button
                label=""
                onClick={() =>
                  redirect(`/cotizaciones/${record.idCotizacion}/vista`)
                }
              >
                <VisibilityIcon />
              </Button>
            ) : (
              <span style={{ color: "#999" }}>—</span>
            )
          }
        />
      </Datagrid>
    </List>
  );
};

export default CotizacionList;
