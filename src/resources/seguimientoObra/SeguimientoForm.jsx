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
import { crearAvance, actualizarAvance } from "./SeguimientoService";

const tieneValor = (valor) => valor !== undefined && valor !== null && valor !== "";

const normalizarNumero = (valor, fallback = 0) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : fallback;
};

const redondearPorcentaje = (valor) => {
  const numero = normalizarNumero(valor);
  const limitado = Math.min(100, Math.max(0, numero));
  return Math.round(limitado * 100) / 100;
};

const SeguimientoForm = ({
  idCronograma,
  avanceInicial = null,
  avancesExistentes = [],
  totalSemanas,
  onGuardado,
  onCancelar,
  onEditarExistente,
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
  const totalSemanasCronograma = normalizarNumero(totalSemanas);

  const calcularPorcentajeGeneralSistema = (
    numeroSemana,
    porcentajeSemana,
    porcentajeGeneralActual = ""
  ) => {
    const semanaActual = normalizarNumero(numeroSemana);

    if (!semanaActual) {
      return "";
    }

    if (
      totalSemanasCronograma <= 0 &&
      avanceInicial?.idAvance &&
      tieneValor(porcentajeGeneralActual)
    ) {
      return redondearPorcentaje(porcentajeGeneralActual);
    }

    const porcentajesPorSemana = new Map();

    (Array.isArray(avancesExistentes) ? avancesExistentes : []).forEach(
      (avance) => {
        const semana = normalizarNumero(avance?.numeroSemana);

        if (!semana) {
          return;
        }

        const porcentaje = redondearPorcentaje(avance?.porcentajeSemana || 0);
        const porcentajeActual = porcentajesPorSemana.get(semana) || 0;
        porcentajesPorSemana.set(semana, Math.max(porcentajeActual, porcentaje));
      }
    );

    porcentajesPorSemana.set(
      semanaActual,
      redondearPorcentaje(porcentajeSemana || 0)
    );

    const semanasReferencia =
      totalSemanasCronograma > 0
        ? totalSemanasCronograma
        : Math.max(...porcentajesPorSemana.keys(), semanaActual, 1);

    const sumaPorcentajes = [...porcentajesPorSemana.values()].reduce(
      (acumulado, porcentaje) => acumulado + Number(porcentaje || 0),
      0
    );

    return redondearPorcentaje(sumaPorcentajes / semanasReferencia);
  };

  useEffect(() => {
    setForm({
      numeroSemana: avanceInicial?.numeroSemana || "",
      titulo: avanceInicial?.titulo || "",
      descripcion: avanceInicial?.descripcion || "",
      observaciones: avanceInicial?.observaciones || "",
      porcentajeSemana: avanceInicial?.porcentajeSemana ?? "",
      porcentajeGeneral: avanceInicial?.porcentajeGeneral ?? "",
    });
  }, [avanceInicial]);

  useEffect(() => {
    const numeroSemana = normalizarNumero(form.numeroSemana);

    if (!numeroSemana) {
      return;
    }

    const porcentajeSemana = redondearPorcentaje(form.porcentajeSemana || 0);
    const porcentajeGeneral = calcularPorcentajeGeneralSistema(
      numeroSemana,
      porcentajeSemana,
      avanceInicial?.porcentajeGeneral
    );

    setForm((prev) => {
      if (
        Number(prev.porcentajeSemana) === Number(porcentajeSemana) &&
        Number(prev.porcentajeGeneral) === Number(porcentajeGeneral)
      ) {
        return prev;
      }

      return {
        ...prev,
        porcentajeGeneral,
      };
    });
  }, [
    form.numeroSemana,
    form.porcentajeSemana,
    avanceInicial,
    avancesExistentes,
    totalSemanas,
  ]);

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

    const porcentajeSemana = Number(form.porcentajeSemana || 0);
    const porcentajeGeneral = calcularPorcentajeGeneralSistema(
      form.numeroSemana,
      porcentajeSemana,
      avanceInicial?.porcentajeGeneral
    );

    if (Number(porcentajeSemana || 0) < 0 || Number(porcentajeSemana || 0) > 100) {
      alert("El porcentaje de semana debe estar entre 0 y 100");
      return false;
    }

    if (Number(porcentajeGeneral || 0) < 0 || Number(porcentajeGeneral || 0) > 100) {
      alert("El porcentaje general debe estar entre 0 y 100");
      return false;
    }

    return true;
  };

  const buscarAvanceExistenteSemana = () => {
    if (avanceInicial?.idAvance) return null;

    return (Array.isArray(avancesExistentes) ? avancesExistentes : []).find(
      (avance) => Number(avance?.numeroSemana) === Number(form.numeroSemana)
    );
  };

  const handleSubmit = async () => {
    if (!form.numeroSemana || Number(form.numeroSemana) <= 0) {
      alert("La semana es obligatoria");
      return;
    }

    const avanceExistente = buscarAvanceExistenteSemana();

    if (avanceExistente) {
      alert(
        `La Semana ${form.numeroSemana} ya tiene un avance registrado. Debes editar esa semana para actualizar el porcentaje, la descripción o las observaciones.`
      );

      if (onEditarExistente) {
        onEditarExistente(avanceExistente);
      }

      return;
    }

    if (!validar()) return;

    try {
      setGuardando(true);

      const porcentajeSemana = Number(form.porcentajeSemana || 0);
      const porcentajeGeneral = calcularPorcentajeGeneralSistema(
        form.numeroSemana,
        porcentajeSemana,
        avanceInicial?.porcentajeGeneral
      );

      const payload = {
        idCronograma: Number(idCronograma),
        numeroSemana: Number(form.numeroSemana),
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        observaciones: form.observaciones.trim(),
        porcentajeSemana: Number(porcentajeSemana || 0),
        porcentajeGeneral: Number(porcentajeGeneral || 0),
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
              disabled={Boolean(avanceInicial?.idAvance)}
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
              disabled
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
