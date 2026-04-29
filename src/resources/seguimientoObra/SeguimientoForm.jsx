import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { crearAvance, actualizarAvance } from "./seguimientoService";

const SeguimientoForm = ({
  idCronograma,
  avanceInicial = null,
  onGuardado,
  onCancelar,
}) => {
  const [form, setForm] = useState({
    numeroSemana: "",
    titulo: "",
    descripcion: "",
    observaciones: "",
    porcentajeSemana: "",
    porcentajeGeneral: "",
  });

  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setForm({
      numeroSemana: avanceInicial?.numeroSemana || "",
      titulo: avanceInicial?.titulo || "",
      descripcion: avanceInicial?.descripcion || "",
      observaciones: avanceInicial?.observaciones || "",
      porcentajeSemana: avanceInicial?.porcentajeSemana || "",
      porcentajeGeneral: avanceInicial?.porcentajeGeneral || "",
    });
  }, [avanceInicial]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validar = () => {
    if (!form.numeroSemana || Number(form.numeroSemana) <= 0) {
      alert("La semana es obligatoria");
      return false;
    }

    if (!form.titulo.trim()) {
      alert("El título es obligatorio");
      return false;
    }

    if (!form.descripcion.trim()) {
      alert("La descripción es obligatoria");
      return false;
    }

    if (Number(form.porcentajeSemana || 0) < 0 || Number(form.porcentajeSemana || 0) > 100) {
      alert("El porcentaje de semana debe estar entre 0 y 100");
      return false;
    }

    if (Number(form.porcentajeGeneral || 0) < 0 || Number(form.porcentajeGeneral || 0) > 100) {
      alert("El porcentaje general debe estar entre 0 y 100");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validar()) return;

    try {
      setGuardando(true);

      const payload = {
        idCronograma: Number(idCronograma),
        numeroSemana: Number(form.numeroSemana),
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        observaciones: form.observaciones.trim(),
        porcentajeSemana: Number(form.porcentajeSemana || 0),
        porcentajeGeneral: Number(form.porcentajeGeneral || 0),
      };

      let resultado;

      if (avanceInicial?.idAvance) {
        resultado = await actualizarAvance(avanceInicial.idAvance, payload);
      } else {
        resultado = await crearAvance(payload);
      }

      if (onGuardado) {
        onGuardado(resultado);
      }
    } catch (error) {
      console.error("Error guardando avance:", error);
      alert(error.message || "Error guardando avance");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {avanceInicial ? "Editar avance" : "Registro semanal"}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Semana"
              name="numeroSemana"
              type="number"
              value={form.numeroSemana}
              onChange={handleChange}
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              label="Título"
              name="titulo"
              value={form.titulo}
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
              value={form.descripcion}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Observaciones"
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Porcentaje semana"
              name="porcentajeSemana"
              type="number"
              value={form.porcentajeSemana}
              onChange={handleChange}
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Porcentaje general"
              name="porcentajeGeneral"
              type="number"
              value={form.porcentajeGeneral}
              onChange={handleChange}
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
        </Grid>

        <Box mt={3} display="flex" gap={2}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar"}
          </Button>

          <Button variant="outlined" onClick={onCancelar}>
            Cancelar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SeguimientoForm;