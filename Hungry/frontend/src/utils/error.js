export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  const data = error?.response?.data
  if (typeof data === "string" && data.trim()) return data
  if (data?.message) return data.message
  if (error?.message) return error.message
  return fallback
}
