const ONE_MINUTE_MS = 60 * 1000
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS
const ONE_DAY_MS = 24 * ONE_HOUR_MS
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS

const pad2 = (n) => String(n).padStart(2, "0")

const formatAbsolute = (date) =>
  `${pad2(date.getDate())}-${pad2(date.getMonth() + 1)}-${date.getFullYear()}`

export const formatDate = (input, now = Date.now()) => {
  if (!input || input === "unknown") return input || "unknown"

  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return input

  const diff = now - date.getTime()
  if (diff < ONE_MINUTE_MS) return "just now"
  if (diff < ONE_HOUR_MS) {
    const minutes = Math.floor(diff / ONE_MINUTE_MS)
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`
  }
  if (diff < ONE_DAY_MS) {
    const hours = Math.floor(diff / ONE_HOUR_MS)
    return `${hours} hour${hours === 1 ? "" : "s"} ago`
  }
  if (diff < SEVEN_DAYS_MS) {
    const days = Math.floor(diff / ONE_DAY_MS)
    return `${days} day${days === 1 ? "" : "s"} ago`
  }

  return formatAbsolute(date)
}
