import {
  List,
  Datagrid,
  TextField,
  EmailField,
} from "react-admin";

const UsuarioList = () => {
  return (
    <List title="Listado de usuarios">
      <Datagrid rowClick="edit">
        <TextField source="id" label="ID" />
        <TextField source="nombreUsuario" label="Nombre" />
        <EmailField source="correoUsuario" label="Correo" />
        <TextField source="celularUsuario" label="Celular" />
        <TextField source="ciudadUsuario" label="Ciudad" />
        <TextField source="idRol" label="Rol" />
      </Datagrid>
    </List>
  );
};

export default UsuarioList;