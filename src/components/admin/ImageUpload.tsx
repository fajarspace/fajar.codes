import { useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { uploadImage, type StorageFolder } from '@/services/storage.service'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/utils/errors'
import { Button } from '@/components/common/Button'
import { SmartImage } from '@/components/common/SmartImage'
import { Input } from './Field'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder: StorageFolder
  label?: string
  ratio?: string
}

/** Upload-or-paste image field. Files are resized client-side before upload. */
export function ImageUpload({ value, onChange, folder, label = 'Image', ratio = '16 / 10' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file, folder)
      onChange(url)
      toast({ title: 'Image uploaded', tone: 'success' })
    } catch (error) {
      toast({ title: 'Upload failed', description: getErrorMessage(error), tone: 'error' })
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium">{label}</p>
      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        <SmartImage src={value || null} alt="" ratio={ratio} />
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => inputRef.current?.click()} loading={uploading}>
              <ImagePlus className="size-3.5" /> Upload
            </Button>
            {value ? (
              <Button size="sm" variant="ghost" onClick={() => onChange('')}>
                <Trash2 className="size-3.5" /> Remove
              </Button>
            ) : null}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => void onFile(event.target.files?.[0])}
              aria-label={`Upload ${label.toLowerCase()}`}
            />
          </div>
          <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="…or paste an image URL" />
          <p className="text-xs text-fg-muted">Large images are resized to 1800px and converted to WebP before upload.</p>
        </div>
      </div>
    </div>
  )
}
