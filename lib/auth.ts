import { env } from "cloudflare:workers";
const encoder = new TextEncoder();
async function key() {
  if (!env.SESSION_SECRET) throw new Error("Session configuration missing");
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(env.SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}
const hex = (bytes: ArrayBuffer) =>
  Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
export async function sessionValue() {
  const expiry = String(Date.now() + 30 * 86400000);
  return `${expiry}.${hex(await crypto.subtle.sign("HMAC", await key(), encoder.encode(expiry)))}`;
}
export async function authorized(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("study_session="))
    ?.slice(14);
  if (!token) return false;
  const [expiry, signature] = token.split(".");
  if (
    !/^\d{13}$/.test(expiry) ||
    !signature ||
    !/^[a-f0-9]{64}$/.test(signature) ||
    Number(expiry) < Date.now() ||
    Number(expiry) > Date.now() + 31 * 86400000
  )
    return false;
  const bytes = Uint8Array.from(signature.match(/.{2}/g)!, (h) =>
    parseInt(h, 16),
  );
  return crypto.subtle.verify(
    "HMAC",
    await key(),
    bytes,
    encoder.encode(expiry),
  );
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !!origin && origin === new URL(request.url).origin;
}
export function reply(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}
export const sessionCookie = (
  value: string,
  request: Request,
  age = 30 * 86400,
) =>
  `study_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
