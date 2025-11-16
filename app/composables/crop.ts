export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

export interface OutputSize {
  width?: number
  height?: number
}

export const crop = (
  img: HTMLImageElement,
  crop: CropRect,
  output: OutputSize = {},
  type: 'image/png' | 'image/jpeg' = 'image/png',
  quality?: number
): void => {
  const dpr = window.devicePixelRatio || 1
  const scale = 1 / dpr

  // 1. 先把截图缩回「100%缩放」的画布
  const normalizedCanvas = document.createElement('canvas')
  normalizedCanvas.width = img.width * scale
  normalizedCanvas.height = img.height * scale

  const nctx = normalizedCanvas.getContext('2d')
  if (!nctx) throw new Error('无法获取 CanvasRenderingContext2D')

  nctx.drawImage(img, 0, 0, normalizedCanvas.width, normalizedCanvas.height)

  // 2. 裁剪：crop 是基于 100% 缩放坐标，所以直接用
  const cropCanvas = document.createElement('canvas')
  cropCanvas.width = crop.width
  cropCanvas.height = crop.height

  const cctx = cropCanvas.getContext('2d')
  if (!cctx) throw new Error('无法获取 CanvasRenderingContext2D')

  cctx.drawImage(
    normalizedCanvas,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  )

  // 3. 输出尺寸（可选缩放）
  const finalW = output.width || crop.width
  const finalH =
    output.height || (output.width ? crop.height * (output.width / crop.width) : crop.height)

  const finalCanvas = document.createElement('canvas')
  finalCanvas.width = finalW
  finalCanvas.height = finalH

  const fctx = finalCanvas.getContext('2d')
  if (!fctx) throw new Error('无法获取 CanvasRenderingContext2D')

  fctx.drawImage(cropCanvas, 0, 0, finalW, finalH)

  // 4. 导出为 PNG / JPG
  finalCanvas.toBlob(
    (blob) => {
      if (!blob) return console.error('toBlob 返回 null')

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = type === 'image/png' ? 'output.png' : 'output.jpg'
      a.click()
      URL.revokeObjectURL(url)
    },
    type,
    quality
  )
}
