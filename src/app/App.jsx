import { Admin, Resource, CustomRoutes, Layout } from "react-admin";
import { Route } from "react-router-dom";

import authProvider from "./authProvider";
import dataProvider from "./dataProvider";
import appTheme from "./theme";

import Dashboard from "../components/Dashboard";
import CustomMenu from "../components/CustomMenu";
import CustomAppBar from "../components/CustomAppBar";

import LandingInterivalle from "../pages/landing_interivalle";
import LoginPage from "../pages/LoginPage";
import Register from "../pages/Register";
import CotizacionBase from "../pages/CotizacionBase";
import CotizacionPersonalizadaDetalle from "../pages/CotizacionPersonalizadaDetalle";
import FormulariosCotizacionPersonalizada from "../pages/FormulariosCotizacionPersonalizada";

import UsuarioList from "../resources/usuarios/UsuarioList";
import UsuarioEdit from "../resources/usuarios/UsuarioEdit";
import UsuarioCreate from "../resources/usuarios/UsuarioCreate";

import SolicitudList from "../resources/solicitudes/SolicitudList";
import SolicitudCreate from "../resources/solicitudes/SolicitudCreate";
import SolicitudShow from "../resources/solicitudes/SolicitudShow";
import SolicitudReprogramar from "../resources/solicitudes/SolicitudReprogramar";

import CotizacionList from "../resources/cotizaciones/CotizacionList";
import CotizacionVista from "../resources/cotizaciones/CotizacionVista";

import CronogramaList from "../resources/cronogramas/CronogramaList";
import CronogramaCreate from "../resources/cronogramas/CronogramaCreate";
import CronogramaEdit from "../resources/cronogramas/CronogramaEdit";
import CronogramaVista from "../resources/cronogramas/CronogramaVista";

import SeguimientoObraList from "../resources/seguimientoObra/SeguimientoObraList";
import SeguimientoList from "../resources/seguimientoObra/SeguimientoList";
import AvanceShow from "../resources/seguimientoObra/AvanceShow";

import CatalogoItemList from "../resources/Catalogo/CatalogoItemList";
import CatalogoItemEdit from "../resources/Catalogo/CatalogoItemEdit";
import CatalogoItemCreate from "../resources/Catalogo/CatalogoItemCreate";

const HorizontalMenuArea = ({ children }) => (
  <div
    style={{
      width: "100%",
      background: "#f7faf7",
      borderBottom: "1px solid #d8ead9",
    }}
  >
    {children}
  </div>
);

const CustomLayout = (props) => (
  <Layout
    {...props}
    menu={CustomMenu}
    appBar={CustomAppBar}
    sidebar={HorizontalMenuArea}
    appBarAlwaysOn
    sx={{
      "& .RaLayout-appFrame": {
        marginTop: "56px",
      },
      "& .RaLayout-contentWithSidebar": {
        flexDirection: "column",
        width: "100%",
      },
      "& .RaLayout-content": {
        width: "100%",
        maxWidth: "100%",
        paddingLeft: { xs: 1.5, md: 2.5 },
        paddingRight: { xs: 1.5, md: 2.5 },
      },
    }}
  />
);

const App = () => {
  return (
    <Admin
      dashboard={Dashboard}
      authProvider={authProvider}
      dataProvider={dataProvider}
      layout={CustomLayout}
      loginPage={LoginPage}
      theme={appTheme}
    >
      <CustomRoutes noLayout>
        <Route path="/" element={<LandingInterivalle />} />
        <Route path="/register" element={<Register />} />
      </CustomRoutes>

      <CustomRoutes>
        <Route path="/cotizacion-base" element={<CotizacionBase />} />
        <Route path="/cotizacion-base/:idCotizacion/editar" element={<CotizacionBase />} />
        <Route path="/cotizaciones/:idCotizacion/vista" element={<CotizacionVista />} />
        <Route
          path="/cotizacion-personalizada/formularios/:idCotizacion"
          element={<FormulariosCotizacionPersonalizada />}
        />
        <Route
          path="/cotizaciones-personalizadas/:idCotizacion/detalle"
          element={<CotizacionPersonalizadaDetalle />}
        />
        <Route path="/cotizaciones/:idCotizacion/cronograma" element={<CronogramaCreate />} />
        <Route path="/cronogramas/cotizacion/:idCotizacion" element={<CronogramaVista />} />
        <Route path="/solicitudes/:idSolicitud/reprogramar" element={<SolicitudReprogramar />} />
        <Route path="/cronogramas/:idCronograma/seguimiento" element={<SeguimientoList />} />
        <Route path="/cronogramas/:idCronograma/seguimiento/:idAvance" element={<AvanceShow />} />
        <Route path="/solicitudes/:idSolicitud/show" element={<SolicitudShow />} />
        <Route path="/seguimiento" element={<SeguimientoObraList />} />
      </CustomRoutes>

      {(permissions) => [
        permissions === "1" ? (
          <Resource
            key="usuarios"
            name="admin/usuarios"
            options={{ label: "Usuarios" }}
            list={UsuarioList}
            edit={UsuarioEdit}
            create={UsuarioCreate}
          />
        ) : null,

        permissions === "1" || permissions === "2" || permissions === "3" ? (
          <Resource
            key="solicitudes"
            name="solicitudes"
            options={{ label: "Solicitudes" }}
            list={SolicitudList}
            create={SolicitudCreate}
            show={SolicitudShow}
          />
        ) : null,

        permissions === "1" || permissions === "2" || permissions === "3" ? (
          <Resource
            key="cotizaciones"
            name="cotizaciones"
            options={{ label: "Cotizaciones" }}
            list={CotizacionList}
            show={CotizacionVista}
          />
        ) : null,

        permissions === "1" || permissions === "2" || permissions === "3" ? (
          <Resource
            key="cronogramas"
            name="cronogramas"
            options={{ label: "Cronogramas" }}
            list={CronogramaList}
            create={permissions === "1" || permissions === "2" ? CronogramaCreate : undefined}
            edit={permissions === "1" || permissions === "2" ? CronogramaEdit : undefined}
          />
        ) : null,

        permissions === "1" || permissions === "2" || permissions === "3" ? (
          <Resource
            key="seguimiento"
            name="seguimiento"
            options={{ label: "Seguimiento de Obra" }}
            list={SeguimientoObraList}
          />
        ) : null,

        permissions === "1" ? (
          <Resource
            key="catalogo-items"
            name="catalogo-items"
            options={{ label: "Actualización de precios" }}
            list={CatalogoItemList}
            edit={CatalogoItemEdit}
            create={CatalogoItemCreate}
          />
        ): null,
      ]}
    </Admin>
  );
};

export default App;
