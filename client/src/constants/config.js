export const PDF_TEMPLATE_PATH =
  "http://localhost:5002/api/templates/file/template.pdf"

export const PDF_COORDINATES = {
  date: {
    x: 430, // Adjust this value for date position from left
    y: 590 // Adjust this value for date position from bottom
  },
  data: {
    x: 50, // Adjust this value for text position from left
    y: 550 // Adjust this value for starting position from bottom
  }
}

// Font sizes
export const FONT_SIZES = {
  title: 18, // For category title
  content: 14, // For findings
  notes: 12, // For notes
  date: 12 // For date
}
// ui font size
export const UI_FONT_SIZE = 16

// Space between lines
export const SPACE = 25 // Adjust this value for line spacing

export const TITLE_TEXT = "U/S of "

// Dummy data for demonstration
export const REPORT_DATA = {
  breast: {
    name: "Breast",
    findings: [
      "Both breasts are of normal fibre glandular appearance",
      "No solid or cystic mass",
      "No dilated ducts",
      "Normal nipple and areolar region",
      "Clear axilla"
    ]
  },
  abdomen: {
    name: "Abdomen",
    findings: [
      "Normal liver size, normal echo texture, normal biliary passage",
      "The gall bladder is of normal size and wall thickness, no stone",
      "Both kidney are of normal size, conical thickness normal location",
      "Normal central sinus echoes",
      "Normal bladder"
    ]
  },
  pelvis: {
    name: "Pelvis",
    findings: [
      "Normal uterus size and position",
      "Normal endometrial thickness",
      "Normal ovaries bilaterally",
      "No free fluid in the pouch of Douglas"
    ]
  },
  fetus: {
    name: "Fetus",
    findings: [
      "Single live fetus",
      "Normal fetal cardiac activity",
      "Normal fetal movements",
      "Normal amniotic fluid volume",
      "Placenta normal in position and appearance"
    ]
  }
}
