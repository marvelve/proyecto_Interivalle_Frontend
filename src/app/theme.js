import { defaultTheme } from "react-admin";

export const brandGreen = "#2e7d32";
export const brandGreenDark = "#1b5e20";

const appTheme = {
  ...defaultTheme,
  palette: {
    ...defaultTheme.palette,
    primary: {
      ...defaultTheme.palette?.primary,
      main: brandGreen,
      dark: brandGreenDark,
      contrastText: "#ffffff",
    },
    success: {
      ...defaultTheme.palette?.success,
      main: brandGreen,
      dark: brandGreenDark,
      contrastText: "#ffffff",
    },
  },
  components: {
    ...defaultTheme.components,
    MuiAppBar: {
      ...defaultTheme.components?.MuiAppBar,
      styleOverrides: {
        ...defaultTheme.components?.MuiAppBar?.styleOverrides,
        root: {
          backgroundColor: brandGreen,
          color: "#ffffff",
        },
      },
    },
    MuiButton: {
      ...defaultTheme.components?.MuiButton,
      styleOverrides: {
        ...defaultTheme.components?.MuiButton?.styleOverrides,
        containedPrimary: {
          backgroundColor: brandGreen,
          color: "#ffffff",
          "&:hover": {
            backgroundColor: brandGreenDark,
          },
        },
        containedSuccess: {
          backgroundColor: brandGreen,
          color: "#ffffff",
          "&:hover": {
            backgroundColor: brandGreenDark,
          },
        },
        outlinedPrimary: {
          borderColor: brandGreen,
          color: brandGreen,
          "&:hover": {
            borderColor: brandGreenDark,
            backgroundColor: "rgba(46, 125, 50, 0.08)",
          },
        },
        textPrimary: {
          color: brandGreen,
          "&:hover": {
            backgroundColor: "rgba(46, 125, 50, 0.08)",
          },
        },
      },
    },
    MuiLinearProgress: {
      ...defaultTheme.components?.MuiLinearProgress,
      styleOverrides: {
        ...defaultTheme.components?.MuiLinearProgress?.styleOverrides,
        barColorPrimary: {
          backgroundColor: brandGreen,
        },
        colorPrimary: {
          backgroundColor: "rgba(46, 125, 50, 0.2)",
        },
      },
    },
  },
};

export default appTheme;
