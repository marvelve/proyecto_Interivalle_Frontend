import {
  Create,
  SelectInput,
  SimpleForm,
  TextInput,
  required,
} from "react-admin";

const ROLES = [
  { id: 3, name: "CLIENTE" },
  { id: 2, name: "SUPERVISOR" },
  { id: 1, name: "ADMIN" },
];

const NOMBRE_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validarNombre = (value) => {
  if (!value) return "El nombre es obligatorio";

  // Permite letras y espacios, igual que el registro publico.
  if (!NOMBRE_REGEX.test(value)) {
    return "El nombre solo debe contener letras y espacios";
  }

  if (value.replace(/\s/g, "").length < 5) {
    return "El nombre debe tener mínimo 5 letras";
  }

  return undefined;
};

const validarCorreo = (value) => {
  if (!value) return "El correo es obligatorio";

  if (!CORREO_REGEX.test(value)) {
    return "Ingrese un correo válido";
  }

  return undefined;
};

const validarContrasena = (value) => {
  if (!value) return "La contraseña es obligatoria";
  if (value.length < 6) return "La contraseña debe tener al menos 6 caracteres";
  if (!/[A-Za-z]/.test(value)) return "La contraseña debe contener al menos una letra";
  if (!/\d/.test(value)) return "La contraseña debe contener al menos un número";
  return undefined;
};

const validarCelular = (value) => {
  if (!value) return "El celular es obligatorio";

  if (!/^\d+$/.test(value)) {
    return "El celular solo debe contener números";
  }

  return undefined;
};

const UsuarioCreate = () => {
  return (
    <Create redirect="list" resource="admin/usuarios">
      <SimpleForm>
        <TextInput
          source="nombreUsuario"
          label="Nombre completo"
          fullWidth
          validate={[required(), validarNombre]}
        />

        <TextInput
          source="correoUsuario"
          label="Correo electrónico"
          fullWidth
          validate={[required(), validarCorreo]}
        />

        <TextInput
          source="contrasenaUsuario"
          label="Contraseña"
          type="password"
          fullWidth
          validate={[required(), validarContrasena]}
        />

        <TextInput
          source="celularUsuario"
          label="Celular"
          fullWidth
          validate={[required(), validarCelular]}
        />

        <TextInput
          source="ciudadUsuario"
          label="Ciudad"
          fullWidth
          validate={[required()]}
        />

        <SelectInput
          source="idRol"
          label="Rol"
          choices={ROLES}
          defaultValue={3}
          validate={[required()]}
        />
      </SimpleForm>
    </Create>
  );
};

export default UsuarioCreate;
