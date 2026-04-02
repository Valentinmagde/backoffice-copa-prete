'use client';

import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { SubmitHandler, Controller } from 'react-hook-form';
import { PiEnvelopeSimple, PiPhone, PiUser } from 'react-icons/pi';
import { Form } from '@core/ui/form';
import { Loader, Text, Input, Select } from 'rizzui';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@core/components/form-footer';
import {
  PersonalInfoFormTypes,
  personalInfoFormSchema,
} from '@/validators/personal-info.schema';
import AvatarUpload from '@core/ui/file-upload/avatar-upload';
import { useRoles } from '@/lib/api/hooks/use-roles';
import { useUser, useUpdateUser } from '@/lib/api/hooks/use-users';
import { useParams, useRouter } from 'next/navigation';

const QuillEditor = dynamic(() => import('@core/ui/quill-editor'), {
  ssr: false,
  loading: () => (
    <div className="grid h-32 place-content-center">
      <Loader variant="spinner" />
    </div>
  ),
});

export default function PersonalInfoView() {
  const params = useParams();
  const userId = params?.id as string;
  const id = userId ? parseInt(userId) : undefined;

  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: selectedUser, isLoading: isLoadingUser } = useUser(id as number);
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser(id as number);

  // Transformer les rôles pour le select
  const roleOptions = roles?.map((role) => ({
    label: role.name,
    value: role.code,
  })) || [];

  // Valeurs par défaut pour le formulaire
  const defaultValues: PersonalInfoFormTypes = {
    firstName: selectedUser?.firstName || '',
    lastName: selectedUser?.lastName || '',
    email: selectedUser?.email || '',
    phoneNumber: selectedUser?.phoneNumber || '',
    profilePhotoUrl: selectedUser?.profilePhotoUrl || '',
    role: selectedUser?.roles || [],
    bio: selectedUser?.bio || '',
  };

  const onSubmit: SubmitHandler<PersonalInfoFormTypes> = (data) => {
    console.log('Form data:', data);
    updateUser(data, {
      onSuccess: () => {
        toast.success(<Text as="b">Profil mis à jour avec succès !</Text>);
      },
      onError: (error: any) => {
        toast.error(<Text as="b">{error?.message || 'Erreur lors de la mise à jour'}</Text>);
        console.error('Error updating user:', error);
      },
    });
  };

  // Gestionnaire pour l'upload d'avatar
  // const handleAvatarUpload = async (file: File) => {
  //   if (!id) return;

  //   uploadUserAvatar.mutate(
  //     { userId: id, file },
  //     {
  //       onSuccess: () => {
  //         toast.success('Photo de profil mise à jour');
  //       },
  //     }
  //   );
  // };

  if (isLoadingUser || rolesLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader variant="spinner" size="lg" />
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Text className="text-gray-500">Utilisateur non trouvé</Text>
      </div>
    );
  }

  return (
    <Form<PersonalInfoFormTypes>
      validationSchema={personalInfoFormSchema}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: 'onChange',
        defaultValues,
      }}
    >
      {({ register, control, setValue, getValues, formState: { errors } }) => (
        <>
          <FormGroup
            title="Informations personnelles"
            description="Modifiez les informations personnelles de l'utilisateur"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          />

          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
            {/* Nom et prénom */}
            <FormGroup
              title="Nom complet"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Input
                placeholder="Prénom"
                prefix={<PiUser className="h-5 w-5 text-gray-500" />}
                {...register('firstName')}
                error={errors.firstName?.message}
                className="flex-grow"
              />
              <Input
                placeholder="Nom"
                prefix={<PiUser className="h-5 w-5 text-gray-500" />}
                {...register('lastName')}
                error={errors.lastName?.message}
                className="flex-grow"
              />
            </FormGroup>

            {/* Email */}
            <FormGroup
              title="Adresse email"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Input
                className="col-span-full"
                prefix={<PiEnvelopeSimple className="h-5 w-5 text-gray-500" />}
                type="email"
                placeholder="exemple@email.com"
                {...register('email')}
                error={errors.email?.message}
                disabled
              />
            </FormGroup>

            {/* Téléphone */}
            <FormGroup
              title="Numéro de téléphone"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Input
                className="col-span-full"
                prefix={<PiPhone className="h-5 w-5 text-gray-500" />}
                placeholder="+257 XX XX XX XX"
                {...register('phoneNumber')}
                error={errors.phoneNumber?.message}
              />
            </FormGroup>

            {/* Photo de profil */}
            <FormGroup
              title="Photo de profil"
              description="Cette photo sera affichée sur le profil de l'utilisateur"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <div className="flex flex-col gap-6 @container @3xl:col-span-2">
                <AvatarUpload
                  name="profilePhotoUrl"
                  setValue={setValue}
                  getValues={getValues}
                  error={errors?.profilePhotoUrl?.message as string}
                  // onUpload={handleAvatarUpload}
                  // isLoading={isUploading}
                  userId={id}
                  defaultAvatar={selectedUser?.profilePhotoUrl}
                />
              </div>
            </FormGroup>

            {/* Rôle (multi-sélection possible) */}
            <FormGroup
              title="Rôle"
              description="Sélectionnez le ou les rôles de l'utilisateur"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Controller
                control={control}
                name="role"
                render={({ field: { value, onChange } }) => (
                  <Select
                    dropdownClassName="!z-10 h-auto"
                    inPortal={false}
                    placeholder="Select Role"
                    options={roleOptions}
                    onChange={onChange}
                    value={value}
                    multiple
                    className="col-span-full"
                    getOptionValue={(option) => option.value}
                    displayValue={(selected) =>
                      selected
                        ?.map(
                          (val) =>
                            roleOptions?.find((r) => r.value === val)?.label
                        )
                        .filter(Boolean)
                        .join(', ')
                    }
                    error={errors?.role?.message as string}
                  />
                )}
              />
            </FormGroup>

            {/* Biographie (optionnelle) */}
            <FormGroup
              title="Biographie"
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              <Controller
                control={control}
                name="bio"
                render={({ field: { onChange, value } }) => (
                  <QuillEditor
                    value={value}
                    onChange={onChange}
                    className="@3xl:col-span-2 [&>.ql-container_.ql-editor]:min-h-[100px]"
                    labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
                  />
                )}
              />
            </FormGroup>
          </div>

          <FormFooter
            isLoading={isUpdating}
            altBtnText="Annuler"
            submitBtnText="Enregistrer"
            // altBtnFunction={() => router.back()}
          />
        </>
      )}
    </Form>
  );
}