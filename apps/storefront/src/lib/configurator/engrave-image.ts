import {
  ENGRAVE_WORKING_EDGE,
  MAX_UPLOAD_PIXELS,
  engravePixels,
  fitWithin,
  type EngraveParams,
} from "./engrave"

/** Longest edge of the original kept on the device for re-engraving. */
const ORIGINAL_EDGE = 1280

export class PhotoError extends Error {}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new PhotoError("We couldn't read that image. Try a JPG or PNG."))
    img.src = src
  })
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new PhotoError("We couldn't read that file."))
    reader.readAsDataURL(file)
  })
}

/**
 * Decodes a raster upload and keeps a resized copy (JPEG, or PNG when it has
 * transparency) as the source for every re-engrave.
 */
export async function prepareOriginal(file: File): Promise<string> {
  if (/\.(heic|heif)$/i.test(file.name) || /hei[cf]/i.test(file.type)) {
    throw new PhotoError("HEIC photos aren't supported yet — export it as JPG and upload again.")
  }
  const img = await loadImage(await readAsDataUrl(file))
  if (img.naturalWidth * img.naturalHeight > MAX_UPLOAD_PIXELS) {
    throw new PhotoError("That photo is over 12 megapixels. Please upload a smaller version.")
  }
  const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, ORIGINAL_EDGE)
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new PhotoError("Your browser can't process images here.")
  ctx.drawImage(img, 0, 0, width, height)
  const keepAlpha = file.type === "image/png"
  return canvas.toDataURL(keepAlpha ? "image/png" : "image/jpeg", 0.88)
}

/**
 * Renders the stored original at the working size, engraved or as-is. Both
 * variants share dimensions so swapping them keeps the layer's size on canvas.
 */
export async function renderEngraved(original: string, params: EngraveParams): Promise<string> {
  const img = await loadImage(original)
  const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, ENGRAVE_WORKING_EDGE)
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) throw new PhotoError("Your browser can't process images here.")
  ctx.drawImage(img, 0, 0, width, height)
  if (params.enabled) {
    const source = ctx.getImageData(0, 0, width, height)
    const out = engravePixels(source.data, width, height, params)
    ctx.putImageData(new ImageData(out, width, height), 0, 0)
  }
  // WebP keeps alpha at a fraction of PNG's size (browsers without it fall back to PNG).
  return canvas.toDataURL("image/webp", 0.82)
}
