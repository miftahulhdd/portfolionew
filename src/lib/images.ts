// Aman dipakai di server & client.
export const MAX_UPLOAD_MB = 15;
export const UPLOAD_NOTE = `Maks. ${MAX_UPLOAD_MB} MB per foto · JPG, PNG, atau WebP · otomatis dioptimalkan (kualitas tinggi, hingga 2560 px)`;
export const IMG_WIDTHS = [480, 960, 1600] as const;

/** File baru berakhiran _r.webp dan punya varian ukuran kecil. */
export const isResponsive = (url: string) => /_r\.webp$/.test(url);
export const variantUrl = (url: string, w: number) => url.replace(/_r\.webp$/, `_r-w${w}.webp`);

export function srcSetFor(url: string) {
  if (!isResponsive(url)) return undefined;
  return [...IMG_WIDTHS.map((w) => `${variantUrl(url, w)} ${w}w`), `${url} 2560w`].join(", ");
}
