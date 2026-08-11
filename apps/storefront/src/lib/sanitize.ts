/**
 * Minimal SVG sanitizer for user-uploaded logos (security hardening, docs/kit/03
 * §3.7). Removes scripts, event handlers, and external/embedded resource
 * references that could execute or exfiltrate. This is a defense-in-depth measure
 * on the client; SVGs are also never rendered as active documents (used as
 * <img>/canvas sources only).
 */
export function sanitizeSvg(svg: string): string {
  let out = svg
  // Remove <script>…</script> blocks.
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "")
  // Remove <foreignObject> (can embed arbitrary HTML).
  out = out.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "")
  // Strip inline event handlers (onload, onclick, …).
  out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
  // Neutralize javascript: URIs and external http(s) references in href/xlink:href.
  out = out.replace(/(xlink:href|href)\s*=\s*("|')\s*javascript:[^"']*(\2)/gi, '$1=$2#$2')
  out = out.replace(/(xlink:href|href)\s*=\s*("|')\s*https?:[^"']*(\2)/gi, '$1=$2#$2')
  return out
}

/** True for the file types we accept as logos. */
export const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml"]

export function isAllowedLogo(file: File): boolean {
  return ALLOWED_LOGO_TYPES.includes(file.type)
}
