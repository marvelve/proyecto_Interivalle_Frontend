import * as React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  Button,
  TopToolbar,
  useRedirect,
} from "react-admin";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { compactDatagridSx, compactListSx } from "../../app/listStyles";
import { ClienteProyectoCardsFromList } from "../../components/ClienteProyectoCards";

const CronogramaActions = () => {
  return <TopToolbar />;
};

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
        perPage={10}
        sort={{ field: "idCronograma", order: "DESC" }}
        filter={filtros}
        storeKey={false}
        sx={compactListSx}
      >
        <ClienteProyectoCardsFromList
          emptyText="No tienes cronogramas registrados."
          getProyecto={(record) => record.nombreProyecto}
          getEstado={(record) => record.estadoCronograma}
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

        <TextField source="estadoCronograma" label="Estado" />
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
