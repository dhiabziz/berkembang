'use client'

import { useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { toast } from 'sonner'

import { compressImage } from '@/lib/compress-image'
import { cn } from '@/lib/utils'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 2 * 1024 * 1024

interface ImageUploadProps {
  name: string
  label: string
  required?: boolean
}

// Client Component — validates, compresses (BR-08), then swaps the <input> file so the
// compressed image travels through normal <form action={serverAction}> submission.
export function ImageUpload({ name, label, required }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('File format must be JPEG, PNG, or WebP.')
      e.target.value = ''
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error('File size must be under 2MB.')
      e.target.value = ''
      return
    }

    setIsCompressing(true)
    try {
      const compressedBlob = await compressImage(file)
      const compressedFile = new File([compressedBlob], `${crypto.randomUUID()}.webp`, { type: 'image/webp' })

      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(compressedFile)
      if (inputRef.current) {
        inputRef.current.files = dataTransfer.files
      }

      setPreview(URL.createObjectURL(compressedFile))
    } catch {
      toast.error('Failed to process image. Try again.')
      e.target.value = ''
    } finally {
      setIsCompressing(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <label
        className={cn(
          'flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border border-dashed border-input bg-muted/50 text-sm text-muted-foreground hover:bg-muted',
          preview && 'border-solid p-0'
        )}
      >
        {preview ? (
          // Plain <img>: this is a local object URL preview, not a next/image remote source.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Cover preview" className="h-32 w-full object-cover" />
        ) : (
          <>
            <ImagePlus size={24} />
            {isCompressing ? 'Processing…' : 'Tap to upload'}
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/jpeg,image/png,image/webp"
          required={required}
          className="hidden"
          onChange={handleChange}
        />
      </label>
    </div>
  )
}
