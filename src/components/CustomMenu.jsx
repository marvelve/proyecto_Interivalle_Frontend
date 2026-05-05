import { Box, Button } from "@mui/material";
import { usePermissions } from "react-admin";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TimelineIcon from "@mui/icons-material/Timeline";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  {
    label: "Inicio",
    path: "/",
    icon: <DashboardIcon fontSize="small" />,
    roles: ["1", "2", "3"],
  },
  {
    label: "Usuarios",
    path: "/admin/usuarios",
    icon: <GroupIcon fontSize="small" />,
    roles: ["1"],
  },
  {
    label: "Precios",
    path: "/catalogo-items",
    icon: <PriceChangeIcon fontSize="small" />,
    roles: ["1"],
  },
  {
    label: "Solicitudes",
    path: "/solicitudes",
    icon: <DescriptionIcon fontSize="small" />,
    roles: ["1", "2", "3"],
  },
  {
    label: "Cotizaciones",
    path: "/cotizaciones",
    icon: <ReceiptIcon fontSize="small" />,
    roles: ["1", "2", "3"],
  },
  {
    label: "Cronogramas",
    path: "/cronogramas",
    icon: <CalendarMonthIcon fontSize="small" />,
    roles: ["1", "2", "3"],
  },
  {
    label: "Seguimiento",
    path: "/seguimiento",
    icon: <TimelineIcon fontSize="small" />,
    roles: ["1", "2", "3"],
  },
];

const isActivePath = (currentPath, itemPath) => {
  if (itemPath === "/") {
    return currentPath === "/";
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
};

const CustomMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { permissions } = usePermissions();

  return (
    <Box
      component="nav"
      sx={{
        width: "100%",
        maxWidth: 1540,
        mx: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: { xs: 1, md: 1.4 },
        px: { xs: 1.5, md: 2 },
        py: { xs: 1.5, md: 1.8 },
        overflowX: "auto",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {navItems
        .filter((item) => item.roles.includes(String(permissions || "")))
        .map((item) => {
          const active = isActivePath(location.pathname, item.path);

          return (
            <Button
              key={item.path}
              type="button"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                minHeight: 40,
                px: { xs: 1.7, md: 2.3 },
                borderRadius: "999px",
                color: active ? "#ffffff" : "#1b5e20",
                bgcolor: active ? "#2e7d32" : "#ffffff",
                border: "1px solid",
                borderColor: active ? "#2e7d32" : "#b7dfba",
                boxShadow: active
                  ? "0 6px 16px rgba(46, 125, 50, 0.22)"
                  : "0 2px 8px rgba(46, 125, 50, 0.08)",
                fontWeight: 800,
                fontSize: { xs: "0.82rem", md: "0.9rem" },
                textTransform: "none",
                whiteSpace: "nowrap",
                "&:hover": {
                  bgcolor: active ? "#1b5e20" : "#eef8ef",
                  borderColor: "#2e7d32",
                },
                "& .MuiButton-startIcon": {
                  mr: 0.75,
                },
              }}
            >
              {item.label}
            </Button>
          );
        })}
    </Box>
  );
};

export default CustomMenu;
