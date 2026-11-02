import { apiUrl, getJson, postJson, JSON_HEADERS } from "../../../services/api.js";

export function getHotels(city, date) {
  const query = new URLSearchParams({ city, date });
  return getJson(`/api/hotels?${query}`);
}

export function calculatePackage(payload) {
  return postJson("/api/calculate", payload);
}

export function createLead(payload) {
  return postJson("/api/leads", payload);
}

export function createEnquiry(payload) {
  return postJson("/api/enquiries", payload);
}

export async function createEstimatePdf(payload) {
  const response = await fetch(apiUrl("/api/estimate-pdf"), {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Could not create the PDF.");
  }
  return response.blob();
}
