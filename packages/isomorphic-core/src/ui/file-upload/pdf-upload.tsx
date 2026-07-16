'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { PiFilePdf, PiTrash, PiEye } from 'react-icons/pi';
import { Text, ActionIcon } from 'rizzui';
import cn from '@core/utils/class-names';

function formatBytes(bytes?: number) {
  if (!bytes) return '';
  const units = ['o', 'Ko', 'Mo', 'Go'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

interface PdfUploadProps {
  label?: string;
  file?: File | null;
  existingFilename?: string | null;
  existingFileSizeBytes?: number | null;
  existingFileUrl?: string;
  onChange: (file: File | null) => void;
  onRemoveExisting?: () => void;
  isRemovingExisting?: boolean;
  className?: string;
}

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

export default function PdfUpload({
  label,
  file,
  existingFilename,
  existingFileSizeBytes,
  existingFileUrl,
  onChange,
  onRemoveExisting,
  isRemovingExisting = false,
  className,
}: PdfUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selected = acceptedFiles[0];
      if (!selected) return;

      if (selected.type !== 'application/pdf') {
        toast.error('Veuillez sélectionner un fichier PDF');
        return;
      }

      if (selected.size > MAX_SIZE_BYTES) {
        toast.error('Le fichier ne doit pas dépasser 20 Mo');
        return;
      }

      onChange(selected);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    multiple: false,
  });

  const hasSelection = !!file || !!existingFilename;

  return (
    <div className={cn('grid gap-1.5', className)}>
      {label && <span className="block font-medium text-gray-900">{label}</span>}

      {hasSelection ? (
        <div className="flex items-center justify-between rounded-md border-[1.8px] px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <PiFilePdf className="h-8 w-8 shrink-0 text-red-600" />
            <div className="min-w-0">
              <Text className="truncate font-medium text-gray-900">
                {file ? file.name : existingFilename}
              </Text>
              <Text className="text-xs text-gray-500">
                {formatBytes(file ? file.size : existingFileSizeBytes ?? undefined)}
              </Text>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!file && existingFileUrl && (
              <a href={existingFileUrl} target="_blank" rel="noopener noreferrer">
                <ActionIcon
                  as="span"
                  size="sm"
                  variant="outline"
                  aria-label="Voir le fichier"
                >
                  <PiEye className="h-4 w-4" />
                </ActionIcon>
              </a>
            )}
            <ActionIcon
              size="sm"
              variant="outline"
              aria-label="Retirer le fichier"
              disabled={isRemovingExisting}
              onClick={() => {
                if (file) {
                  onChange(null);
                } else if (onRemoveExisting) {
                  onRemoveExisting();
                }
              }}
            >
              <PiTrash className="h-4 w-4" />
            </ActionIcon>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-[1.8px] border-dashed px-6 py-6 text-center transition-colors',
            isDragActive && 'border-primary bg-gray-50',
          )}
        >
          <input {...getInputProps()} />
          <PiFilePdf className="h-8 w-8 text-gray-400" />
          <Text className="text-sm font-medium">
            Glissez un PDF ici ou cliquez pour sélectionner
          </Text>
          <Text className="text-xs text-gray-400">PDF jusqu'à 20 Mo</Text>
        </div>
      )}
    </div>
  );
}
