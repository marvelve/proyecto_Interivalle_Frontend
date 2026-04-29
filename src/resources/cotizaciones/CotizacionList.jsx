import * as React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  TopToolbar,
  Button,
  useRedirect,
} from "react-admin";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import CotizacionVacia from "./CotizacionVacia";

const CotizacionActions = () => {
  const redirect = useRedirect();
  const idRol = Number(localStorage.getItem("idRol"));

  return (
    <TopToolbar>
      {[1, 2, 3].includes(idRol) && (
        <Button
          label="Crear solicitud"
          onClick={() => redirect("/solicitudes/nueva")}
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

  return (
    <List
      title="Cotizaciones"
      actions={<CotizacionActions />}
      empty={<CotizacionVacia />}
      perPage={10}
      sort={{ field: "idCotizacion", order: "DESC" }}
      filter={filtros}
    >
      <Datagrid bulkActionButtons={false} rowClick={false}>
        {puedeVerColumnasInternas && (
          <TextField source="idCotizacion" label="ID" />
        )}

        <TextField source="nombreProyecto" label="Proyecto" />

        {puedeVerColumnasInternas && (
          <TextField source="nombreUsuario" label="Cliente" />
        )}

        <TextField source="estado" label="Estado" />
        <DateField source="fechaCreacion" label="Fecha" showTime={false} />

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