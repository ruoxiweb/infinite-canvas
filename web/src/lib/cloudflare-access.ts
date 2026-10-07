/**
 * Best-effort read of the signed-in Cloudflare Access user's email.
 *
 * Access stamps the application domain with a CF_Authorization cookie whose JWT payload carries
 * the email claim. Decoding it here is for local customization only (seeding the built-in team
 * channel); the real gate is Cloudflare's edge, which validates the token signature before a
 * request ever reaches this static site.
 */
export function cloudflareAccessEmail(): string {
    if (typeof document === "undefined") return "";
    const cookie = document.cookie.split(/;\s*/).find((entry) => entry.startsWith("CF_AUTHORIZATION=") || entry.startsWith("CF_Authorization="));
    if (!cookie) return "";
    const payload = decodeJwtPayload(cookie.slice(cookie.indexOf("=") + 1));
    return typeof payload?.email === "string" ? payload.email : "";
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
    const segment = token.split(".")[1];
    if (!segment) return null;
    try {
        const base64 = segment.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (segment.length % 4)) % 4);
        const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
        return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
        return null;
    }
}
