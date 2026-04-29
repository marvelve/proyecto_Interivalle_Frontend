import {
  Menu,
  MenuItemLink,
  useSidebarState,
  usePermissions,
} from "react-admin";

import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TimelineIcon from "@mui/icons-material/Timeline";
import PriceChangeIcon from "@mui/icons-material/PriceChange";

const CustomMenu = () => {
  const [open] = useSidebarState();
  const { permissions } = usePermissions();

  return (
    <Menu>
      <MenuItemLink
        to="/"
        primaryText="Dashboard"
        leftIcon={<DashboardIcon />}
        sidebarIsOpen={open}
      />

      {permissions === "1" && (
        <MenuItemLink
          to="/admin/usuarios"
          primaryText="Usuarios"
          leftIcon={<GroupIcon />}
          sidebarIsOpen={open}
        />
      )}

      {permissions === "1" && (
        <Menu.Item
          to="/catalogo-items"
          primaryText="Actualización de precios"
          leftIcon={<PriceChangeIcon />}
        />
      )}

      {(permissions === "1" || permissions === "2"|| permissions === "3") && (
        <MenuItemLink
          to="/solicitudes"
          primaryText="Solicitudes"
          leftIcon={<DescriptionIcon />}
          sidebarIsOpen={open}
        />
      )}

      {(permissions === "1" || permissions === "2" || permissions === "3") && (
        <MenuItemLink
          to="/cotizaciones"
          primaryText="Cotizaciones"
          leftIcon={<ReceiptIcon />}
          sidebarIsOpen={open}
        />
      )}

      {(permissions === "1" || permissions === "2" || permissions === "3") && (
        <MenuItemLink
          to="/cronogramas"
          primaryText="Cronogramas"
          leftIcon={<CalendarMonthIcon />}
          sidebarIsOpen={open}
        />
      )}

      {(permissions === "1" || permissions === "2" || permissions === "3") && (
        <MenuItemLink
          to="/seguimiento"
          primaryText="Seguimiento de Obra"
          leftIcon={<TimelineIcon />}
          sidebarIsOpen={open}
        />
      )}
    </Menu>
  );
};

export default CustomMenu;