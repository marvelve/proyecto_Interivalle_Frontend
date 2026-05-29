import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { crearAvance, actualizarAvance } from "./SeguimientoService";

const DECIMAL_INPUT_PROPS = {
  inputMode: "decimal",
  pattern: "[0-9]*[.,]?[0-9]*",
};

const tieneValor = (valor) => valor !== undefined && valor !== null && valor !== "";

const normalizarNumero = (valor, fallback = 0) => {
  const numero = Number(String(valor ?? "").trim().replace(",", "."));
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
  const totalSemanasEnteras = Math.floor(totalSemanasCronograma);

  const opcionesSemana = useMemo(() => {
    if (totalSemanasEnteras <= 0) {
      return [];
    }

    return Array.from({ length: totalSemanasEnteras }, (_, index) => index + 1);
  }, [totalSemanasEnteras]);

  const primeraSemanaDisponible = useMemo(() => {
    const semanasRegistradas = new Set(
      (Array.isArray(avancesExistentes) ? avancesExistentes : [])
        .map((avance) => normalizarNumero(avance?.numeroSemana))
        .filter((semana) => semana > 0)
    );

    return (
      opcionesSemana.find((semana) => !semanasRegistradas.has(semana)) ||
      opcionesSemana[0] ||
      ""
    );
  }, [avancesExistentes, opcionesSemana]);

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
      (acumulado, porcentaje) => acumulado + normalizarNumero(porcentaje),
      0
    );

    return redondearPorcentaje(sumaPorcentajes / semanasReferencia);
  };

  useEffect(() => {
    setForm({
      numeroSemana: avanceInicial?.numeroSemana || primeraSemanaDisponible,
      titulo: avanceInicial?.titulo || "",
      descripcion: avanceInicial?.descripcion || "",
      observaciones: avanceInicial?.observaciones || "",
      porcentajeSemana: avanceInicial?.porcentajeSemana ?? "",
      porcentajeGeneral: avanceInicial?.porcentajeGeneral ?? "",
    });
  }, [avanceInicial, primeraSemanaDisponible]);

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
        normalizarNumero(prev.porcentajeSemana) ===
          normalizarNumero(porcentajeSemana) &&
        normalizarNumero(prev.porcentajeGeneral) ===
          normalizarNumero(porcentajeGeneral)
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
    if (!form.numeroSemana || normalizarNumero(form.numeroSemana) <= 0) {
      alert("La semana es obligatoria");
      return false;
    }

    if (totalSemanasEnteras <= 0) {
      alert("El cronograma no tiene semanas registradas");
      return false;
    }

    if (normalizarNumero(form.numeroSemana) > totalSemanasEnteras) {
      alert(`La semana debe estar entre 1 y ${totalSemanasEnteras} para este cronograma`);
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

    const porcentajeSemana = normalizarNumero(form.porcentajeSemana);
    const porcentajeGeneral = calcularPorcentajeGeneralSistema(
      form.numeroSemana,
      porcentajeSemana,
      avanceInicial?.porcentajeGeneral
    );

    if (normalizarNumero(porcentajeSemana) < 0 || normalizarNumero(porcentajeSemana) > 100) {
      alert("El porcentaje de semana debe estar entre 0 y 100");
      return false;
    }

    if (normalizarNumero(porcentajeGeneral) < 0 || normalizarNumero(porcentajeGeneral) > 100) {
      alert("El porcentaje general debe estar entre 0 y 100");
      return false;
    }

    return true;
  };

  const buscarAvanceExistenteSemana = () => {
    if (avanceInicial?.idAvance) return null;

    return (Array.isArray(avancesExistentes) ? avancesExistentes : []).find(
      (avance) =>
        normalizarNumero(avance?.numeroSemana) === normalizarNumero(form.numeroSemana)
    );
  };

  const handleSubmit = async () => {
    if (!form.numeroSemana || normalizarNumero(form.numeroSemana) <= 0) {
      alert("La semana es obligatoria");
      return;
    }

    if (totalSemanasEnteras <= 0) {
      alert("El cronograma no tiene semanas registradas");
      return;
    }

    if (normalizarNumero(form.numeroSemana) > totalSemanasEnteras) {
      alert(`La semana debe estar entre 1 y ${totalSemanasEnteras} para este cronograma`);
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

      const porcentajeSemana = normalizarNumero(form.porcentajeSemana);
      const porcentajeGeneral = calcularPorcentajeGeneralSistema(
        form.numeroSemana,
        porcentajeSemana,
        avanceInicial?.porcentajeGeneral
      );

      const payload = {
        idCronograma: Number(idCronograma),
        numeroSemana: normalizarNumero(form.numeroSemana),
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        observaciones: form.observaciones.trim(),
        porcentajeSemana: normalizarNumero(porcentajeSemana),
        porcentajeGeneral: normalizarNumero(porcentajeGeneral),
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
              select
              value={form.numeroSemana}
              onChange={handleChange}
              disabled={Boolean(avanceInicial?.idAvance) || opcionesSemana.length === 0}
              helperText={
                totalSemanasEnteras > 0
                  ? `Semanas disponibles: 1 a ${totalSemanasEnteras}`
                  : "Sin semanas disponibles"
              }
            >
              {opcionesSemana.map((semana) => (
                <MenuItem key={semana} value={semana}>
                  Semana {semana}
                </MenuItem>
              ))}
            </TextField>
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
              type="text"
              value={form.porcentajeSemana}
              onChange={handleChange}
              inputProps={DECIMAL_INPUT_PROPS}
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
