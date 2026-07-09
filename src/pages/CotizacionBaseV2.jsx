import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useNotify } from "react-admin";
import { useNavigate } from "react-router-dom";
import httpClient, { apiUrl } from "../app/httpClient";

const SERVICIOS = [
  { id: 1, nombre: "Obra Blanca" },
  { id: 2, nombre: "Carpinteria" },
  { id: 3, nombre: "Divisiones en Vidrio" },
  { id: 4, nombre: "Mesones Marmol" },
];

const tiposCielo = ["ESTUCO", "DRYWALL"];
const tiposApertura = ["CORREDIZA", "BATIENTE"];
const coloresAccesorios = ["NEGROS", "PLATEADOS"];
const DECIMAL_INPUT_PROPS = {
  inputMode: "decimal",
  pattern: "[0-9]*[.,]?[0-9]*",
  min: 0.01,
  step: 0.01,
};
const INTEGER_INPUT_PROPS = {
  min: 0,
  step: 1,
};
const ESTILOS_FORMULARIO = {
  "& .MuiInputLabel-root": {
    color: "#000",
    fontSize: "1rem",
    fontWeight: 500,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#000",
  },
  "& .MuiFormControlLabel-label": {
    color: "#000",
    fontSize: "1rem",
  },
};

const estilosTabla = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 12,
  },
  th: {
    border: "1px solid #d9d9d9",
    padding: 8,
    background: "#f3f6f3",
    fontWeight: 700,
    textAlign: "left",
  },
  td: {
    border: "1px solid #d9d9d9",
    padding: 8,
    verticalAlign: "top",
  },
};

const formatearMoneda = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(valor || 0));

const normalizarDecimal = (valor) =>
  String(valor ?? "").trim().replace(",", ".");

const limpiarNumeroPositivo = (valor, soloEnteros = false) => {
  const texto = String(valor ?? "").replace(/-/g, "");
  return soloEnteros ? texto.replace(/[^\d]/g, "") : texto.replace(/[^\d.,]/g, "");
};

const toEnteroNoNegativo = (valor) => {
  const numero = Number.parseInt(normalizarDecimal(valor), 10);
  return Number.isNaN(numero) || numero < 0 ? 0 : numero;
};

const opcionesCantidadBanosObraBlanca = ["0", "1", "2", "3", "4"];

const limitarCantidadBanosObraBlanca = (valor) =>
  Math.min(4, toEnteroNoNegativo(valor));

const limitarCantidadBanosCarpinteria = (valor) =>
  Math.min(4, toEnteroNoNegativo(valor));

const toNumeroNoNegativo = (valor) => {
  const numero = Number(normalizarDecimal(valor));
  return Number.isFinite(numero) && numero >= 0 ? numero : 0;
};

const obtenerIdServicio = (servicio) =>
  Number(
    servicio?.idServicio ||
      servicio?.id_servicio ||
      servicio?.idServicios ||
      servicio?.id_servicios ||
      servicio?.servicios?.idServicio ||
      servicio?.servicios?.idServicios ||
      servicio?.servicios?.id_servicios ||
      servicio?.servicio?.idServicio ||
      servicio?.servicio?.idServicios ||
      servicio?.servicio?.id_servicios ||
      0
  );

const obtenerNombreServicio = (idServicio) =>
  SERVICIOS.find((servicio) => servicio.id === Number(idServicio))?.nombre ||
  `Servicio ${idServicio}`;

const crearOpcionesMueblesBano = (cantidadBanos) => {
  const banos = toEnteroNoNegativo(cantidadBanos);

  return Array.from({ length: banos }, (_, index) => {
    const numeroBano = index + 1;
    const prefijo = banos === 1 ? "" : `Bano ${numeroBano}: `;

    return [
      {
        id: `bano-${numeroBano}-alto`,
        tipo: "alto",
        label: `${prefijo}Mueble alto lavamanos`,
      },
      {
        id: `bano-${numeroBano}-bajo`,
        tipo: "bajo",
        label: `${prefijo}Mueble bajo lavamanos`,
      },
    ];
  }).flat();
};

const crearSeleccionMueblesBano = (cantidadBanos, seleccionActual = {}) =>
  crearOpcionesMueblesBano(cantidadBanos).reduce((seleccion, opcion) => {
    seleccion[opcion.id] = seleccionActual[opcion.id] ?? false;
    return seleccion;
  }, {});

const obtenerCantidadesMueblesBano = (cantidadBanos, seleccionados = {}) =>
  crearOpcionesMueblesBano(cantidadBanos).reduce(
    (cantidades, opcion) => {
      if (!seleccionados[opcion.id]) {
        return cantidades;
      }

      if (opcion.tipo === "alto") {
        cantidades.cantidadMuebleAltoBano += 1;
      } else {
        cantidades.cantidadMuebleBajoBano += 1;
      }

      return cantidades;
    },
    {
      cantidadMuebleAltoBano: 0,
      cantidadMuebleBajoBano: 0,
    }
  );

const CatalogoV2Resumen = ({
  catalogo,
  cargando,
  error,
  idsServicios,
  puedeConsultarCatalogo,
}) => {
  if (!idsServicios.length) {
    return null;
  }

  if (!puedeConsultarCatalogo) {
    return (
      <Alert severity="info" sx={{ mt: 3 }}>
        El catalogo V2 solo se consulta con perfil administrador o supervisor.
      </Alert>
    );
  }

  if (cargando) {
    return (
      <Box mt={3} display="flex" alignItems="center" gap={1.5}>
        <CircularProgress size={22} />
        <Typography>Cargando catalogo V2...</Typography>
      </Box>
    );
  }

  return (
    <Box mt={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Catalogo V2 detectado
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {idsServicios.map((idServicio) => {
        const actividades = catalogo.actividadesPorServicio[idServicio] || [];
        const productos = catalogo.productosPorServicio[idServicio] || [];

        return (
          <Box key={idServicio} mb={3}>
            <Typography variant="h6" fontWeight="bold">
              {obtenerNombreServicio(idServicio)}
            </Typography>
            <Typography color="text.secondary" mb={1}>
              {actividades.length} actividades, {productos.length} productos
            </Typography>

            <Box sx={{ overflowX: "auto" }}>
              <table style={estilosTabla.table}>
                <thead>
                  <tr>
                    <th style={estilosTabla.th}>Semana</th>
                    <th style={estilosTabla.th}>Actividad / Producto</th>
                    <th style={estilosTabla.th}>Tipo</th>
                    <th style={estilosTabla.th}>Unidad</th>
                    <th style={estilosTabla.th}>Variable</th>
                    <th style={estilosTabla.th}>Precio</th>
                    <th style={estilosTabla.th}>Materiales relacionados</th>
                  </tr>
                </thead>
                <tbody>
                  {[...actividades, ...productos].length > 0 ? (
                    [...actividades, ...productos].map((item) => {
                      const esActividad = Boolean(item.idActividad);
                      const idActividad = item.idActividad;
                      const materiales =
                        catalogo.materialesPorActividad[idActividad] || [];

                      return (
                        <tr
                          key={
                            esActividad
                              ? `actividad-${item.idActividad}`
                              : `producto-${item.idProducto}`
                          }
                        >
                          <td style={estilosTabla.td}>{item.semana || "-"}</td>
                          <td style={estilosTabla.td}>
                            {item.nombreActividad ||
                              item.nombreProducto ||
                              item.descripcion ||
                              "-"}
                          </td>
                          <td style={estilosTabla.td}>
                            {esActividad ? "ACTIVIDAD" : "PRODUCTO"}
                          </td>
                          <td style={estilosTabla.td}>{item.unidad || "-"}</td>
                          <td style={estilosTabla.td}>
                            {item.variableBase || item.formulaCode || "-"}
                          </td>
                          <td style={estilosTabla.td}>
                            {formatearMoneda(item.precioUnitarioVenta)}
                          </td>
                          <td style={estilosTabla.td}>
                            {esActividad
                              ? materiales
                                  .map((material) => material.nombreMaterial)
                                  .filter(Boolean)
                                  .join(", ") || "-"
                              : "-"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td style={estilosTabla.td} colSpan={7}>
                        No hay registros activos para este servicio.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

const CotizacionBaseV2 = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const idRol = Number(localStorage.getItem("idRol"));
  const esAdminSupervisor = idRol === 1 || idRol === 2;
  const esCliente = idRol === 3;
  const puedeConsultarCatalogo = [1, 2].includes(
    idRol
  );

  const [idSolicitudInput, setIdSolicitudInput] = useState(
    localStorage.getItem("idSolicitud") || ""
  );
  const [solicitud, setSolicitud] = useState(null);
  const [serviciosSolicitud, setServiciosSolicitud] = useState([]);
  const [serviciosActivos, setServiciosActivos] = useState({});
  const [cargandoSolicitud, setCargandoSolicitud] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [catalogo, setCatalogo] = useState({
    actividadesPorServicio: {},
    productosPorServicio: {},
    materialesPorActividad: {},
  });
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
  const [errorCatalogo, setErrorCatalogo] = useState("");

  const [formDataManoObra, setFormDataManoObra] = useState({
    medidaAreaPrivada: "",
    cantidadBanos: "1",
    requiereDemolerBano: false,
    requiereSobrepisoNivelacion: false,
    tipoCielo: "ESTUCO",
    divisionPared: false,
    metrosCuadradosMuro: "",
    metrosCuadradosCielo: "",
    metrosCuadradosPanelYeso: "",
    metrosCuadradosTaparTuberias: "",
    cantidadPoyos: esCliente ? "3" : "0",
    cantidadPuntosElectricos: "",
  });

  const [formDataCarpinteria, setFormDataCarpinteria] = useState({
    cantidadCloset: "0",
    vestierBasico: false,
    cantidadPuertas: "0",
    muebleAltoCocina: "0",
    muebleBajoCocina: "0",
    muebleBarra: "0",
    cantidadBanos: "0",
    mueblesBanoSeleccionados: {},
  });

  const [formDataVidrio, setFormDataVidrio] = useState({
    cantidadBanos: "1",
    tipoApertura: "CORREDIZA",
    colorAccesorios: "NEGROS",
    tieneNicho: false,
  });

  const [formDataMezon, setFormDataMezon] = useState({
    mezonCocina: false,
    mezonBarra: false,
    mezonLavamanos: false,
    medidaCocina: "",
    medidaBarra: "",
    medidaLavamanos: "",
  });

  const idsServiciosSolicitud = useMemo(
    () =>
      serviciosSolicitud
        .map(obtenerIdServicio)
        .filter(Boolean)
        .sort((a, b) => a - b),
    [serviciosSolicitud]
  );

  const idsServiciosActivos = useMemo(
    () =>
      SERVICIOS.map((servicio) => servicio.id).filter(
        (idServicio) => serviciosActivos[idServicio]
      ),
    [serviciosActivos]
  );

  const idsServiciosActivosKey = idsServiciosActivos.join(",");

  const cargarSolicitud = useCallback(
    async (idSolicitud) => {
      const id = Number(idSolicitud);

      if (!id) {
        notify("Ingresa un ID de solicitud valido.", { type: "warning" });
        return;
      }

      setCargandoSolicitud(true);

      try {
        const { json } = await httpClient(`${apiUrl}/api/solicitudes/${id}`);
        const servicios =
          json?.solicitudServicios ||
          json?.servicios ||
          json?.serviciosSeleccionados ||
          json?.detalleServicios ||
          [];
        const activos = {};

        servicios.forEach((servicio) => {
          const idServicio = obtenerIdServicio(servicio);
          if (idServicio) {
            activos[idServicio] = true;
          }
        });

        setSolicitud(json);
        setServiciosSolicitud(servicios);
        setServiciosActivos(activos);
        setIdSolicitudInput(String(id));
        localStorage.setItem("idSolicitud", String(id));
        notify("Solicitud cargada para prueba V2.", { type: "success" });
      } catch (error) {
        console.error("Error cargando solicitud:", error);
        setSolicitud(null);
        setServiciosSolicitud([]);
        setServiciosActivos({});
        notify(
          error?.body?.message ||
            error?.message ||
            "No se pudo cargar la solicitud.",
          { type: "error" }
        );
      } finally {
        setCargandoSolicitud(false);
      }
    },
    [notify]
  );

  const cargarCatalogoV2 = useCallback(
    async (idsServicios) => {
      if (!idsServicios.length || !puedeConsultarCatalogo) {
        setCatalogo({
          actividadesPorServicio: {},
          productosPorServicio: {},
          materialesPorActividad: {},
        });
        setErrorCatalogo("");
        return;
      }

      setCargandoCatalogo(true);
      setErrorCatalogo("");

      try {
        const actividadesEntries = await Promise.all(
          idsServicios.map(async (idServicio) => {
            const { json } = await httpClient(
              `${apiUrl}/api/pruebas/catalogo-v2/actividades/${idServicio}`
            );

            return [idServicio, json?.actividades || []];
          })
        );

        const productosEntries = await Promise.all(
          idsServicios.map(async (idServicio) => {
            const { json } = await httpClient(
              `${apiUrl}/api/pruebas/catalogo-v2/productos/${idServicio}`
            );

            return [idServicio, json?.productos || []];
          })
        );

        const actividades = actividadesEntries.flatMap(([, items]) => items);
        const materialesEntries = await Promise.all(
          actividades.map(async (actividad) => {
            const { json } = await httpClient(
              `${apiUrl}/api/pruebas/catalogo-v2/materiales-actividad/${actividad.idActividad}`
            );

            return [actividad.idActividad, json?.relaciones || []];
          })
        );

        setCatalogo({
          actividadesPorServicio: Object.fromEntries(actividadesEntries),
          productosPorServicio: Object.fromEntries(productosEntries),
          materialesPorActividad: Object.fromEntries(materialesEntries),
        });
      } catch (error) {
        console.error("Error cargando catalogo V2:", error);
        setErrorCatalogo(
          error?.body?.message ||
            error?.message ||
            "No se pudo cargar todo el catalogo V2."
        );
      } finally {
        setCargandoCatalogo(false);
      }
    },
    [puedeConsultarCatalogo]
  );

  useEffect(() => {
    const idSolicitudGuardada = localStorage.getItem("idSolicitud");
    if (idSolicitudGuardada) {
      cargarSolicitud(idSolicitudGuardada);
    }
  }, [cargarSolicitud]);

  useEffect(() => {
    const ids = idsServiciosActivosKey
      ? idsServiciosActivosKey.split(",").map(Number)
      : [];

    cargarCatalogoV2(ids);
  }, [cargarCatalogoV2, idsServiciosActivosKey]);

  const servicioDisponibleEnSolicitud = (idServicio) =>
    idsServiciosSolicitud.includes(Number(idServicio));

  const handleToggleServicio = (idServicio) => (event) => {
    const checked = event.target.checked;

    setServiciosActivos((prev) => ({
      ...prev,
      [idServicio]: checked,
    }));
  };

  const handleChangeManoObra = (event) => {
    const { name, value } = event.target;
    const camposEnteros = ["cantidadBanos", "cantidadPoyos", "cantidadPuntosElectricos"];
    const camposDecimales = [
      "medidaAreaPrivada",
      "metrosCuadradosMuro",
      "metrosCuadradosCielo",
      "metrosCuadradosPanelYeso",
      "metrosCuadradosTaparTuberias",
    ];
    const nuevoValor = camposEnteros.includes(name)
      ? limpiarNumeroPositivo(value, true)
      : camposDecimales.includes(name)
        ? limpiarNumeroPositivo(value)
        : value;

    setFormDataManoObra((prev) => ({
      ...prev,
      [name]: nuevoValor,
      ...(name === "cantidadBanos" && limitarCantidadBanosObraBlanca(nuevoValor) !== 1
        ? { requiereDemolerBano: false }
        : {}),
    }));
  };

  const handleBooleanManoObra = (event) => {
    const { name, value } = event.target;
    setFormDataManoObra((prev) => ({ ...prev, [name]: value === "SI" }));
  };

  const handleBooleanCarpinteria = (event) => {
    const { name, value } = event.target;
    setFormDataCarpinteria((prev) => ({ ...prev, [name]: value === "SI" }));
  };

  const handleChangeCarpinteria = (event) => {
    const { name, value } = event.target;
    const camposEnteros = ["cantidadCloset", "cantidadPuertas", "cantidadBanos"];
    const camposDecimales = ["muebleAltoCocina", "muebleBajoCocina", "muebleBarra"];
    const valorLimpio = camposEnteros.includes(name)
      ? limpiarNumeroPositivo(value, true)
      : camposDecimales.includes(name)
        ? limpiarNumeroPositivo(value)
        : value;
    const nuevoValor =
      name === "cantidadBanos" ? String(limitarCantidadBanosCarpinteria(valorLimpio)) : valorLimpio;

    setFormDataCarpinteria((prev) => ({
      ...prev,
      [name]: nuevoValor,
      ...(name === "cantidadBanos"
        ? {
            mueblesBanoSeleccionados: crearSeleccionMueblesBano(
              nuevoValor,
              prev.mueblesBanoSeleccionados
            ),
          }
        : {}),
    }));
  };

  const handleCheckMuebleBano = (event) => {
    const { name, checked } = event.target;
    setFormDataCarpinteria((prev) => ({
      ...prev,
      mueblesBanoSeleccionados: {
        ...prev.mueblesBanoSeleccionados,
        [name]: checked,
      },
    }));
  };

  const handleChangeVidrio = (event) => {
    const { name, value } = event.target;
    const nuevoValor = name === "cantidadBanos" ? limpiarNumeroPositivo(value, true) : value;
    setFormDataVidrio((prev) => ({ ...prev, [name]: nuevoValor }));
  };

  const handleSwitchVidrio = (event) => {
    const { name, checked } = event.target;
    setFormDataVidrio((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSwitchMezon = (event) => {
    const { name, checked } = event.target;
    setFormDataMezon((prev) => ({ ...prev, [name]: checked }));
  };

  const handleChangeMezon = (event) => {
    const { name, value } = event.target;
    const camposMedida = ["medidaCocina", "medidaBarra", "medidaLavamanos"];
    setFormDataMezon((prev) => ({
      ...prev,
      [name]: camposMedida.includes(name) ? limpiarNumeroPositivo(value) : value,
    }));
  };

  const validarFormulario = () => {
    if (!solicitud) {
      notify("Primero carga una solicitud.", { type: "warning" });
      return false;
    }

    if (!idsServiciosActivos.length) {
      notify("Selecciona al menos un servicio para la prueba V2.", {
        type: "warning",
      });
      return false;
    }

    if (
      idsServiciosActivos.some(
        (idServicio) => !servicioDisponibleEnSolicitud(idServicio)
      )
    ) {
      notify("La prueba solo puede usar servicios incluidos en la solicitud.", {
        type: "warning",
      });
      return false;
    }

    if (serviciosActivos[1]) {
      if (toNumeroNoNegativo(formDataManoObra.medidaAreaPrivada) <= 0) {
        notify("Ingresa la medida del area privada.", { type: "warning" });
        return false;
      }

      if (limitarCantidadBanosObraBlanca(formDataManoObra.cantidadBanos) > 4) {
        notify("La cantidad de banos de Obra Blanca solo puede ser 0, 1, 2, 3 o 4.", {
          type: "warning",
        });
        return false;
      }
    }

    if (serviciosActivos[2]) {
      const hayItemCarpinteria =
        toEnteroNoNegativo(formDataCarpinteria.cantidadCloset) > 0 ||
        Boolean(formDataCarpinteria.vestierBasico) ||
        toEnteroNoNegativo(formDataCarpinteria.cantidadPuertas) > 0 ||
        toNumeroNoNegativo(formDataCarpinteria.muebleAltoCocina) > 0 ||
        toNumeroNoNegativo(formDataCarpinteria.muebleBajoCocina) > 0 ||
        toNumeroNoNegativo(formDataCarpinteria.muebleBarra) > 0 ||
        toEnteroNoNegativo(formDataCarpinteria.cantidadBanos) > 0;

      if (!hayItemCarpinteria) {
        notify("Ingresa al menos una cantidad o medida de carpinteria mayor a cero.", {
          type: "warning",
        });
        return false;
      }

    }

    if (serviciosActivos[3]) {
      if (toEnteroNoNegativo(formDataVidrio.cantidadBanos) <= 0) {
        notify("Ingresa al menos un bano para Vidrio.", { type: "warning" });
        return false;
      }

      if (!formDataVidrio.tipoApertura || !formDataVidrio.colorAccesorios) {
        notify("Completa tipo de apertura y color de accesorios.", {
          type: "warning",
        });
        return false;
      }
    }

    if (serviciosActivos[4]) {
      const hayMezon =
        formDataMezon.mezonCocina ||
        formDataMezon.mezonBarra ||
        formDataMezon.mezonLavamanos;

      if (!hayMezon) {
        notify("Selecciona al menos un tipo de meson.", { type: "warning" });
        return false;
      }

      if (
        formDataMezon.mezonCocina &&
        toNumeroNoNegativo(formDataMezon.medidaCocina) <= 0
      ) {
        notify("Ingresa la medida de cocina.", { type: "warning" });
        return false;
      }

      if (
        formDataMezon.mezonBarra &&
        toNumeroNoNegativo(formDataMezon.medidaBarra) <= 0
      ) {
        notify("Ingresa la medida de barra.", { type: "warning" });
        return false;
      }

      if (
        formDataMezon.mezonLavamanos &&
        toNumeroNoNegativo(formDataMezon.medidaLavamanos) <= 0
      ) {
        notify("Ingresa la medida de lavamanos.", { type: "warning" });
        return false;
      }
    }

    return true;
  };

  const construirPayload = () => {
    const cantidadBanosCarpinteria = toEnteroNoNegativo(
      formDataCarpinteria.cantidadBanos
    );
    const cantidadesMueblesBano = obtenerCantidadesMueblesBano(
      cantidadBanosCarpinteria,
      formDataCarpinteria.mueblesBanoSeleccionados
    );

    return {
      solicitudId: Number(idSolicitudInput),
      manoObra: serviciosActivos[1]
        ? {
            medidaAreaPrivada: toNumeroNoNegativo(
              formDataManoObra.medidaAreaPrivada
            ),
            cantidadBanos: limitarCantidadBanosObraBlanca(formDataManoObra.cantidadBanos),
            requiereDemolerBano:
              limitarCantidadBanosObraBlanca(formDataManoObra.cantidadBanos) === 1
                ? !!formDataManoObra.requiereDemolerBano
                : false,
            requiereSobrepisoNivelacion:
              !!formDataManoObra.requiereSobrepisoNivelacion,
            tipoCielo: formDataManoObra.tipoCielo,
            divisionPared: !!formDataManoObra.divisionPared,
            metrosCuadradosMuro: toNumeroNoNegativo(
              formDataManoObra.metrosCuadradosMuro
            ),
            metrosCuadradosCielo: toNumeroNoNegativo(
              formDataManoObra.metrosCuadradosCielo
            ),
            metrosCuadradosPanelYeso: toNumeroNoNegativo(
              formDataManoObra.metrosCuadradosPanelYeso
            ),
            metrosCuadradosTaparTuberias: toNumeroNoNegativo(
              formDataManoObra.metrosCuadradosTaparTuberias
            ),
            cantidadPoyos: esCliente
              ? 3
              : toEnteroNoNegativo(formDataManoObra.cantidadPoyos),
            cantidadPuntosElectricos: toEnteroNoNegativo(
              formDataManoObra.cantidadPuntosElectricos
            ),
          }
        : null,
      carpinteria: serviciosActivos[2]
        ? {
            cantidadCloset: toEnteroNoNegativo(
              formDataCarpinteria.cantidadCloset
            ),
            vestierBasico: !!formDataCarpinteria.vestierBasico,
            cantidadPuertas: toEnteroNoNegativo(
              formDataCarpinteria.cantidadPuertas
            ),
            muebleAltoCocina: toNumeroNoNegativo(
              formDataCarpinteria.muebleAltoCocina
            ),
            muebleBajoCocina: toNumeroNoNegativo(
              formDataCarpinteria.muebleBajoCocina
            ),
            muebleBarra: toNumeroNoNegativo(formDataCarpinteria.muebleBarra),
            cantidadBanos: cantidadBanosCarpinteria,
            cantidadMuebleAltoBano:
              cantidadesMueblesBano.cantidadMuebleAltoBano,
            cantidadMuebleBajoBano:
              cantidadesMueblesBano.cantidadMuebleBajoBano,
          }
        : null,
      vidrio: serviciosActivos[3]
        ? {
            cantidadBanos: toEnteroNoNegativo(formDataVidrio.cantidadBanos),
            tipoApertura: formDataVidrio.tipoApertura,
            colorAccesorios: formDataVidrio.colorAccesorios,
            tieneNicho: !!formDataVidrio.tieneNicho,
          }
        : null,
      mezon: serviciosActivos[4]
        ? {
            mezonCocina: !!formDataMezon.mezonCocina,
            mezonBarra: !!formDataMezon.mezonBarra,
            mezonLavamanos: !!formDataMezon.mezonLavamanos,
            medidaCocina: formDataMezon.mezonCocina
              ? toNumeroNoNegativo(formDataMezon.medidaCocina)
              : 0,
            medidaBarra: formDataMezon.mezonBarra
              ? toNumeroNoNegativo(formDataMezon.medidaBarra)
              : 0,
            medidaLavamanos: formDataMezon.mezonLavamanos
              ? toNumeroNoNegativo(formDataMezon.medidaLavamanos)
              : 0,
          }
        : null,
    };
  };

  const handleGenerarCotizacion = async () => {
    if (!validarFormulario()) return;

    setGenerando(true);

    try {
      const payload = construirPayload();
      const { json } = await httpClient(
        `${apiUrl}/api/pruebas/cotizacion-base-v2`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      notify("Cotizacion Base V2 generada.", { type: "success" });

      if (json?.idCotizacion) {
        navigate(`/cotizacion-base-v2/${json.idCotizacion}/detalles`);
      }
    } catch (error) {
      console.error("Error generando cotizacion V2:", error);
      notify(
        error?.body?.message ||
          error?.message ||
          "No se pudo generar la cotizacion V2.",
        { type: "error" }
      );
    } finally {
      setGenerando(false);
    }
  };

  const opcionesMueblesBano = crearOpcionesMueblesBano(
    formDataCarpinteria.cantidadBanos
  );

  return (
    <Box p={{ xs: 2, md: 4 }}>
      <Paper
        elevation={3}
        sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, ...ESTILOS_FORMULARIO }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Cotizacion Base V2
        </Typography>

        <Grid container spacing={2} alignItems="flex-end" mb={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="ID solicitud"
              value={idSolicitudInput}
              onChange={(event) => setIdSolicitudInput(event.target.value)}
              type="number"
              inputProps={{ min: 1 }}
              variant="standard"
            />
          </Grid>

          <Grid item xs={12} md="auto">
            <Button
              variant="outlined"
              onClick={() => cargarSolicitud(idSolicitudInput)}
              disabled={cargandoSolicitud}
            >
              {cargandoSolicitud ? "Cargando..." : "Cargar solicitud"}
            </Button>
          </Grid>

          {solicitud && (
            <Grid item xs={12}>
              <Typography color="text.secondary">
                Proyecto: {solicitud.nombreProyecto || "-"} | Tipo:{" "}
                {solicitud.tipoSolicitud || "-"}
              </Typography>
            </Grid>
          )}
        </Grid>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Servicios de la prueba
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
          {SERVICIOS.map((servicio) => (
            <FormControlLabel
              key={servicio.id}
              control={
                <Checkbox
                  checked={!!serviciosActivos[servicio.id]}
                  onChange={handleToggleServicio(servicio.id)}
                  disabled={
                    !solicitud || !servicioDisponibleEnSolicitud(servicio.id)
                  }
                />
              }
              label={servicio.nombre}
            />
          ))}
        </Box>

        <Divider sx={{ mb: 4 }} />

        {serviciosActivos[1] && (
          <>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
              Obra Blanca
            </Typography>

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Area privada"
                  name="medidaAreaPrivada"
                  value={formDataManoObra.medidaAreaPrivada}
                  onChange={handleChangeManoObra}
                  type="text"
                  placeholder="Ej: 45.50"
                  inputProps={DECIMAL_INPUT_PROPS}
                  InputLabelProps={{ shrink: true }}
                  variant="standard"
                />
              </Grid>

              {limitarCantidadBanosObraBlanca(formDataManoObra.cantidadBanos) === 1 && (
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Requiere demoler?"
                    name="requiereDemolerBano"
                    value={formDataManoObra.requiereDemolerBano ? "SI" : "NO"}
                    onChange={handleBooleanManoObra}
                    variant="standard"
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 180 }}
                  >
                    <MenuItem value="SI">SI</MenuItem>
                    <MenuItem value="NO">NO</MenuItem>
                  </TextField>
                </Grid>
              )}

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Cantidad banos"
                  name="cantidadBanos"
                  value={String(limitarCantidadBanosObraBlanca(formDataManoObra.cantidadBanos))}
                  onChange={handleChangeManoObra}
                  variant="standard"
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 160 }}
                >
                  {opcionesCantidadBanosObraBlanca.map((cantidad) => (
                    <MenuItem key={cantidad} value={cantidad}>
                      {cantidad}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Necesita sobrepiso nivelacion?"
                  name="requiereSobrepisoNivelacion"
                  value={formDataManoObra.requiereSobrepisoNivelacion ? "SI" : "NO"}
                  onChange={handleBooleanManoObra}
                  variant="standard"
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 240 }}
                >
                  <MenuItem value="SI">SI</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Tipo de cielo"
                  name="tipoCielo"
                  value={formDataManoObra.tipoCielo}
                  onChange={handleChangeManoObra}
                  variant="standard"
                >
                  {tiposCielo.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="¿Cierre espacio multiple?"
                  name="divisionPared"
                  value={formDataManoObra.divisionPared ? "SI" : "NO"}
                  onChange={handleBooleanManoObra}
                  variant="standard"
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 240 }}
                >
                  <MenuItem value="SI">Sí</MenuItem>
                  <MenuItem value="NO">No</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="M2 muro"
                  name="metrosCuadradosMuro"
                  value={formDataManoObra.metrosCuadradosMuro}
                  onChange={handleChangeManoObra}
                  type="text"
                  placeholder="Ej: 1.50"
                  inputProps={DECIMAL_INPUT_PROPS}
                  InputLabelProps={{ shrink: true }}
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="M2 cielo"
                  name="metrosCuadradosCielo"
                  value={formDataManoObra.metrosCuadradosCielo}
                  onChange={handleChangeManoObra}
                  type="text"
                  placeholder="Ej: 1.50"
                  inputProps={DECIMAL_INPUT_PROPS}
                  InputLabelProps={{ shrink: true }}
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="M2 panel yeso"
                  name="metrosCuadradosPanelYeso"
                  value={formDataManoObra.metrosCuadradosPanelYeso}
                  onChange={handleChangeManoObra}
                  type="text"
                  placeholder="Ej: 1.50"
                  inputProps={DECIMAL_INPUT_PROPS}
                  InputLabelProps={{ shrink: true }}
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="M2 tapar tuberias"
                  name="metrosCuadradosTaparTuberias"
                  value={formDataManoObra.metrosCuadradosTaparTuberias}
                  onChange={handleChangeManoObra}
                  type="text"
                  placeholder="Ej: 1.50"
                  inputProps={DECIMAL_INPUT_PROPS}
                  InputLabelProps={{ shrink: true }}
                  variant="standard"
                />
              </Grid>

              {esAdminSupervisor && (
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Cantidad de poyos"
                    name="cantidadPoyos"
                    value={formDataManoObra.cantidadPoyos}
                    onChange={handleChangeManoObra}
                    type="number"
                    inputProps={INTEGER_INPUT_PROPS}
                    variant="standard"
                  />
                </Grid>
              )}

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Puntos electricos"
                  name="cantidadPuntosElectricos"
                  value={formDataManoObra.cantidadPuntosElectricos}
                  onChange={handleChangeManoObra}
                  type="number"
                  inputProps={INTEGER_INPUT_PROPS}
                  variant="standard"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />
          </>
        )}

        {serviciosActivos[2] && (
          <>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
              Carpinteria
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cantidad closet"
                  name="cantidadCloset"
                  value={formDataCarpinteria.cantidadCloset}
                  onChange={handleChangeCarpinteria}
                  type="number"
                  inputProps={INTEGER_INPUT_PROPS}
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="¿Vestier basico?"
                  name="vestierBasico"
                  value={formDataCarpinteria.vestierBasico ? "SI" : "NO"}
                  onChange={handleBooleanCarpinteria}
                  variant="standard"
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="SI">Sí</MenuItem>
                  <MenuItem value="NO">No</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cantidad puertas"
                  name="cantidadPuertas"
                  value={formDataCarpinteria.cantidadPuertas}
                  onChange={handleChangeCarpinteria}
                  type="number"
                  inputProps={INTEGER_INPUT_PROPS}
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Mueble alto cocina MT"
                  name="muebleAltoCocina"
                  value={formDataCarpinteria.muebleAltoCocina}
                  onChange={handleChangeCarpinteria}
                  type="text"
                  placeholder="Ej: 1.50"
                  inputProps={DECIMAL_INPUT_PROPS}
                  InputLabelProps={{ shrink: true }}
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Mueble bajo cocina MT"
                  name="muebleBajoCocina"
                  value={formDataCarpinteria.muebleBajoCocina}
                  onChange={handleChangeCarpinteria}
                  type="text"
                  placeholder="Ej: 1.50"
                  inputProps={DECIMAL_INPUT_PROPS}
                  InputLabelProps={{ shrink: true }}
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Mueble barra MT"
                  name="muebleBarra"
                  value={formDataCarpinteria.muebleBarra}
                  onChange={handleChangeCarpinteria}
                  type="text"
                  placeholder="Ej: 1.50"
                  inputProps={DECIMAL_INPUT_PROPS}
                  InputLabelProps={{ shrink: true }}
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4} sx={{ minWidth: 220, flex: "0 0 220px" }}>
                <TextField
                  fullWidth
                  label="Cantidad muebles de bano"
                  name="cantidadBanos"
                  value={formDataCarpinteria.cantidadBanos}
                  onChange={handleChangeCarpinteria}
                  type="number"
                  inputProps={{ min: 0, max: 4, step: 1 }}
                  InputLabelProps={{ shrink: true }}
                  variant="standard"
                />
              </Grid>

              {opcionesMueblesBano.length > 0 && (
                <Grid item xs={12} sx={{ flexBasis: "100%", width: "100%" }}>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    {opcionesMueblesBano.map((opcion) => (
                      <FormControlLabel
                        key={opcion.id}
                        control={
                          <Checkbox
                            checked={
                              !!formDataCarpinteria.mueblesBanoSeleccionados[
                                opcion.id
                              ]
                            }
                            onChange={handleCheckMuebleBano}
                            name={opcion.id}
                          />
                        }
                        label={opcion.label}
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 4 }} />
          </>
        )}

        {serviciosActivos[3] && (
          <>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
              Divisiones en Vidrio
            </Typography>

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Cantidad banos"
                  name="cantidadBanos"
                  value={formDataVidrio.cantidadBanos}
                  onChange={handleChangeVidrio}
                  type="number"
                  inputProps={{ min: 1, step: 1 }}
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Tipo apertura"
                  name="tipoApertura"
                  value={formDataVidrio.tipoApertura}
                  onChange={handleChangeVidrio}
                  variant="standard"
                >
                  {tiposApertura.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Color accesorios"
                  name="colorAccesorios"
                  value={formDataVidrio.colorAccesorios}
                  onChange={handleChangeVidrio}
                  variant="standard"
                >
                  {coloresAccesorios.map((color) => (
                    <MenuItem key={color} value={color}>
                      {color}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formDataVidrio.tieneNicho}
                      onChange={handleSwitchVidrio}
                      name="tieneNicho"
                    />
                  }
                  label="Con nicho"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />
          </>
        )}

        {serviciosActivos[4] && (
          <>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
              Mesones Marmol
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formDataMezon.mezonCocina}
                      onChange={handleSwitchMezon}
                      name="mezonCocina"
                    />
                  }
                  label="Meson cocina"
                />
                <TextField
                  fullWidth
                  label="Medida cocina (MT)"
                  name="medidaCocina"
                  value={formDataMezon.medidaCocina}
                  onChange={handleChangeMezon}
                  type="text"
                  placeholder="Ej: 1.50"
                  inputProps={DECIMAL_INPUT_PROPS}
                  InputLabelProps={{ shrink: true }}
                  variant="standard"
                  disabled={!formDataMezon.mezonCocina}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formDataMezon.mezonBarra}
                      onChange={handleSwitchMezon}
                      name="mezonBarra"
                    />
                  }
                  label="Meson barra"
                />
                <TextField
                  fullWidth
                  label="Medida barra (MT)"
                  name="medidaBarra"
                  value={formDataMezon.medidaBarra}
                  onChange={handleChangeMezon}
                  type="text"
                  placeholder="Ej: 1.50"
                  inputProps={DECIMAL_INPUT_PROPS}
                  InputLabelProps={{ shrink: true }}
                  variant="standard"
                  disabled={!formDataMezon.mezonBarra}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formDataMezon.mezonLavamanos}
                      onChange={handleSwitchMezon}
                      name="mezonLavamanos"
                    />
                  }
                  label="Meson lavamanos"
                />
                <TextField
                  fullWidth
                  label="Medida lavamanos (MT)"
                  name="medidaLavamanos"
                  value={formDataMezon.medidaLavamanos}
                  onChange={handleChangeMezon}
                  type="text"
                  placeholder="Ej: 1.50"
                  inputProps={DECIMAL_INPUT_PROPS}
                  InputLabelProps={{ shrink: true }}
                  variant="standard"
                  disabled={!formDataMezon.mezonLavamanos}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />
          </>
        )}

        <CatalogoV2Resumen
          catalogo={catalogo}
          cargando={cargandoCatalogo}
          error={errorCatalogo}
          idsServicios={idsServiciosActivos}
          puedeConsultarCatalogo={puedeConsultarCatalogo}
        />

        <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={() => navigate("/cotizaciones")}>
            Volver
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleGenerarCotizacion}
            disabled={generando || cargandoSolicitud}
          >
            {generando ? "Generando..." : "Generar V2"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CotizacionBaseV2;
