import * as React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  required,
} from "react-admin";

const CatalogoItemEdit = () => (
  <Edit title="Actualizar precio">
    <SimpleForm>
      <TextInput source="nombreServicio" label="Servicio" disabled fullWidth />
      <TextInput source="tipoItem" label="Tipo" disabled fullWidth />
      <TextInput source="categoria" label="Categoría" disabled fullWidth />
      <TextInput source="nombreItem" label="Ítem" disabled fullWidth />

      <NumberInput
        source="precioUnitarioVenta"
        label="Precio venta"
        validate={required()}
        fullWidth
      />

      <NumberInput
        source="precioUnitarioProveedor"
        label="Precio proveedor"
        fullWidth
      />

      <BooleanInput source="activo" label="Activo" />
    </SimpleForm>
  </Edit>
);

export default CatalogoItemEdit;