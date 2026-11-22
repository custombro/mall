export type DisplayIntakeReadiness = "ready" | "unavailable" | "unknown";

/** An unavailable service and an unverified response are different customer states. */
export async function readDisplayIntakeReadiness(
  signal: AbortSignal,
  request: typeof fetch = fetch,
): Promise<DisplayIntakeReadiness> {
  if (signal.aborted) return "unknown";
  try {
    const response = await request("/api/display-inquiries", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal,
    });
    if (!response.ok) return "unknown";
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("acceptingInquiries" in data)) return "unknown";
    return data.acceptingInquiries === true ? "ready" : data.acceptingInquiries === false ? "unavailable" : "unknown";
  } catch {
    return "unknown";
  }
}
