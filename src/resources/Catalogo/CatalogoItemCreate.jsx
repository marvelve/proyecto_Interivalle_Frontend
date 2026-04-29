import * as React from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  SelectInput,
  required,
} from "react-admin";

const CatalogoItemCreate = () => (
  <Create title="Crear ítem de catálogo">
    <SimpleForm>
      <TextInput source="nombreItem" label="Ítem" validate={required()} fullWidth />

      <TextInput source="categoria" label="Categoría" fullWidth />

      <SelectInput
        source="tipoItem"
        label="Tipo"
        choices={[
          { id: "ACTIVIDAD", name: "ACTIVIDAD" },
          { id: "MATERIAL", name: "MATERIAL" },
          { id: "PRODUCTO", name: "PRODUCTO" },
        ]}
        validate={required()}
      />

      <NumberInput source="idServicio" label="ID Servicio" validate={required()} />

      <NumberInput
        source="precioUnitarioVenta"
        label="Precio venta"
        validate={required()}
      />

      <NumberInput
        source="precioUnitarioProveedor"
        label="Precio proveedor"
      />

      <BooleanInput source="activo" label="Activo" />
    </SimpleForm>
  </Create>
);

export default CatalogoItemCreate;