import * as React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  DateInput,
  SelectInput,
  TextInput,
  Button,
  TopToolbar,
  useRedirect,
} from "react-admin";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { compactDatagridSx, compactListSx } from "../../app/listStyles";
import { ClienteProyectoCardsFromList } from "../../components/ClienteProyectoCards";
import CotizacionVacia from "../cotizaciones/CotizacionVacia";

const CronogramaActions = () => {
  return <TopToolbar />;
};

const estadoCronogramaChoices = [
  { id: "PENDIENTE_APROBACION_EMPRESA", name: "Pendiente de aprobación empresa" },
  { id: "EN_PROCESO", name: "En proceso" },
  { id: "FINALIZADO", name: "Finalizado" },
];

const labelEstadoCronograma = (estado) => {
  if (estado === "PENDIENTE_APROBACION_EMPRESA" || estado === "PENDIENTE_APROBACION_INTERIVALLE") {
    return "Pendiente de aprobación empresa";
  }
  return String(estado || "").replace(/_/g, " ");
};

const cronogramaFilters = [
  <DateInput key="fechaInicio" label="Fecha inicio" source="fechaInicio" alwaysOn />,
  <SelectInput
    key="estadoCronograma"
    label="Estado"
    source="estadoCronograma"
    choices={estadoCronogramaChoices}
    alwaysOn
  />,
  <TextInput key="nombreProyecto" label="Proyecto" source="nombreProyecto" alwaysOn />,
  <TextInput key="nombreCliente" label="Cliente" source="nombreCliente" alwaysOn />,
  <DateInput key="fechaFin" label="Fecha fin" source="fechaFin" alwaysOn />,
];

const CronogramaList = () => {
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
        title="Cronogramas"
        actions={<CronogramaActions />}
        empty={<CotizacionVacia />}
        perPage={10}
        sort={{ field: "idCronograma", order: "DESC" }}
        filter={filtros}
        storeKey={false}
        sx={compactListSx}
      >
        <ClienteProyectoCardsFromList
          emptyText="No tienes cronogramas registrados."
          getProyecto={(record) => record.nombreProyecto}
          getEstado={(record) => labelEstadoCronograma(record.estadoCronograma)}
          getFecha={(record) => record.fechaInicio}
          getFechaLabel={() => "Fecha inicio"}
          getDetalle={(record) =>
            record.fechaFin
              ? `Fecha fin: ${String(record.fechaFin).replace(/^(\d{4})-(\d{2})-(\d{2}).*/, "$3/$2/$1")} · Avance: ${record.avanceGeneral || 0}%`
              : `Avance: ${record.avanceGeneral || 0}%`
          }
          onOpen={(record) =>
            record?.idCotizacion &&
            redirect(`/cronogramas/cotizacion/${record.idCotizacion}`)
          }
        />
      </List>
    );
  }

  return (
    <List
      title="Cronogramas"
      actions={<CronogramaActions />}
      filters={puedeVerColumnasInternas ? cronogramaFilters : undefined}
      empty={<CotizacionVacia />}
      perPage={10}
      sort={{ field: "idCronograma", order: "DESC" }}
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
          <TextField source="idCronograma" label="ID Cronograma" />
        )}

        {puedeVerColumnasInternas && (
          <TextField source="idCotizacion" label="ID Cotización" />
        )}

        <TextField source="nombreProyecto" label="Proyecto" />

        {puedeVerColumnasInternas && (
          <TextField source="nombreCliente" label="Cliente" />
        )}

        <FunctionField
          source="estadoCronograma"
          label="Estado"
          render={(record) => labelEstadoCronograma(record?.estadoCronograma)}
        />
        <DateField source="fechaInicio" label="Fecha inicio" showTime={false} />
        <DateField source="fechaFin" label="Fecha fin" showTime={false} />

        <FunctionField
          label="Avance general"
          render={(record) => `${record?.avanceGeneral || 0}%`}
        />

        <FunctionField
          label="Acciones"
          render={(record) =>
            record?.idCotizacion ? (
              <Button
                label=""
                onClick={() =>
                  redirect(`/cronogramas/cotizacion/${record.idCotizacion}`)
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

export default CronogramaList;
