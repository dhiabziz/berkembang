// implements BR-08 — client-side compression before upload, target max 500KB, output WebP.
export async function compressImage(
  file: File,
  maxSizeKB: number = 500,
  maxWidth: number = 800,
  maxHeight: number = 800
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      let quality = 0.8
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'))
            if (blob.size <= maxSizeKB * 1024 || quality <= 0.3) {
              resolve(blob)
            } else {
              quality -= 0.1
              tryCompress()
            }
          },
          'image/webp',
          quality
        )
      }
      tryCompress()
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
