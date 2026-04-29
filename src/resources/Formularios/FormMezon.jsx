import React from "react";
import { Box, Grid, TextField, Typography } from "@mui/material";

const FormMezon = ({ data, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...data,
      [name]: value,
    });
  };

  return (
    <Box mb={4}>
      <Typography variant="h6" mb={2}>
        Formulario Mesón Granito
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Tipo de Granito"
            name="tipoGranito"
            value={data.tipoGranito || ""}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            label="Largo"
            name="largo"
            value={data.largo || ""}
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
            label="Espesor"
            name="espesor"
            value={data.espesor || ""}
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

export default FormMezon;