// Axxess Reseller/Business Partner API client.
//
// Auth model (from the Business Partner API docs):
//  - Every request uses HTTP Basic auth (reseller-wide ResellerAdmin creds).
//  - getSession(controlPanelUser, controlPanelPass) returns a strSessionId
//    (GUID) valid for 1 hour; every other call passes strSessionId.
//  - Endpoints: {BASE}/calls/rsapi/{method}.json  (test vs live via env).
//
// All credentials come from environment variables (see .env.example) and are
// never committed. Test base: https://apitest.axxess.co.za  Live: https://rcp.axxess.co.za

const BASE = process.env.AXXESS_API_BASE ?? "https://apitest.axxess.co.za";
const BASIC_USER = process.env.AXXESS_BASIC_USER ?? "";
const BASIC_PASS = process.env.AXXESS_BASIC_PASS ?? "";
const CP_USER = process.env.AXXESS_CP_USER ?? "";
const CP_PASS = process.env.AXXESS_CP_PASS ?? "";

export interface AxxessResponse {
  intCode: number;
  strStatus?: string;
  strMessage?: string | null;
  [key: string]: unknown;
}

function basicAuthHeader(): string {
  return "Basic " + Buffer.from(`${BASIC_USER}:${BASIC_PASS}`).toString("base64");
}

/** Low-level GET call to a reseller API method. Params become the query string. */
export async function callApi(
  method: string,
  params: Record<string, string | number> = {}
): Promise<AxxessResponse> {
  if (!BASIC_USER || !BASIC_PASS) {
    throw new Error("AXXESS_BASIC_USER / AXXESS_BASIC_PASS not configured");
  }
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  ).toString();
  const url = `${BASE}/calls/rsapi/${method}.json${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: basicAuthHeader(), Accept: "application/json" },
  });
  const text = await res.text();
  let data: AxxessResponse;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Axxess ${method}: non-JSON response (HTTP ${res.status})`);
  }
  return data;
}

// --- Session management -----------------------------------------------------
// Session is cached in module memory. On serverless this persists only within a
// warm instance, which is fine — a cold start just fetches a fresh session.

let cachedSession: { id: string; expires: number } | null = null;
const SESSION_TTL_MS = 55 * 60 * 1000; // refresh a little before the 1h expiry

export async function getSessionId(force = false): Promise<string> {
  if (!force && cachedSession && Date.now() < cachedSession.expires) {
    return cachedSession.id;
  }
  if (!CP_USER || !CP_PASS) {
    throw new Error("AXXESS_CP_USER / AXXESS_CP_PASS not configured");
  }
  const data = await callApi("getSession", {
    strUserName: CP_USER,
    strPassword: CP_PASS,
  });
  const id = data.strSessionId as string | undefined;
  if (data.intCode !== 200 || !id) {
    throw new Error(
      `getSession failed: ${data.intCode} ${data.strStatus ?? ""} ${data.strMessage ?? ""}`.trim()
    );
  }
  cachedSession = { id, expires: Date.now() + SESSION_TTL_MS };
  return id;
}

/** Call an authenticated method, injecting a valid session id. Retries once on session expiry. */
export async function callWithSession(
  method: string,
  params: Record<string, string | number> = {}
): Promise<AxxessResponse> {
  const sessionId = await getSessionId();
  let data = await callApi(method, { strSessionId: sessionId, ...params });
  // 401/440-style expiry — refresh session once and retry.
  if (data.intCode === 401 || data.intCode === 440 || data.intCode === 403) {
    const fresh = await getSessionId(true);
    data = await callApi(method, { strSessionId: fresh, ...params });
  }
  return data;
}
