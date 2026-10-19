import "server-only";

/** IP pengunjung. Di belakang proxy Hostinger header ini diisi oleh proxy; kita juga pakai batas global sebagai pelapis. */
export function clientIp(h: Headers) {
  const raw = h.get("cf-connecting-ip") || h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0] || "unknown";
  return raw.trim().slice(0, 64);
}
