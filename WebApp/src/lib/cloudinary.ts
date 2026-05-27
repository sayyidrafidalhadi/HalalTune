const CLOUD_NAME = "dcidrwk1e"
const UPLOAD_PRESET = "halaltune_unsigned"
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}`

export function getCloudinaryUrl(publicId: string, options?: {
  quality?: number
  format?: string
  width?: number
  height?: number
}): string {
  const { quality = "auto", format = "auto", width, height } = options || {}
  const transformations = [`q_${quality}`, `f_${format}`]
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  return `${BASE_URL}/image/upload/${transformations.join(",")}/v1/${publicId}`
}

export function getAudioStreamUrl(publicId: string): string {
  return `${BASE_URL}/video/upload/q_auto/f_auto/v1/${publicId}`
}

export function getOptimizedAudioUrl(publicId: string, bitrate?: string): string {
  const params = bitrate ? `q_auto/f_auto/br_${bitrate}` : "q_auto/f_auto"
  return `${BASE_URL}/video/upload/${params}/v1/${publicId}`
}

export async function uploadFile(file: File, resourceType: "image" | "video" = "image"): Promise<string | null> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", UPLOAD_PRESET)
  formData.append("resource_type", resourceType)

  try {
    const res = await fetch(`${BASE_URL}/image/upload`, { method: "POST", body: formData })
    if (!res.ok) return null
    const data = await res.json()
    return data.public_id || null
  } catch {
    return null
  }
}
