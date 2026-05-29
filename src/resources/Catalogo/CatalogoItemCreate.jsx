import * as React from "react";
import {
  BooleanInput,
  Create,
  NumberInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
} from "react-admin";

const CatalogoItemCreate = () => (
  <Create title="Crear ítem de catálogo V2">
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

      <NumberInput
        source="idServicio"
        label="ID Servicio"
        helperText="1 Obra Blanca, 2 Carpintería, 3 Divisiones en Vidrio, 4 Mesones Mármol."
        validate={required()}
      />

      <NumberInput
        source="precioUnitarioVenta"
        label="Precio venta"
        validate={required()}
      />

      <NumberInput
        source="precioUnitarioProveedor"
        label="Precio proveedor"
        helperText="En ACTIVIDAD este campo no aplica."
      />

      <BooleanInput source="activo" label="Activo" defaultValue />
    </SimpleForm>
  </Create>
);

export default CatalogoItemCreate;
