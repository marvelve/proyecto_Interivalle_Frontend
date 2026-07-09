import * as React from "react";
import {
  BooleanInput,
  Create,
  FormDataConsumer,
  NumberInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
} from "react-admin";
import RelacionesActividadMaterialV2 from "./RelacionesActividadMaterialV2";

const esActividadAdicional = (tipoItem) => tipoItem === "ACTIVIDAD ADICIONAL";

const CatalogoItemCreate = () => (
  <Create title="Crear item de catalogo V2">
    <SimpleForm>
      <TextInput source="nombreItem" label="Item" validate={required()} fullWidth />

      <SelectInput
        source="tipoItem"
        label="Tipo"
        choices={[
          { id: "ACTIVIDAD", name: "ACTIVIDAD" },
          { id: "ACTIVIDAD ADICIONAL", name: "ACTIVIDAD ADICIONAL" },
          { id: "MATERIAL", name: "MATERIAL" },
          { id: "PRODUCTO", name: "PRODUCTO" },
        ]}
        validate={required()}
      />

      <FormDataConsumer>
        {({ formData }) => {
          const actividadAdicional = esActividadAdicional(formData?.tipoItem);

          return (
            <TextInput
              source="categoria"
              label={actividadAdicional ? "Tipo de cobro" : "Categoria"}
              helperText={
                actividadAdicional
                  ? "Ejemplo: METRO CUADRADO, UNIDAD u OBJETO."
                  : undefined
              }
              validate={actividadAdicional ? required() : undefined}
              fullWidth
            />
          );
        }}
      </FormDataConsumer>

      <NumberInput
        source="idServicio"
        label="ID Servicio"
        helperText="1 Obra Blanca, 2 Carpinteria, 3 Divisiones en Vidrio, 4 Mesones Marmol."
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
        helperText="En ACTIVIDAD y ACTIVIDAD ADICIONAL este campo no aplica."
      />

      <BooleanInput source="activo" label="Activo" defaultValue />

      <FormDataConsumer>
        {({ formData }) =>
          formData?.tipoItem === "MATERIAL" ? (
            <RelacionesActividadMaterialV2
              idServicioMaterial={formData?.idServicio}
              editableApi={false}
            />
          ) : null
        }
      </FormDataConsumer>
    </SimpleForm>
  </Create>
);

export default CatalogoItemCreate;
