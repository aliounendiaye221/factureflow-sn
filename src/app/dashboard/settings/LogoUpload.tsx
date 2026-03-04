'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'

type Props = {
  currentLogoUrl: string | null
  userId: string
  onUploadSuccessAction: (url: string) => void
}

const MAX_SIZE_MB = 2
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']

export default function LogoUpload({ currentLogoUrl, userId, onUploadSuccessAction }: Props) {
  const [preview, setPreview] = useState<string | null>(currentLogoUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFile = async (file: File) => {
    setError(null)

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Format non supporté. Utilisez PNG, JPEG, WEBP ou SVG.')
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Fichier trop grand. Maximum ${MAX_SIZE_MB} Mo.`)
      return
    }

    setUploading(true)

    const ext = file.name.split('.').pop()
    const path = `${userId}/logo.${ext}`

    // Upload vers Supabase Storage (remplace le fichier existant)
    const { error: uploadError } = await supabase.storage
      .from('agency-logos')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      setError('Erreur lors de l\'upload : ' + uploadError.message)
      setUploading(false)
      return
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('agency-logos')
      .getPublicUrl(path)

    // Ajouter un timestamp pour éviter le cache navigateur
    const urlWithCache = `${publicUrl}?t=${Date.now()}`
    setPreview(urlWithCache)
    onUploadSuccessAction(publicUrl)
    setUploading(false)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Logo de l'agence
        <span className="text-gray-400 font-normal ml-2">PNG, JPEG, SVG — max {MAX_SIZE_MB} Mo</span>
      </label>

      <div className="flex items-center gap-4">
        {/* Aperçu */}
        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
          {preview ? (
            <img
              src={preview}
              alt="Logo agence"
              className="w-full h-full object-contain"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-300" />
          )}
        </div>

        {/* Boutons */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? 'Envoi en cours…' : 'Changer le logo'}
          </button>

          {preview && (
            <button
              type="button"
              onClick={() => {
                setPreview(null)
                onUploadSuccessAction('')
                if (inputRef.current) inputRef.current.value = ''
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Supprimer le logo
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}

      <p className="text-xs text-gray-400">
        Le logo apparaît en haut à droite de vos factures et devis.
      </p>

      {/* Input caché */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}
