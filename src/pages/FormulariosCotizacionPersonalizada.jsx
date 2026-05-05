import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { useNotify } from "react-admin";
import httpClient, { apiUrl } from "../app/httpClient";

import FormObraBlanca from "../resources/Formularios/FormObraBlanca";

const SERVICIOS = {
  1: "Mano de Obra Blanca",
  2: "Carpintería",
  3: "Divisiones en Vidrio",
  4: "Mesones en Mármol",
};

const crearActividadVacia = () => ({
  idObraBlanca: null,
  idActividad: "",
  lugar: "",
  cantidad: "",
  medida: "",
  tipoCobro: "",
  precioUnitario: "",
  descripcion: "",
  subtotal: 0,
  yaGuardada: false,
});

const normalizarTexto = (texto) =>
  (texto || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

const obtenerIdServicio = (servicio) => {
  if (servicio === null || servicio === undefined) return null;
  if (typeof servicio === "number" || typeof servicio === "string") {
    const n = Number(servicio);
    return Number.isNaN(n) ? null : n;
  }

  return (
    servicio?.idServicio ||
    servicio?.idServicios ||
    servicio?.id_servicio ||
    servicio?.id_servicios ||
    servicio?.servicios?.idServicio ||
    servicio?.servicios?.idServicios ||
    servicio?.servicios?.id_servicio ||
    servicio?.servicios?.id_servicios ||
    servicio?.servicio?.idServicio ||
    servicio?.servicio?.idServicios ||
    servicio?.servicio?.id_servicio ||
    servicio?.servicio?.id_servicios ||
    null
  );
};

const obtenerServiciosDeSolicitud = (data) => {
  return (
    data?.solicitudServicios ||
    data?.servicios ||
    data?.serviciosSeleccionados ||
    data?.detalleServicios ||
    []
  );
};

const esCotizacionCerrada = (estado) =>
  ["APROBADA", "RECHAZADA"].includes((estado || "").toString().toUpperCase());

const toNumberOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const esTipoMetro = (tipoCobro = "") =>
  normalizarTexto(tipoCobro).includes("METRO CUADRADO");

const esTipoUnidad = (tipoCobro = "") => {
  const tipo = normalizarTexto(tipoCobro);
  return tipo.includes("UNIDAD") || tipo.includes("OBJETO");
};

const filaTieneDatos = (item) => {
  if (!item || item.yaGuardada) return false;
  return Boolean(
    item.idActividad ||
      item.lugar?.trim() ||
      item.cantidad !== "" ||
      item.medida !== "" ||
      Number(item.subtotal) > 0
  );
};

const filaEsValida = (item) => {
  if (!item.idActividad) return false;
  if (!item.lugar || !item.lugar.trim()) return false;
  if (!item.subtotal || Number(item.subtotal) <= 0) return false;

  if (esTipoMetro(item.tipoCobro)) {
    return Number(item.medida || 0) > 0;
  }

  if (esTipoUnidad(item.tipoCobro)) {
    return Number(item.cantidad || 0) > 0;
  }

  return Number(item.cantidad || 0) > 0 || Number(item.medida || 0) > 0;
};

const FormulariosCotizacionPersonalizada = () => {
  const { idCotizacion } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [solicitud, setSolicitud] = useState(null);
  const [cotizacion, setCotizacion] = useState(null);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [idSolicitud, setIdSolicitud] = useState(null);
  const [actividadesCatalogo, setActividadesCatalogo] = useState([]);
  const [idCotizacionPersonalizada, setIdCotizacionPersonalizada] =
    useState(null);

  const [obraBlanca, setObraBlanca] = useState([crearActividadVacia()]);
  const [carpinteria, setCarpinteria] = useState([crearActividadVacia()]);
  const [vidrio, setVidrio] = useState([crearActividadVacia()]);
  const [meson, setMeson] = useState([crearActividadVacia()]);
  const [errores, setErrores] = useState({
    1: [{}],
    2: [{}],
    3: [{}],
    4: [{}],
  });

  const nombreProyecto = useMemo(() => {
    return (
      cotizacion?.nombreProyecto ||
      solicitud?.nombreProyecto ||
      solicitud?.nombreProyectoUsuario ||
      localStorage.getItem("nombreProyecto") ||
      ""
    );
  }, [cotizacion, solicitud]);

  const serviciosIds = useMemo(() => {
    const ids = serviciosSeleccionados
      .map(obtenerIdServicio)
      .filter(Boolean)
      .map(Number)
      .filter((id) => !Number.isNaN(id));

    return [...new Set(ids)];
  }, [serviciosSeleccionados]);

  const cotizacionCerrada = esCotizacionCerrada(cotizacion?.estado);

  const actividadesPorServicio = useMemo(() => {
    const pertenece = (item, idServicio) => {
      const id = Number(obtenerIdServicio(item?.servicios || item));
      const nombreServicio = normalizarTexto(
        item?.servicios?.nombreServicio || item?.nombreServicio || ""
      );

      if (id === idServicio) return true;
      if (idServicio === 1) {
        return nombreServicio.includes("OBRA") || nombreServicio.includes("MANO");
      }
      if (idServicio === 2) return nombreServicio.includes("CARPINTER");
      if (idServicio === 3) return nombreServicio.includes("VIDRIO");
      if (idServicio === 4) {
        return (
          nombreServicio.includes("MESON") ||
          nombreServicio.includes("MARMOL") ||
          nombreServicio.includes("GRANITO")
        );
      }
      return false;
    };

    return {
      1: actividadesCatalogo.filter((item) => pertenece(item, 1)),
      2: actividadesCatalogo.filter((item) => pertenece(item, 2)),
      3: actividadesCatalogo.filter((item) => pertenece(item, 3)),
      4: actividadesCatalogo.filter((item) => pertenece(item, 4)),
    };
  }, [actividadesCatalogo]);

  useEffect(() => {
    cargarDatosIniciales();
  }, [idCotizacion]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);

      const serviciosLS = JSON.parse(
        localStorage.getItem("serviciosSeleccionados") || "[]"
      );

      if (Array.isArray(serviciosLS) && serviciosLS.length > 0) {
        setServiciosSeleccionados(serviciosLS);
      }

      try {
        const { json: catalogoJson } = await httpClient(
          `${apiUrl}/api/actividades-personalizadas`,
          { method: "GET" }
        );
        setActividadesCatalogo(Array.isArray(catalogoJson) ? catalogoJson : []);
      } catch (errorCatalogo) {
        console.warn("No fue posible cargar el catálogo de actividades:", errorCatalogo);
      }

      const { json: cotizacionJson } = await httpClient(
        `${apiUrl}/api/cliente/cotizaciones/${idCotizacion}`,
        { method: "GET" }
      );

      setCotizacion(cotizacionJson);

      const solicitudIdDesdeCotizacion =
        cotizacionJson?.solicitudId ||
        cotizacionJson?.idSolicitud ||
        cotizacionJson?.solicitud?.idSolicitud ||
        cotizacionJson?.solicitud?.solicitudId;

      if (solicitudIdDesdeCotizacion) {
        setIdSolicitud(solicitudIdDesdeCotizacion);

        try {
          const { json: solicitudJson } = await httpClient(
            `${apiUrl}/api/solicitudes/${solicitudIdDesdeCotizacion}`,
            { method: "GET" }
          );

          setSolicitud(solicitudJson);

          const serviciosSolicitud = obtenerServiciosDeSolicitud(solicitudJson);
          if (Array.isArray(serviciosSolicitud) && serviciosSolicitud.length > 0) {
            setServiciosSeleccionados(serviciosSolicitud);
          }
        } catch (errorSolicitud) {
          console.warn("No fue posible cargar la solicitud:", errorSolicitud);
        }
      }

      await cargarPersonalizadaExistente();
    } catch (error) {
      console.error("Error cargando datos iniciales:", error);
      notify("No fue posible cargar los datos iniciales", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const cargarPersonalizadaExistente = async () => {
    try {
      const { json } = await httpClient(
        `${apiUrl}/api/cotizaciones-personalizadas/cotizacion/${idCotizacion}/detalle`,
        { method: "GET" }
      );

      if (json?.idCotizacionPersonalizada) {
        setIdCotizacionPersonalizada(json.idCotizacionPersonalizada);
      }

      const actividadesObra = Array.isArray(json?.obraBlanca)
        ? json.obraBlanca
        : [];

      if (actividadesObra.length > 0) {
        setObraBlanca([
          ...actividadesObra.map((item) => ({
            idObraBlanca: item.idObraBlanca || null,
            idActividad: item.idActividad || "",
            lugar: item.lugar || "",
            cantidad: item.cantidad ?? "",
            medida: item.medida ?? "",
            tipoCobro: item.tipoCobro || item.unidad || "",
            precioUnitario: item.precioUnitario ?? "",
            descripcion: item.descripcion || item.actividad || "",
            subtotal: item.subtotal ?? 0,
            yaGuardada: true,
          })),
          crearActividadVacia(),
        ]);
      }
    } catch (error) {
      const mensaje = error?.body?.message || error?.message || "";
      if (!mensaje.includes("No existe cotización personalizada")) {
        console.warn("No fue posible cargar adicionales existentes:", error);
      }
    }
  };

  const actividadSeleccionada = (idServicio, idActividad) => {
    return (actividadesPorServicio[idServicio] || []).find(
      (act) => String(act.idActividad ?? act.id) === String(idActividad)
    );
  };

  const validarFormularioServicio = (idServicio, items) => {
    const nuevosConDatos = items.filter(filaTieneDatos);

    const erroresServicio = items.map((item) => {
      if (!filaTieneDatos(item)) return {};

      const error = {};
      if (!item.idActividad) error.idActividad = "La actividad es obligatoria";
      if (!item.lugar || !item.lugar.trim()) error.lugar = "El lugar es obligatorio";
      if (!item.subtotal || Number(item.subtotal) <= 0) {
        error.subtotal = "El subtotal es obligatorio y debe ser mayor a 0";
      }
      return error;
    });

    setErrores((prev) => ({ ...prev, [idServicio]: erroresServicio }));

    return nuevosConDatos.every(filaEsValida);
  };

  const validarTodosLosFormularios = () => {
    const formularios = {
      1: obraBlanca,
      2: carpinteria,
      3: vidrio,
      4: meson,
    };

    let hayActividadNueva = false;
    let todoValido = true;

    serviciosIds.forEach((idServicio) => {
      const items = formularios[idServicio] || [];
      if (items.some(filaTieneDatos)) hayActividadNueva = true;
      if (!validarFormularioServicio(idServicio, items)) todoValido = false;
    });

    if (!hayActividadNueva) {
      notify("Debes adicionar al menos una actividad nueva", { type: "warning" });
      return false;
    }

    if (!todoValido) {
      notify("Completa Actividad, Lugar y los datos de cálculo de cada actividad", {
        type: "warning",
      });
      return false;
    }

    return true;
  };

  const crearCotizacionSiNoExiste = async () => {
    if (idCotizacionPersonalizada) return idCotizacionPersonalizada;

    if (!idSolicitud) {
      throw new Error("No se pudo identificar la solicitud de la cotización");
    }

    const payload = {
      idCotizacion: Number(idCotizacion),
      idSolicitud: Number(idSolicitud),
      nombreProyecto,
      observacionGeneral: "Adición de actividades personalizadas",
    };

    const { json } = await httpClient(`${apiUrl}/api/cotizaciones-personalizadas`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: new Headers({ "Content-Type": "application/json" }),
    });

    const idPersonalizada =
      json?.idCotizacionPersonalizada || json?.id || null;

    if (!idPersonalizada) {
      throw new Error("No se recibió idCotizacionPersonalizada al crear la cabecera");
    }

    setIdCotizacionPersonalizada(idPersonalizada);
    return idPersonalizada;
  };

  const filasNuevasValidas = (items) =>
    items.filter((item) => filaTieneDatos(item) && filaEsValida(item));

  const guardarObraBlanca = async () => {
    if (!serviciosIds.includes(1)) return;

    for (const item of filasNuevasValidas(obraBlanca)) {
      const act = actividadSeleccionada(1, item.idActividad);
      const tipoCobro = item.tipoCobro || act?.tipoCobro || "";

      const payload = {
        idCotizacion: Number(idCotizacion),
        idActividad: Number(item.idActividad),
        actividad: act?.nombreActividad || item.descripcion || "",
        lugar: item.lugar.trim(),
        unidad: tipoCobro || null,
        cantidad: esTipoMetro(tipoCobro) ? null : toNumberOrNull(item.cantidad),
        semanas: null,
        precioUnitario: toNumberOrNull(item.precioUnitario),
        medida: esTipoUnidad(tipoCobro) ? null : toNumberOrNull(item.medida),
        descripcion: item.descripcion || act?.nombreActividad || "",
      };

      await httpClient(`${apiUrl}/api/obra-blanca`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: new Headers({ "Content-Type": "application/json" }),
      });
    }
  };

  const guardarServicioProducto = async (idServicio, idPersonalizada, items) => {
    const filas = filasNuevasValidas(items);
    if (filas.length === 0) return;

    for (const item of filas) {
      const act = actividadSeleccionada(idServicio, item.idActividad);
      const nombre = act?.nombreActividad || item.descripcion || "";
      const tipoCobro = item.tipoCobro || act?.tipoCobro || "";
      const cantidad = esTipoMetro(tipoCobro) ? null : toNumberOrNull(item.cantidad);
      const medida = esTipoUnidad(tipoCobro) ? null : toNumberOrNull(item.medida);

      const datosArea = {
        largo: medida,
        ancho: medida ? 1 : null,
      };

      let url = "";
      let payload = {};

      if (idServicio === 2) {
        url = `${apiUrl}/api/carpinteria`;
        payload = {
          idCotizacion: Number(idPersonalizada),
          tipoMueble: nombre,
          material: item.lugar.trim(),
          largo: datosArea.largo,
          ancho: datosArea.ancho,
          alto: null,
          cantidad,
          precioUnitario: toNumberOrNull(item.precioUnitario),
          descripcion: item.descripcion || nombre,
        };
      }

      if (idServicio === 3) {
        url = `${apiUrl}/api/vidrio`;
        payload = {
          idCotizacion: Number(idPersonalizada),
          tipoVidrio: nombre,
          ancho: datosArea.largo,
          alto: datosArea.ancho,
          cantidad,
          instalacion: false,
          precioUnitario: toNumberOrNull(item.precioUnitario),
          descripcion: item.descripcion || nombre,
        };
      }

      if (idServicio === 4) {
        url = `${apiUrl}/api/meson-granito`;
        payload = {
          idCotizacion: Number(idPersonalizada),
          tipoGranito: nombre,
          largo: datosArea.largo,
          ancho: datosArea.ancho,
          espesor: null,
          cantidad,
          precioUnitario: toNumberOrNull(item.precioUnitario),
          descripcion: item.descripcion || nombre,
        };
      }

      if (url) {
        await httpClient(url, {
          method: "POST",
          body: JSON.stringify(payload),
          headers: new Headers({ "Content-Type": "application/json" }),
        });
      }
    }
  };

  const guardarTodosLosFormularios = async (idPersonalizada) => {
    await guardarObraBlanca();
    if (serviciosIds.includes(2)) {
      await guardarServicioProducto(2, idPersonalizada, carpinteria);
    }
    if (serviciosIds.includes(3)) {
      await guardarServicioProducto(3, idPersonalizada, vidrio);
    }
    if (serviciosIds.includes(4)) {
      await guardarServicioProducto(4, idPersonalizada, meson);
    }
  };

  const recalcularCotizacion = async (idPersonalizada) => {
    await httpClient(
      `${apiUrl}/api/cotizaciones-personalizadas/${idPersonalizada}/recalcular`,
      {
        method: "PUT",
        headers: new Headers({ "Content-Type": "application/json" }),
      }
    );
  };

  const handleGenerarYVer = async () => {
    if (cotizacionCerrada) {
      notify("La cotización ya no permite adicionar actividades", {
        type: "warning",
      });
      return;
    }

    if (!validarTodosLosFormularios()) return;

    try {
      setGuardando(true);

      const idPersonalizada = await crearCotizacionSiNoExiste();
      await guardarTodosLosFormularios(idPersonalizada);
      await recalcularCotizacion(idPersonalizada);

      notify("Cotización personalizada generada correctamente", {
        type: "success",
      });

      navigate(`/cotizaciones/${idCotizacion}/vista`);
    } catch (error) {
      console.error(error);
      notify(
        error?.body?.message ||
          error?.message ||
          "Error al generar la cotización personalizada",
        { type: "error" }
      );
    } finally {
      setGuardando(false);
    }
  };

  const nombresServicios = serviciosIds
    .map((id) => SERVICIOS[id])
    .filter(Boolean)
    .join(", ");

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Cargando formularios.</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Card sx={{ maxWidth: 1100, mx: "auto", borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" mb={3}>
            Cotización Personalizada
          </Typography>

          <Box
            mb={3}
            p={2}
            sx={{
              backgroundColor: "#f5f8ff",
              borderRadius: 2,
              border: "1px solid #dbe7ff",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Cotización N° {cotizacion?.idCotizacion || idCotizacion}
            </Typography>

            <Typography>
              <strong>Proyecto:</strong> {nombreProyecto || "Sin nombre"}
            </Typography>

            <Typography>
              <strong>Servicios seleccionados:</strong>{" "}
              {nombresServicios || "Ninguno"}
            </Typography>
          </Box>

          {cotizacionCerrada && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Esta cotización está {cotizacion?.estado}. No se pueden adicionar
              nuevas actividades.
            </Alert>
          )}

          {serviciosIds.includes(1) && (
            <FormObraBlanca
              actividadesCatalogo={actividadesPorServicio[1]}
              value={obraBlanca}
              onChange={setObraBlanca}
              errors={errores[1]}
              titulo="Formulario Obra Blanca"
              disabled={cotizacionCerrada || guardando}
            />
          )}

          {serviciosIds.includes(2) && (
            <FormObraBlanca
              actividadesCatalogo={actividadesPorServicio[2]}
              value={carpinteria}
              onChange={setCarpinteria}
              errors={errores[2]}
              titulo="Formulario Carpintería"
              disabled={cotizacionCerrada || guardando}
            />
          )}

          {serviciosIds.includes(3) && (
            <FormObraBlanca
              actividadesCatalogo={actividadesPorServicio[3]}
              value={vidrio}
              onChange={setVidrio}
              errors={errores[3]}
              titulo="Formulario Divisiones en Vidrio"
              disabled={cotizacionCerrada || guardando}
            />
          )}

          {serviciosIds.includes(4) && (
            <FormObraBlanca
              actividadesCatalogo={actividadesPorServicio[4]}
              value={meson}
              onChange={setMeson}
              errors={errores[4]}
              titulo="Formulario Mesones en Mármol"
              disabled={cotizacionCerrada || guardando}
            />
          )}

          <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/cotizaciones/${idCotizacion}/vista`)}
              disabled={guardando}
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              onClick={handleGenerarYVer}
              disabled={guardando || cotizacionCerrada}
              sx={{
                backgroundColor: "#2e7d32",
                "&:hover": { backgroundColor: "#1b5e20" },
              }}
            >
              {guardando ? "Procesando..." : "GUARDAR"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FormulariosCotizacionPersonalizada;


