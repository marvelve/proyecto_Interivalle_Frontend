import * as React from "react";
import {
  Button,
  Datagrid,
  EditButton,
  FunctionField,
  List,
  NumberField,
  SelectInput,
  TextField,
  TextInput,
  useRecordContext,
  useRedirect,
} from "react-admin";
import { Chip } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

const formatearMoneda = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(valor || 0));

const catalogoFilters = [
  <TextInput label="Buscar ítem" source="q" alwaysOn />,

  <SelectInput
    label="Tipo"
    source="tipoItem"
    choices={[
      { id: "ACTIVIDAD", name: "ACTIVIDAD" },
      { id: "ACTIVIDAD ADICIONAL", name: "ACTIVIDAD ADICIONAL" },
      { id: "MATERIAL", name: "MATERIAL" },
      { id: "PRODUCTO", name: "PRODUCTO" },
    ]}
    alwaysOn
  />,

  <TextInput label="Categoria / Tipo de cobro" source="categoria" alwaysOn />,
  <TextInput label="Servicio" source="nombreServicio" alwaysOn />,
];

const GestionarRelacionesButton = () => {
  const record = useRecordContext();
  const redirect = useRedirect();

  if (record?.tipoItem !== "MATERIAL") {
    return null;
  }

  return (
    <Button
      label="Gestionar relaciones"
      onClick={(event) => {
        event.stopPropagation();
        redirect("edit", "catalogo-v2", record.id);
      }}
    >
      <SettingsIcon />
    </Button>
  );
};

const CatalogoItemList = () => (
  <List
    title="Actualización de precios V2"
    filters={catalogoFilters}
    perPage={10}
  >
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="idItemOrigen" label="ID" />
      <TextField source="tablaOrigen" label="Tabla" />
      <TextField source="nombreServicio" label="Servicio" />
      <TextField source="tipoItem" label="Tipo" />
      <TextField source="categoria" label="Categoria / Tipo de cobro" />
      <TextField source="nombreItem" label="Ítem" />

      <NumberField
        source="precioUnitarioVenta"
        label="Precio venta"
        options={{ style: "currency", currency: "COP" }}
      />

      <FunctionField
        label="Precio proveedor"
        render={(record) =>
          record?.precioUnitarioProveedor == null
            ? "-"
            : formatearMoneda(record.precioUnitarioProveedor)
        }
      />

      <TextField source="relacionesV2" label="Relaciones V2" />
      <GestionarRelacionesButton />

      <FunctionField
        label="Activo"
        render={(record) =>
          record.activo ? (
            <Chip label="Activo" color="success" size="small" />
          ) : (
            <Chip label="Inactivo" color="default" size="small" />
          )
        }
      />

      <EditButton label="Editar" />
    </Datagrid>
  </List>
);

export default CatalogoItemList;
