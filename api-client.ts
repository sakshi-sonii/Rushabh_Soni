// Client-side API helper functions
export async function apiCall<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: T,
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  const response = await fetch(endpoint, options)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "API call failed")
  }

  return response.json()
}
