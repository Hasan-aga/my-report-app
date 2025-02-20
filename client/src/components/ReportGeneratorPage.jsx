import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Typography,
  useTheme
} from "@mui/material"
import Grid from "@mui/material/Grid2"
import React, { useState } from "react"
import { PDF_TEMPLATE_PATH, REPORT_DATA } from "../constants/config"
import DataSelectionPage from "./DataSelectionPage"

const ReportGeneratorPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("")
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2} sx={{ width: "100%" }}>
          {/* Categories Panel */}
          <Grid size={2}>
            <Paper elevation={2} sx={{ p: 3, height: "90vh" }}>
              <FormControl component="fieldset">
                <FormLabel
                  component="legend"
                  sx={{
                    fontSize: "1.2rem",
                    mb: 2,
                    color: theme.palette.primary.contrastText
                  }}
                >
                  Report Categories
                </FormLabel>
                <RadioGroup
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {Object.entries(REPORT_DATA).map(([key, category]) => (
                    <FormControlLabel
                      key={key}
                      value={key}
                      control={
                        <Radio
                          sx={{
                            color: theme.palette.secondary.main,
                            "&.Mui-checked": {
                              color: theme.palette.secondary.main
                            }
                          }}
                        />
                      }
                      label={
                        <Typography variant="subtitle1">
                          {category.name}
                        </Typography>
                      }
                      sx={{
                        mb: 2,
                        "&:hover": {
                          backgroundColor: "action.hover",
                          borderRadius: 1
                        }
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Paper>
          </Grid>
          {/* Findings Panel */}
          <Grid size={10}>
            <DataSelectionPage
              category={selectedCategory}
              templatePath={PDF_TEMPLATE_PATH}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default ReportGeneratorPage
