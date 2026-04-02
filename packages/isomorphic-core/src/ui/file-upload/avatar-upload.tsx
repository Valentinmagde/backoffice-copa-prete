// components/ui/file-upload/avatar-upload.tsx
'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { PiCamera, PiTrash, PiSpinner, PiPencilSimple } from 'react-icons/pi';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { Loader, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import {
  useUploadMyAvatar,
  useUploadUserAvatar,
  useDeleteMyAvatar,
  useDeleteUserAvatar
} from '../../../../../src/lib/api/hooks/use-users';
import { LoadingSpinner } from './upload-zone';
import UploadIcon from '@core/components/shape/upload';

interface AvatarUploadProps {
  name: string;
  setValue: any;
  getValues: any;
  error?: string;
  // onUpload?: (url: string) => void;
  defaultAvatar?: string;
  className?: string;
  userId?: number;
  isAdmin?: boolean;
}

export default function AvatarUpload({
  name,
  setValue,
  getValues,
  error,
  // onUpload,
  defaultAvatar,
  className,
  userId,
  isAdmin = false,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string>(getValues(name) || defaultAvatar || '');

  // Choisir le bon hook selon le contexte
  const uploadMyAvatar = useUploadMyAvatar();
  const uploadUserAvatar = useUploadUserAvatar();
  const deleteMyAvatar = useDeleteMyAvatar();
  const deleteUserAvatar = useDeleteUserAvatar();

  const isUploading = userId
    ? uploadUserAvatar.isPending
    : uploadMyAvatar.isPending;
  const isDeleting = userId
    ? deleteUserAvatar.isPending
    : deleteMyAvatar.isPending;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    // Aperçu local
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload selon le contexte
    if (userId) {
      // Upload pour un utilisateur spécifique (admin)
      uploadUserAvatar.mutate(
        { userId, file },
        {
          onSuccess: (response) => {
            setPreview(response.url);
            setValue(name, response.url);
            // onUpload?.(response.url);
          },
          onError: () => {
            setPreview(getValues(name) || defaultAvatar || '');
          },
        }
      );
    } else {
      // Upload pour l'utilisateur connecté
      uploadMyAvatar.mutate(file, {
        onSuccess: (response) => {
          setPreview(response.url);
          setValue(name, response.url);
          // onUpload?.(response.url);
        },
        onError: () => {
          setPreview(getValues(name) || defaultAvatar || '');
        },
      });
    }

    URL.revokeObjectURL(objectUrl);
  }, [userId, name, setValue, defaultAvatar, getValues, uploadMyAvatar, uploadUserAvatar]);

  const handleRemove = () => {
    if (userId) {
      // Suppression pour un utilisateur spécifique (admin)
      deleteUserAvatar.mutate(userId, {
        onSuccess: () => {
          setPreview('');
          setValue(name, '');
          // onUpload?.('');
        },
      });
    } else {
      // Suppression pour l'utilisateur connecté
      deleteMyAvatar.mutate(undefined, {
        onSuccess: () => {
          setPreview('');
          setValue(name, '');
          // onUpload?.('');
        },
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const isLoading = isUploading || isDeleting;

  return (
    <div className={cn("grid gap-5 flex", className)}>
      <div className="relative">
        <div
        className={cn("relative grid h-40 w-40 place-content-center rounded-full border-[1.8px]")}
      >
          {/* <input {...getInputProps()} /> */}
          {preview ? (
            <>
            <figure className="absolute inset-0 rounded-full">
            <Image
              fill
              src={preview}
              alt="Avatar preview"
              className="rounded-full"
            />
            </figure>
            <div
              {...getRootProps()}
              className={cn("absolute inset-0 grid place-content-center rounded-full bg-black/70")}
            >
              {isUploading ? <LoadingSpinner /> : <PiPencilSimple className="h-5 w-5 text-white" />}

              <input {...getInputProps()} />
            </div></>
          ) : (
            <div
              {...getRootProps()}
              className={cn("absolute inset-0 z-10 grid cursor-pointer place-content-center")}
            >
              <input {...getInputProps()} />
              <UploadIcon className="mx-auto h-12 w-12" />

              {isUploading ? (
                <Loader
                  variant="spinner"
                  className="justify-center"
                />
              ) : (
                <Text className="font-medium text-center">Sélectionnez <br /> une image</Text>
              )}
            </div>
          )}
          {/* {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <PiSpinner className="h-8 w-8 animate-spin text-white" />
            </div>
          )} */}
        </div>
        {preview && !isLoading && (
          <button
            onClick={handleRemove}
            className="absolute -right-1 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            type="button"
          >
            <PiTrash className="h-3 w-3" />
          </button>
        )}
      </div>
      {/* <div className="text-center">
        <Text className="text-sm text-gray-500">
          Cliquez pour {preview ? 'changer' : 'ajouter'} la photo
        </Text>
        <Text className="text-xs text-gray-400">
          PNG, JPG, GIF jusqu'à 5MB
        </Text>
        {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
      </div> */}
    </div>
  );
}