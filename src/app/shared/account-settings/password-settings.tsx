'use client';

import { useState } from 'react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@core/ui/form';
import { Button, Password } from 'rizzui';
import { ProfileHeader } from '@/app/shared/account-settings/profile-settings';
import HorizontalFormBlockWrapper from '@/app/shared/account-settings/horiozontal-block';
import {
  passwordFormSchema,
  PasswordFormTypes,
} from '@/validators/password-settings.schema';
import { useChangePassword } from '@/lib/api/hooks/use-auth';
import { useUser } from '@/lib/api/hooks/use-users';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function PasswordSettingsView({
  settings,
}: {
  settings?: PasswordFormTypes;
}) {
  const params = useParams();
  const userId = params?.id as string;
  const id = userId ? parseInt(userId) : undefined;
  const [isLoading, setLoading] = useState(false);
  const [reset, setReset] = useState({});
  const { mutate: changePassword, isPending } = useChangePassword();
  const { data: selectedUser, isLoading: isLoadingUser } = useUser(id as number);

  const onSubmit: SubmitHandler<PasswordFormTypes> = (data) => {
     changePassword(data, {
      onSuccess: () => {
        toast.success('Mot de passe mis à jour avec succès');
        // Réinitialiser le formulaire après succès
        setReset({
          currentPassword: '',
          newPassword: '',
          confirmedPassword: '',
        });
      },
      onError: (error: any) => {
        console.error('Error changing password:', error);
        toast.error(error?.message || 'Erreur lors de la mise à jour');
      },
    });
  };

  return (
    <>
      <Form<PasswordFormTypes>
        validationSchema={passwordFormSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        className="@container"
        useFormProps={{
          mode: 'onChange',
          defaultValues: {
            ...settings,
          },
        }}
      >
        {({ register, control, formState: { errors }, getValues }) => {
          return (
            <>
              <ProfileHeader
                title={`${selectedUser?.firstName || ''} ${selectedUser?.lastName || ''}`}
                description={`${selectedUser?.email || ''}`}
                avatarUrl={selectedUser?.profilePhotoUrl || ''}
              />

              <div className="mx-auto w-full max-w-screen-2xl">
                <HorizontalFormBlockWrapper
                  title="Mot de passe actuel"
                  titleClassName="text-base font-medium"
                >
                  <Password
                    {...register('currentPassword')}
                    placeholder="Entrez votre mot de passe"
                    error={errors.currentPassword?.message}
                  />
                </HorizontalFormBlockWrapper>

                <HorizontalFormBlockWrapper
                  title="Nouveau mot de passe"
                  titleClassName="text-base font-medium"
                >
                  <Controller
                    control={control}
                    name="newPassword"
                    render={({ field: { onChange, value } }) => (
                      <Password
                        placeholder="Entrez votre mot de passe"
                        helperText={
                          getValues().newPassword.length < 8 &&
                          'Votre mot de passe doit contenir au moins de 8 caractères'
                        }
                        onChange={onChange}
                        error={errors.newPassword?.message}
                      />
                    )}
                  />
                </HorizontalFormBlockWrapper>

                <HorizontalFormBlockWrapper
                  title="Confirmer le nouveau mot de passe"
                  titleClassName="text-base font-medium"
                >
                  <Controller
                    control={control}
                    name="confirmedPassword"
                    render={({ field: { onChange, value } }) => (
                      <Password
                        placeholder="Entrez votre mot de passe"
                        onChange={onChange}
                        error={errors.confirmedPassword?.message}
                      />
                    )}
                  />
                </HorizontalFormBlockWrapper>

                <div className="mt-6 flex w-auto items-center justify-end gap-3">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                  <Button type="submit" variant="solid" isLoading={isLoading}>
                    Mettre à jour le mot de passe
                  </Button>
                </div>
              </div>
            </>
          );
        }}
      </Form>
    </>
  );
}
