import * as React from "react";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import { useInput, useNotify, useRefresh } from "react-admin";
import httpClient, { apiUrl } from "../../app/httpClient";

const MODO_CANTIDAD = [
  { id: "POR_ACTIVIDAD", name: "Por actividad" },
  { id: "FIJO", name: "Fijo" },
  { id: "POR_FACTOR", name: "Por factor" },
  { id: "PROPORCIONAL_AREA_PRIVADA", name: "Proporcional area privada" },
];

const SERVICIOS = [
  { id: 1, name: "Obra Blanca" },
  { id: 2, name: "Carpinteria" },
  { id: 3, name: "Divisiones en Vidrio" },
  { id: 4, name: "Mesones Marmol" },
];

const nuevaRelacion = (idServicio = "") => ({
  idActividad: "",
  idServicio,
  cantidad: 1,
  unidadMaterial: "",
  factor: "",
  modoCantidad: "POR_ACTIVIDAD",
  activo: true,
});

const normalizarNumero = (valor) => {
  if (valor === "" || valor === null || valor === undefined) return null;
  return Number(valor);
};

const limpiarRelacionesFormulario = (relaciones) =>
  relaciones
    .filter((relacion) => relacion.idActividad)
    .map((relacion) => ({
      idActividad: normalizarNumero(relacion.idActividad),
      cantidad: normalizarNumero(relacion.cantidad),
      unidadMaterial: relacion.unidadMaterial || null,
      factor: normalizarNumero(relacion.factor),
      modoCantidad: relacion.modoCantidad || "POR_ACTIVIDAD",
      activo: Boolean(relacion.activo),
    }));

const ordenarActividades = (items) =>
  [...items].sort((a, b) =>
    String(a.nombreItem || "").localeCompare(String(b.nombreItem || ""), "es", {
      sensitivity: "base",
    })
  );

const normalizarRelacionLegada = (relacion, actividad) => ({
  idActividadMaterialV2: relacion.idActividadMaterialV2,
  idActividad: relacion.idActividad || actividad.idItemOrigen,
  nombreActividad: relacion.nombreActividad || actividad.nombreItem,
  idMaterial: relacion.idMaterial,
  nombreMaterial: relacion.nombreMaterial,
  idServicio: actividad.idServicio,
  nombreServicio: actividad.nombreServicio,
  cantidad: relacion.cantidad,
  factor: relacion.factor,
  modoCantidad: relacion.modoCantidad || "POR_ACTIVIDAD",
  unidadMaterial: relacion.unidadMaterial || "",
  activo: relacion.activo !== false,
});

const RelacionesActividadMaterialV2 = ({
  idMaterial,
  idServicioMaterial,
  editableApi = false,
}) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const input = useInput({ source: "relacionesActividad", defaultValue: [] });
  const [actividades, setActividades] = React.useState([]);
  const [relaciones, setRelaciones] = React.useState([]);
  const [cargando, setCargando] = React.useState(false);
  const relacionesFormularioInicializadas = React.useRef(false);

  const cargarRelacionesDesdeCatalogoV2 = React.useCallback(async () => {
    const { json: catalogoJson } = await httpClient(`${apiUrl}/api/catalogo-items`);
    const actividadesCatalogo = ordenarActividades(
      (Array.isArray(catalogoJson) ? catalogoJson : []).filter(
        (item) =>
          item.tipoItem === "ACTIVIDAD" &&
          item.activo &&
          (!idServicioMaterial ||
            Number(item.idServicio) === Number(idServicioMaterial))
      )
    );

    const respuestas = await Promise.all(
      actividadesCatalogo.map(async (actividad) => {
        try {
          const { json } = await httpClient(
            `${apiUrl}/api/pruebas/catalogo-v2/materiales-actividad/${actividad.idItemOrigen}`
          );
          return {
            actividad,
            relaciones: Array.isArray(json?.relaciones) ? json.relaciones : [],
          };
        } catch (error) {
          return { actividad, relaciones: [] };
        }
      })
    );

    return respuestas.flatMap(({ actividad, relaciones: relacionesActividad }) =>
      relacionesActividad
        .filter((relacion) => Number(relacion.idMaterial) === Number(idMaterial))
        .map((relacion) => normalizarRelacionLegada(relacion, actividad))
    );
  }, [idMaterial, idServicioMaterial]);

  React.useEffect(() => {
    let activo = true;

    const cargarActividades = async () => {
      try {
        const { json } = await httpClient(`${apiUrl}/api/catalogo-items`);
        if (!activo) return;

        setActividades(
          ordenarActividades(
            (Array.isArray(json) ? json : []).filter(
              (item) => item.tipoItem === "ACTIVIDAD" && item.activo
            )
          )
        );
      } catch (error) {
        notify("No se pudieron cargar las actividades V2", { type: "warning" });
      }
    };

    cargarActividades();
    return () => {
      activo = false;
    };
  }, [notify]);

  React.useEffect(() => {
    if (!editableApi || !idMaterial) {
      if (relacionesFormularioInicializadas.current) {
        return;
      }

      const valorFormulario = Array.isArray(input.field.value)
        ? input.field.value
        : [];
      setRelaciones(valorFormulario);
      relacionesFormularioInicializadas.current = true;
      return;
    }

    let activo = true;

    const cargarRelaciones = async () => {
      setCargando(true);
      try {
        const { json } = await httpClient(
          `${apiUrl}/api/catalogo-items/materiales/${idMaterial}/relaciones`
        );

        if (!activo) return;
        setRelaciones(Array.isArray(json) ? json : []);
      } catch (error) {
        try {
          const relacionesLegadas = await cargarRelacionesDesdeCatalogoV2();
          if (!activo) return;
          setRelaciones(relacionesLegadas);
        } catch (fallbackError) {
          notify("No se pudieron cargar las relaciones del material", {
            type: "warning",
          });
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarRelaciones();
    return () => {
      activo = false;
    };
  }, [
    cargarRelacionesDesdeCatalogoV2,
    editableApi,
    idMaterial,
    input.field.value,
    notify,
  ]);

  const sincronizarFormulario = (siguientes) => {
    setRelaciones(siguientes);
    if (!editableApi) {
      input.field.onChange(limpiarRelacionesFormulario(siguientes));
    }
  };

  const actualizarRelacion = (index, campo, valor) => {
    const siguientes = relaciones.map((relacion, i) =>
      i === index ? { ...relacion, [campo]: valor } : relacion
    );

    sincronizarFormulario(siguientes);
  };

  const actualizarRelacionMultiple = (index, cambios) => {
    const siguientes = relaciones.map((relacion, i) =>
      i === index ? { ...relacion, ...cambios } : relacion
    );

    sincronizarFormulario(siguientes);
  };

  const agregarRelacion = () => {
    sincronizarFormulario([
      ...relaciones,
      nuevaRelacion(idServicioMaterial || ""),
    ]);
  };

  const guardarRelacion = async (relacion, index) => {
    if (!editableApi || !idMaterial) return;

    if (!relacion.idActividad) {
      notify("Selecciona una actividad para guardar la relacion", {
        type: "warning",
      });
      return;
    }

    const payload = {
      idActividad: normalizarNumero(relacion.idActividad),
      cantidad: normalizarNumero(relacion.cantidad),
      unidadMaterial: relacion.unidadMaterial || null,
      factor: normalizarNumero(relacion.factor),
      modoCantidad: relacion.modoCantidad || "POR_ACTIVIDAD",
      activo: Boolean(relacion.activo),
    };

    const url = relacion.idActividadMaterialV2
      ? `${apiUrl}/api/catalogo-items/materiales/${idMaterial}/relaciones/${relacion.idActividadMaterialV2}`
      : `${apiUrl}/api/catalogo-items/materiales/${idMaterial}/relaciones`;

    try {
      const { json } = await httpClient(url, {
        method: relacion.idActividadMaterialV2 ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      const siguientes = relaciones.map((item, i) => (i === index ? json : item));
      setRelaciones(siguientes);
      notify("Relacion guardada", { type: "success" });
      refresh();
    } catch (error) {
      notify("No se pudo guardar la relacion", { type: "error" });
    }
  };

  const actividadesPorServicio = (idServicio) =>
    actividades.filter(
      (actividad) => !idServicio || Number(actividad.idServicio) === Number(idServicio)
    );

  if (!editableApi && input.fieldState?.error) {
    console.warn(input.fieldState.error);
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, width: "100%" }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Relaciones con actividades</Typography>
          <Button startIcon={<AddIcon />} onClick={agregarRelacion} variant="outlined">
            Agregar
          </Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Servicio</TableCell>
              <TableCell>Actividad</TableCell>
              <TableCell>Cantidad base</TableCell>
              <TableCell>Unidad</TableCell>
              <TableCell>Factor</TableCell>
              <TableCell>Calculo</TableCell>
              <TableCell>Estado</TableCell>
              {editableApi && <TableCell align="right">Guardar</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {relaciones.map((relacion, index) => {
              const idServicio = relacion.idServicio || "";

              return (
                <TableRow key={relacion.idActividadMaterialV2 || index}>
                  <TableCell sx={{ minWidth: 170 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Servicio</InputLabel>
                      <Select
                        label="Servicio"
                        value={idServicio}
                        onChange={(event) => {
                          actualizarRelacionMultiple(index, {
                            idServicio: event.target.value,
                            idActividad: "",
                          });
                        }}
                      >
                        {SERVICIOS.map((servicio) => (
                          <MenuItem key={servicio.id} value={servicio.id}>
                            {servicio.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>

                  <TableCell sx={{ minWidth: 240 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Actividad</InputLabel>
                      <Select
                        label="Actividad"
                        value={relacion.idActividad || ""}
                        onChange={(event) =>
                          actualizarRelacion(index, "idActividad", event.target.value)
                        }
                      >
                        {actividadesPorServicio(idServicio).map((actividad) => (
                          <MenuItem
                            key={actividad.idItemOrigen}
                            value={actividad.idItemOrigen}
                          >
                            {actividad.nombreItem}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>

                  <TableCell sx={{ width: 130 }}>
                    <TextField
                      type="number"
                      size="small"
                      value={relacion.cantidad ?? ""}
                      onChange={(event) =>
                        actualizarRelacion(index, "cantidad", event.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell sx={{ width: 130 }}>
                    <TextField
                      size="small"
                      value={relacion.unidadMaterial || ""}
                      onChange={(event) =>
                        actualizarRelacion(index, "unidadMaterial", event.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell sx={{ width: 120 }}>
                    <TextField
                      type="number"
                      size="small"
                      value={relacion.factor ?? ""}
                      onChange={(event) =>
                        actualizarRelacion(index, "factor", event.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell sx={{ minWidth: 190 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Calculo</InputLabel>
                      <Select
                        label="Calculo"
                        value={relacion.modoCantidad || "POR_ACTIVIDAD"}
                        onChange={(event) =>
                          actualizarRelacion(index, "modoCantidad", event.target.value)
                        }
                      >
                        {MODO_CANTIDAD.map((modo) => (
                          <MenuItem key={modo.id} value={modo.id}>
                            {modo.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>

                  <TableCell>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={Boolean(relacion.activo)}
                          onChange={(event) =>
                            actualizarRelacion(index, "activo", event.target.checked)
                          }
                        />
                      }
                      label={relacion.activo ? "Activo" : "Inactivo"}
                    />
                  </TableCell>

                  {editableApi && (
                    <TableCell align="right">
                      <IconButton
                        aria-label="Guardar relacion"
                        onClick={() => guardarRelacion(relacion, index)}
                      >
                        <SaveIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}

            {!relaciones.length && (
              <TableRow>
                <TableCell colSpan={editableApi ? 8 : 7}>
                  <Typography color="text.secondary">
                    {cargando ? "Cargando relaciones..." : "Sin relaciones registradas."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Stack>
    </Paper>
  );
};

export default RelacionesActividadMaterialV2;
