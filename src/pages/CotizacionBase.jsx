import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Switch,
  MenuItem,
  Button,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import httpClient, { apiUrl } from "../app/httpClient";

const tiposCielo = ["ESTUCO", "DRYWALL"];
const tiposApertura = ["CORREDIZA", "BATIENTE"];
const coloresAccesorios = ["NEGROS", "PLATEADOS"];
const precioMetroMarmol = 850000;
const toEnteroNoNegativo = (valor) => {
  const numero = Number.parseInt(valor, 10);
  return Number.isNaN(numero) || numero < 0 ? 0 : numero;
};

const toNumeroNoNegativo = (valor) => {
  const numero = Number.parseFloat(valor);
  return Number.isNaN(numero) || numero < 0 ? 0 : numero;
};

const formatearMoneda = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(valor || 0));

const crearOpcionesMueblesBano = (cantidadBanos) => {
  const banos = toEnteroNoNegativo(cantidadBanos);

  return Array.from({ length: banos }, (_, index) => {
    const numeroBano = index + 1;
    const prefijo = banos === 1 ? "" : `Baño ${numeroBano}: `;

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

const crearSeleccionMueblesBano = (cantidadBanos, seleccionActual = {}) => {
  return crearOpcionesMueblesBano(cantidadBanos).reduce((seleccion, opcion) => {
    seleccion[opcion.id] = seleccionActual[opcion.id] ?? true;
    return seleccion;
  }, {});
};

const obtenerCantidadesMueblesBano = (cantidadBanos, seleccionados = {}) => {
  return crearOpcionesMueblesBano(cantidadBanos).reduce(
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
};

const CotizacionBase = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);

  const [formDataManoObra, setFormDataManoObra] = useState({
    medidaAreaPrivada: "",
    cantidadBanos: "",
    tipoCielo: "ESTUCO",
    divisionPared: false,
    
  });

  const [formDataCarpinteria, setFormDataCarpinteria] = useState({
    cantidadCloset: "",
    cantidadPuertas: "",
    muebleAltoCocina: "",
    muebleBajoCocina: "",
    muebleBarra: "",
    cantidadBanos: "",
    mueblesBanoSeleccionados: {},
  });

  const [formDataVidrio, setFormDataVidrio] = useState({
    cantidadBanos: "",
    tipoApertura: "",
    colorAccesorios: "",
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

  useEffect(() => {
    cargarSolicitud();
  }, []);

  const cargarSolicitud = async () => {
    try {
      const idSolicitud = localStorage.getItem("idSolicitud");

      if (!idSolicitud) {
        alert("No se encontró idSolicitud.");
        navigate("/solicitudes");
        return;
      }

      const { json } = await httpClient(`${apiUrl}/api/solicitudes/${idSolicitud}`);
      const data = json;

      console.log("Solicitud cargada:", data);

      const servicios =
        data?.solicitudServicios ||
        data?.servicios ||
        data?.serviciosSeleccionados ||
        data?.detalleServicios ||
        [];

      console.log("Servicios detectados:", servicios);

      setServiciosSeleccionados(servicios);
    } catch (error) {
      console.error("Error al cargar solicitud:", error);
      alert("No se pudo cargar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const obtenerIdServicio = (s) => {
    return (
      s?.idServicio ||
      s?.id_servicio ||
      s?.idServicios ||
      s?.id_servicios ||
      s?.servicios?.idServicio ||
      s?.servicios?.id_servicios ||
      s?.servicios?.idServicios ||
      s?.servicio?.idServicio ||
      s?.servicio?.id_servicios ||
      s?.servicio?.idServicios ||
      null
    );
  };

  const idsServicios = serviciosSeleccionados
    .map(obtenerIdServicio)
    .filter(Boolean);

  const seccionManoObraVisible = idsServicios.includes(1);
  const seccionCarpinteriaVisible = idsServicios.includes(2);
  const seccionVidrioVisible = idsServicios.includes(3);
  const seccionMezonVisible = idsServicios.includes(4);

  const handleChangeManoObra = (e) => {
    const { name, value } = e.target;
    setFormDataManoObra((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchManoObra = (e) => {
    const { name, checked } = e.target;
    setFormDataManoObra((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleChangeCarpinteria = (e) => {
    const { name, value } = e.target;
    setFormDataCarpinteria((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "cantidadBanos"
        ? {
            mueblesBanoSeleccionados: crearSeleccionMueblesBano(
              value,
              prev.mueblesBanoSeleccionados
            ),
          }
        : {}),
    }));
  };

  const handleCheckMuebleBano = (e) => {
    const { name, checked } = e.target;
    setFormDataCarpinteria((prev) => ({
      ...prev,
      mueblesBanoSeleccionados: {
        ...prev.mueblesBanoSeleccionados,
        [name]: checked,
      },
    }));
  };

  const handleChangeVidrio = (e) => {
    const { name, value } = e.target;
    setFormDataVidrio((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchVidrio = (e) => {
    const { name, checked } = e.target;
    setFormDataVidrio((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSwitchMezon = (e) => {
    const { name, checked } = e.target;
    setFormDataMezon((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleChangeMezon = (e) => {
    const { name, value } = e.target;
    setFormDataMezon((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validarFormulario = () => {
    if (seccionManoObraVisible) {
      if (!formDataManoObra.medidaAreaPrivada) {
        alert("Debe ingresar la medida del área privada.");
        return false;
      }
      if (!formDataManoObra.cantidadBanos) {
        alert("Debe ingresar la cantidad de baños.");
        return false;
      }
      if (!formDataManoObra.tipoCielo) {
        alert("Debe seleccionar el tipo de cielo.");
        return false;
      }
    }

    if (seccionCarpinteriaVisible) {
      const cantidadBanosCarpinteria = toEnteroNoNegativo(
        formDataCarpinteria.cantidadBanos
      );

      if (cantidadBanosCarpinteria > 0) {
        const cantidadesMueblesBano = obtenerCantidadesMueblesBano(
          cantidadBanosCarpinteria,
          formDataCarpinteria.mueblesBanoSeleccionados
        );

        if (
          cantidadesMueblesBano.cantidadMuebleAltoBano +
            cantidadesMueblesBano.cantidadMuebleBajoBano ===
          0
        ) {
          alert("Debe seleccionar al menos un mueble lavamanos.");
          return false;
        }
      }
    }

    if (seccionVidrioVisible) {
      if (!formDataVidrio.cantidadBanos) {
        alert("Debe ingresar la cantidad de baños en vidrio.");
        return false;
      }
      if (!formDataVidrio.tipoApertura) {
        alert("Debe seleccionar el tipo de apertura.");
        return false;
      }
      if (!formDataVidrio.colorAccesorios) {
        alert("Debe seleccionar el color de accesorios.");
        return false;
      }
    }

    if (seccionMezonVisible) {
      const tieneMezonSeleccionado =
        formDataMezon.mezonCocina ||
        formDataMezon.mezonBarra ||
        formDataMezon.mezonLavamanos;

      if (!tieneMezonSeleccionado) {
        alert("Debe seleccionar al menos un tipo de mesón.");
        return false;
      }

      if (
        formDataMezon.mezonCocina &&
        toNumeroNoNegativo(formDataMezon.medidaCocina) <= 0
      ) {
        alert("Debe ingresar la medida cocina.");
        return false;
      }

      if (
        formDataMezon.mezonBarra &&
        toNumeroNoNegativo(formDataMezon.medidaBarra) <= 0
      ) {
        alert("Debe ingresar la medida barra.");
        return false;
      }

      if (
        formDataMezon.mezonLavamanos &&
        toNumeroNoNegativo(formDataMezon.medidaLavamanos) <= 0
      ) {
        alert("Debe ingresar la medida mesón.");
        return false;
      }
    }

    return true;
  };

  const handleGenerarCotizacion = async () => {
    try {
      if (!validarFormulario()) return;

      const idSolicitud = localStorage.getItem("idSolicitud");
      const cantidadBanosCarpinteria = toEnteroNoNegativo(
        formDataCarpinteria.cantidadBanos
      );
      const cantidadesMueblesBano = obtenerCantidadesMueblesBano(
        cantidadBanosCarpinteria,
        formDataCarpinteria.mueblesBanoSeleccionados
      );

      const payload = {
        solicitudId: Number(idSolicitud),
        manoObra: seccionManoObraVisible
          ? {
              medidaAreaPrivada: formDataManoObra.medidaAreaPrivada
                ? Number(formDataManoObra.medidaAreaPrivada)
                : null,
              cantidadBanos: formDataManoObra.cantidadBanos
                ? Number(formDataManoObra.cantidadBanos)
                : null,
              tipoCielo: formDataManoObra.tipoCielo || null,
              divisionPared: !!formDataManoObra.divisionPared
            }
          : null,
        carpinteria: seccionCarpinteriaVisible
          ? {
              cantidadCloset: formDataCarpinteria.cantidadCloset
                ? Number(formDataCarpinteria.cantidadCloset)
                : 0,
              cantidadPuertas: formDataCarpinteria.cantidadPuertas
                ? Number(formDataCarpinteria.cantidadPuertas)
                : 0,
              muebleAltoCocina: formDataCarpinteria.muebleAltoCocina
                ? Number(formDataCarpinteria.muebleAltoCocina)
                : 0,
              muebleBajoCocina: formDataCarpinteria.muebleBajoCocina
                ? Number(formDataCarpinteria.muebleBajoCocina)
                : 0,
              muebleBarra: formDataCarpinteria.muebleBarra
                ? Number(formDataCarpinteria.muebleBarra)
                : 0,
              cantidadBanos: cantidadBanosCarpinteria,
              cantidadMuebleAltoBano:
                cantidadesMueblesBano.cantidadMuebleAltoBano,
              cantidadMuebleBajoBano:
                cantidadesMueblesBano.cantidadMuebleBajoBano,
            }
          : null,
        vidrio: seccionVidrioVisible
          ? {
              cantidadBanos: formDataVidrio.cantidadBanos
                ? Number(formDataVidrio.cantidadBanos)
                : null,
              tipoApertura: formDataVidrio.tipoApertura || null,
              colorAccesorios: formDataVidrio.colorAccesorios || null,
              tieneNicho: !!formDataVidrio.tieneNicho,
            }
          : null,
        mezon: seccionMezonVisible
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

      console.log("Payload generar cotización:", payload);

      const { json } = await httpClient(`${apiUrl}/api/cliente/cotizaciones/generar-base`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("Respuesta generar cotización:", json);

      if (!json?.idCotizacion) {
        alert("La cotización se guardó, pero no llegó el idCotizacion.");
        return;
      }

       // ACTUALIZAR ESTADO DE LA SOLICITUD
      await httpClient(`${apiUrl}/api/solicitudes/${idSolicitud}/generar`, {
        method: "PUT",
      });

      navigate(`/cotizaciones/${json.idCotizacion}/vista`);
    } catch (error) {
      console.error("Error al generar cotización:", error);
      alert(
        error?.body?.message ||
          error?.message ||
          "Ocurrió un error al generar la cotización"
      );
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Cargando información...</Typography>
      </Box>
    );
  }

  const opcionesMueblesBano = crearOpcionesMueblesBano(
    formDataCarpinteria.cantidadBanos
  );
  const mostrarOpcionesMueblesBano = opcionesMueblesBano.length > 0;
  const medidaCocinaMarmol = formDataMezon.mezonCocina
    ? toNumeroNoNegativo(formDataMezon.medidaCocina)
    : 0;
  const medidaBarraMarmol = formDataMezon.mezonBarra
    ? toNumeroNoNegativo(formDataMezon.medidaBarra)
    : 0;
  const medidaLavamanosMarmol = formDataMezon.mezonLavamanos
    ? toNumeroNoNegativo(formDataMezon.medidaLavamanos)
    : 0;
  const subtotalCocinaMarmol = medidaCocinaMarmol * precioMetroMarmol;
  const subtotalBarraMarmol = medidaBarraMarmol * precioMetroMarmol;
  const subtotalLavamanosMarmol = medidaLavamanosMarmol * precioMetroMarmol;
  const hayMezonActivo =
    formDataMezon.mezonCocina ||
    formDataMezon.mezonBarra ||
    formDataMezon.mezonLavamanos;

  return (
    <Box p={4}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Cotización Base
        </Typography>

        <Typography variant="h6" sx={{ mb: 4 }}>
          Complete la información según los servicios seleccionados en la solicitud.
        </Typography>

        {seccionManoObraVisible && (
          <>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
              Sección Mano de Obra
            </Typography>

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Medida área privada"
                  name="medidaAreaPrivada"
                  value={formDataManoObra.medidaAreaPrivada}
                  onChange={handleChangeManoObra}
                  type="number"
                  inputProps={{ min: 0 }}
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Cantidad baños"
                  name="cantidadBanos"
                  value={formDataManoObra.cantidadBanos}
                  onChange={handleChangeManoObra}
                  type="number"
                  inputProps={{ min: 0 }}
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={2}>
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

              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formDataManoObra.divisionPared}
                      onChange={handleSwitchManoObra}
                      name="divisionPared"
                    />
                  }
                  label="¿División en pared?"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />
          </>
        )}

        {seccionCarpinteriaVisible && (
          <>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
              Sección Carpintería
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
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cantidad puertas"
                  name="cantidadPuertas"
                  value={formDataCarpinteria.cantidadPuertas}
                  onChange={handleChangeCarpinteria}
                  type="number"
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Medida mueble alto cocina"
                  name="muebleAltoCocina"
                  value={formDataCarpinteria.muebleAltoCocina}
                  onChange={handleChangeCarpinteria}
                  type="number"
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Medida mueble bajo cocina"
                  name="muebleBajoCocina"
                  value={formDataCarpinteria.muebleBajoCocina}
                  onChange={handleChangeCarpinteria}
                  type="number"
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Medida mueble barra"
                  name="muebleBarra"
                  value={formDataCarpinteria.muebleBarra}
                  onChange={handleChangeCarpinteria}
                  type="number"
                  variant="standard"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cantidad baños"
                  name="cantidadBanos"
                  value={formDataCarpinteria.cantidadBanos}
                  onChange={handleChangeCarpinteria}
                  type="number"
                  inputProps={{ min: 0, step: 1 }}
                  variant="standard"
                />
              </Grid>

              {mostrarOpcionesMueblesBano && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                    Muebles lavamanos para baños
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(2, minmax(0, 1fr))",
                      },
                      columnGap: 3,
                      rowGap: 1,
                      mt: 1,
                    }}
                  >
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

        {seccionVidrioVisible && (
          <>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
              Sección Divisiones en Vidrio
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Cantidad baños"
                  name="cantidadBanos"
                  value={formDataVidrio.cantidadBanos}
                  onChange={handleChangeVidrio}
                  type="number"
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
                  label="¿Tiene nicho?"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />
          </>
        )}

        {seccionMezonVisible && (
          <>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
              Sección Mesones en Mármol
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
                  label="Mesón cocina"
                />
              </Grid>

              {formDataMezon.mezonCocina && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Medida cocina"
                      name="medidaCocina"
                      value={formDataMezon.medidaCocina}
                      onChange={handleChangeMezon}
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      variant="standard"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Subtotal Mesón cocina"
                      value={formatearMoneda(subtotalCocinaMarmol)}
                      variant="standard"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formDataMezon.mezonBarra}
                      onChange={handleSwitchMezon}
                      name="mezonBarra"
                    />
                  }
                  label="Mesón barra"
                />
              </Grid>

              {formDataMezon.mezonBarra && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Medida Barra"
                      name="medidaBarra"
                      value={formDataMezon.medidaBarra}
                      onChange={handleChangeMezon}
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      variant="standard"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Subtotal Mesón barra"
                      value={formatearMoneda(subtotalBarraMarmol)}
                      variant="standard"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formDataMezon.mezonLavamanos}
                      onChange={handleSwitchMezon}
                      name="mezonLavamanos"
                    />
                  }
                  label="Mesón lavamanos"
                />
              </Grid>

              {formDataMezon.mezonLavamanos && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Medida Mesón"
                      name="medidaLavamanos"
                      value={formDataMezon.medidaLavamanos}
                      onChange={handleChangeMezon}
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      variant="standard"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Subtotal Mesón lavamanos"
                      value={formatearMoneda(subtotalLavamanosMarmol)}
                      variant="standard"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </>
              )}

              {hayMezonActivo && (
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Precio Mt Mármol"
                    value={formatearMoneda(precioMetroMarmol)}
                    variant="standard"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 4 }} />
          </>
        )}

        <Box
          mt={4}
          display="flex"
          justifyContent="flex-end"
          gap={2}
          flexWrap="wrap"
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate("/solicitudes")}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={handleGenerarCotizacion}
          >
            GENERAR COTIZACIÓN
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CotizacionBase;
