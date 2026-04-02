'use client';

import Image from 'next/image';
import { PiEnvelopeSimple, PiPhone, PiUser, PiCalendar, PiShieldCheck, PiSealCheckFill, PiGlobe, PiMapPin } from 'react-icons/pi';
import { Title, Text, Loader, Button } from 'rizzui';
import cn from '@core/utils/class-names';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { useLayout } from '@/layouts/use-layout';
import { LAYOUT_OPTIONS } from '@/config/enums';
import { useCurrentUser } from '@/lib/api/hooks/use-users';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import FormGroup from '@/app/shared/form-group';

// Composant pour afficher une ligne d'information avec le style UI existant
const InfoRow = ({ label, value, icon: Icon }: { label: string; value?: string | React.ReactNode; icon: React.ElementType }) => {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-dashed border-gray-200 last:border-0">
      <div className="flex-shrink-0 mt-1 text-gray-400">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="text-gray-900">{value}</div>
      </div>
    </div>
  );
};

export default function ProfileDetails() {
  const { data: user, isLoading, error } = useCurrentUser();
  const { layout } = useLayout();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader variant="spinner" size="lg" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <Text className="text-red-500">Erreur lors du chargement du profil</Text>
        <Link href={routes.auth.signIn}>
          <Button variant="solid">Se connecter</Button>
        </Link>
      </div>
    );
  }

  const formattedDate = user.createdAt
    ? format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: fr })
    : 'Non disponible';

  const statusLabel = user.isActive ? 'Actif' : 'Inactif';
  const statusColor = user.isActive ? 'text-green-dark' : 'text-red-dark';
  const statusBg = user.isActive ? 'bg-green-100' : 'bg-red-100';

  // Nettoyer la bio du HTML pour l'affichage
  const cleanBio = user.bio;

  return (
    <>
      <ProfileHeader
        title={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur'}
        description={user.email || ''}
        avatarUrl={user.profilePhotoUrl || "https://isomorphic-furyroad.s3.amazonaws.com/public/profile-image.webp"}
      >
        <div className="w-full sm:w-auto md:ms-auto">
          <Link href={`/settings/${user.id}/profile-settings`}>
            <Button as="span">
              Modifier le profil
            </Button>
          </Link>
        </div>
      </ProfileHeader>

      <div className="mx-auto mb-10 mt-8 grid w-full max-w-screen-2xl gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
        {/* Informations personnelles */}
        <FormGroup
          title="Informations personnelles"
          className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
        >
          <div className="col-span-full grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoRow label="Nom complet" value={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Non renseigné'} icon={PiUser} />
            <InfoRow label="Email" value={user.email || 'Non renseigné'} icon={PiEnvelopeSimple} />
            <InfoRow label="Téléphone" value={user.phoneNumber || 'Non renseigné'} icon={PiPhone} />
            <InfoRow label="Date d'inscription" value={formattedDate} icon={PiCalendar} />
            <InfoRow label="Rôle" value={user.role || user.roleCode || 'Non renseigné'} icon={PiShieldCheck} />
            <InfoRow
              label="Statut"
              value={
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBg} ${statusColor}`}>
                  {statusLabel}
                </span>
              }
              icon={PiShieldCheck}
            />
          </div>
        </FormGroup>

        {/* Biographie */}
        {cleanBio && (
          <FormGroup
            title="Biographie"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <div className="col-span-full">
              <div className="rounded-md bg-gray-50 p-4">
                <p className="whitespace-pre-wrap break-words text-gray-700" dangerouslySetInnerHTML={{ __html: cleanBio }} />
              </div>
            </div>
          </FormGroup>
        )}

        {/* Site web */}
        {user.website && (
          <FormGroup
            title="Site web"
            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
            <div className="col-span-full">
              <a
                href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 hover:underline"
              >
                <PiGlobe className="h-5 w-5" />
                {user.website}
              </a>
            </div>
          </FormGroup>
        )}

        {/* Informations du compte */}
        <FormGroup
          title="Informations du compte"
          className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
        >
          <div className="col-span-full grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoRow label="ID utilisateur" value={`#${user.id}`} icon={PiUser} />
            {user.roleCode && (
              <InfoRow label="Code rôle" value={user.roleCode} icon={PiShieldCheck} />
            )}
            <InfoRow
              label="Compte vérifié"
              value={
                user.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <PiSealCheckFill className="h-4 w-4" />
                    Oui
                  </span>
                ) : (
                  <span className="text-amber-600">Non</span>
                )
              }
              icon={PiShieldCheck}
            />
            <InfoRow
              label="Dernière mise à jour"
              value={
                user.updatedAt
                  ? format(new Date(user.updatedAt), 'dd MMMM yyyy', { locale: fr })
                  : 'Non disponible'
              }
              icon={PiCalendar}
            />
          </div>
        </FormGroup>
      </div>
    </>
  );
}

export function ProfileHeader({
  title,
  description,
  children,
  avatarUrl = "https://isomorphic-furyroad.s3.amazonaws.com/public/profile-image.webp",
}: React.PropsWithChildren<{ title: string; description?: string; avatarUrl?: string }>) {
  const { layout } = useLayout();

  return (
    <div
      className={cn(
        'relative z-0 -mx-4 px-4 pt-28 before:absolute before:start-0 before:top-0 before:h-40 before:w-full before:bg-gradient-to-r before:from-[#F8E1AF] before:to-[#F6CFCF] @3xl:pt-[190px] @3xl:before:h-[calc(100%-120px)] dark:before:from-[#bca981] dark:before:to-[#cbb4b4] md:-mx-5 md:px-5 lg:-mx-8 lg:px-8 xl:-mx-6 xl:px-6 3xl:-mx-[33px] 3xl:px-[33px] 4xl:-mx-10 4xl:px-10',
      )}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-screen-2xl flex-wrap items-end justify-start gap-6 border-b border-dashed border-muted pb-10">
        <div className="relative -top-1/3 aspect-square w-[110px] overflow-hidden rounded-full border-[6px] border-white bg-gray-100 shadow-profilePic @2xl:w-[130px] @5xl:-top-2/3 @5xl:w-[150px] dark:border-gray-50 3xl:w-[200px]">
          <Image
            src={avatarUrl}
            alt="Photo de profil"
            fill
            sizes="(max-width: 768px) 100vw"
            className="aspect-auto object-cover"
          />
        </div>
        <div>
          <Title
            as="h2"
            className="mb-2 inline-flex items-center gap-3 text-xl font-bold text-gray-900"
          >
            {title}
            <PiSealCheckFill className="h-5 w-5 text-primary md:h-6 md:w-6" />
          </Title>
          {description ? (
            <Text className="text-sm text-gray-500">{description}</Text>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}