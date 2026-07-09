import * as React from "react";
import {
  BooleanInput,
  Edit,
  FormDataConsumer,
  NumberInput,
  required,
  SimpleForm,
  TextInput,
} from "react-admin";
import RelacionesActividadMaterialV2 from "./RelacionesActividadMaterialV2";

const esActividadAdicional = (tipoItem) => tipoItem === "ACTIVIDAD ADICIONAL";

const CatalogoItemEdit = () => (
  <Edit title="Actualizar item V2">
    <SimpleForm>
      <TextInput source="tablaOrigen" label="Tabla origen" disabled fullWidth />
      <TextInput source="idItemOrigen" label="ID origen" disabled fullWidth />
      <TextInput source="tipoItem" label="Tipo" disabled fullWidth />
      <TextInput source="nombreServicio" label="Servicio actual" disabled fullWidth />

      <NumberInput
        source="idServicio"
        label="ID Servicio"
        helperText="1 Obra Blanca, 2 Carpinteria, 3 Divisiones en Vidrio, 4 Mesones Marmol."
        validate={required()}
        fullWidth
      />

      <TextInput source="nombreItem" label="Item" validate={required()} fullWidth />

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
        source="precioUnitarioVenta"
        label="Precio venta"
        validate={required()}
        fullWidth
      />

      <NumberInput
        source="precioUnitarioProveedor"
        label="Precio proveedor"
        helperText="En ACTIVIDAD y ACTIVIDAD ADICIONAL este campo no aplica; se conserva solo para MATERIAL y PRODUCTO."
        fullWidth
      />

      <BooleanInput source="activo" label="Activo" />

      <FormDataConsumer>
        {({ formData }) =>
          formData?.tipoItem === "MATERIAL" ? (
            <RelacionesActividadMaterialV2
              idMaterial={formData?.idItemOrigen}
              idServicioMaterial={formData?.idServicio}
              editableApi
            />
          ) : null
        }
      </FormDataConsumer>
    </SimpleForm>
  </Edit>
);

export default CatalogoItemEdit;
