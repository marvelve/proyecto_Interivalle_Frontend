import React from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

const FormVidrio = ({ data, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...data,
      [name]: value,
    });
  };

  const handleCheck = (e) => {
    onChange({
      ...data,
      instalacion: e.target.checked,
    });
  };

  return (
    <Box mb={4}>
      <Typography variant="h6" mb={2}>
        Formulario Divisiones en Vidrio
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Tipo de Vidrio"
            name="tipoVidrio"
            value={data.tipoVidrio || ""}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            label="Ancho"
            name="ancho"
            value={data.ancho || ""}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            label="Alto"
            name="alto"
            value={data.alto || ""}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            label="Cantidad"
            name="cantidad"
            value={data.cantidad || ""}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            label="Precio Unitario"
            name="precioUnitario"
            value={data.precioUnitario || ""}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4} display="flex" alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                checked={!!data.instalacion}
                onChange={handleCheck}
              />
            }
            label="¿Incluye instalación?"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Descripción"
            name="descripcion"
            value={data.descripcion || ""}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FormVidrio;