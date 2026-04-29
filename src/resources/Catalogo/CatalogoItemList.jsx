import * as React from "react";
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  EditButton,
  FunctionField,
  TextInput,
  SelectInput,
} from "react-admin";
import { Chip } from "@mui/material";

const catalogoFilters = [
  <TextInput
    label="Buscar ítem"
    source="q"
    alwaysOn
  />,

  <SelectInput
    label="Tipo"
    source="tipoItem"
    choices={[
      { id: "ACTIVIDAD", name: "ACTIVIDAD" },
      { id: "MATERIAL", name: "MATERIAL" },
      { id: "PRODUCTO", name: "PRODUCTO" },
    ]}
    alwaysOn
  />,

  <TextInput
    label="Categoría"
    source="categoria"
    alwaysOn
  />,

  <TextInput
    label="Servicio"
    source="nombreServicio"
    alwaysOn
  />,
];

const CatalogoItemList = () => (
  <List
    title="Actualización de precios"
    filters={catalogoFilters}
    perPage={10}
  >
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="idCatalogoItem" label="ID" />
      <TextField source="nombreServicio" label="Servicio" />
      <TextField source="tipoItem" label="Tipo" />
      <TextField source="categoria" label="Categoría" />
      <TextField source="nombreItem" label="Ítem" />

      <NumberField
        source="precioUnitarioVenta"
        label="Precio venta"
        options={{ style: "currency", currency: "COP" }}
      />

      <NumberField
        source="precioUnitarioProveedor"
        label="Precio proveedor"
        options={{ style: "currency", currency: "COP" }}
      />

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