export const lightTheme = {
  palette: {
    mode: "light",
    primary: {
      main: "#268bd2", // Solarized blue
      light: "#2aa198", // Solarized cyan
      contrastText: "#073642" // Solarized dark background
    },
    secondary: {
      light: "#859900", // Solarized green
      main: "#d33682" // Solarized magenta
    },
    background: {
      default: "#eee8d5", // Solarized light secondary background
      paper: "#fdf6e3" // Solarized light background
    },
    text: {
      primary: "#073642", // Solarized dark background
      secondary: "#586e75" // Solarized base01
    }
  }
}

// ... existing code ...
export const darkTheme = {
  palette: {
    mode: "dark",
    primary: {
      main: "#BD93F9", // Dracula purple
      light: "#FF79C6", // Dracula pink
      contrastText: "#282A36" // Changed: Should contrast with primary.main
    },
    secondary: {
      light: "#50FA7B", // Dracula green
      main: "#FF79C6", // Dracula pink
      contrastText: "#282A36" // Added: Should contrast with secondary.main
    },
    background: {
      default: "#282A36", // Dracula background
      paper: "#44475A" // Dracula current line
    },
    text: {
      primary: "#F8F8F2", // Added: Dracula foreground
      secondary: "#F1f1f1" // Added: Dracula comment
    }
  }
}
