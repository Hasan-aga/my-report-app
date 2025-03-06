import axios from "axios"

const API_URL = "http://127.0.0.1:8090/api/collections"

export const fetchPDFCoordinates = async () => {
  const response = await axios.get(`${API_URL}/config_data/records`)
  return response.data.items[0].pdf_coordinates
}

export const fetchReportData = async () => {
  const response = await axios.get(`${API_URL}/config_data/records`)
  return response.data.items[0].report_data
}

export const fetchTemplates = async () => {
  const response = await axios.get(`${API_URL}/pdf_templates/records`)
  return response.data.items
}

export const uploadTemplate = async (formData) => {
  const response = await axios.post(
    `${API_URL}/pdf_templates/records`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  )
  return response.data
}
