const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export const JSON_HEADERS = { "Content-Type": "application/json" };

export function apiUrl(path) {
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function getJson(path) {
  const response = await fetch(apiUrl(path));
  return { response, data: await response.json() };
}

export async function postJson(path, body) {
  const response = await fetch(apiUrl(path), {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  return { response, data: await response.json() };
}
