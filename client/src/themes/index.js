// client/src/themes/index.js
export const lightTheme = (fontSize) => ({
  palette: {
    mode: "light",
    primary: {
      main: "#268bd2",
      light: "#2aa198",
      contrastText: "#073642"
    },
    secondary: {
      light: "#859900",
      main: "#d33682"
    },
    background: {
      default: "#eee8d5",
      paper: "#fdf6e3"
    },
    text: {
      primary: "#073642",
      secondary: "#586e75"
    }
  },
  typography: {
    fontSize: fontSize // Use the fontSize from settings
  }
})

export const darkTheme = (fontSize) => ({
  palette: {
    mode: "dark",
    primary: {
      main: "#BD93F9",
      light: "#FF79C6",
      contrastText: "#282A36"
    },
    secondary: {
      light: "#50FA7B",
      main: "#FF79C6",
      contrastText: "#282A36"
    },
    background: {
      default: "#282A36",
      paper: "#44475A"
    },
    text: {
      primary: "#F8F8F2",
      secondary: "#F1f1f1"
    }
  },
  typography: {
    fontSize: fontSize // Use the fontSize from settings
  }
})
