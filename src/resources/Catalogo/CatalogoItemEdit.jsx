import * as React from "react";
import {
  BooleanInput,
  Edit,
  NumberInput,
  required,
  SimpleForm,
  TextInput,
} from "react-admin";

const CatalogoItemEdit = () => (
  <Edit title="Actualizar precio V2">
    <SimpleForm>
      <TextInput source="tablaOrigen" label="Tabla origen" disabled fullWidth />
      <TextInput source="idItemOrigen" label="ID origen" disabled fullWidth />
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
        helperText="En ACTIVIDAD este campo no aplica; se conserva solo para MATERIAL y PRODUCTO."
        fullWidth
      />

      <BooleanInput source="activo" label="Activo" />
    </SimpleForm>
  </Edit>
);

export default CatalogoItemEdit;
