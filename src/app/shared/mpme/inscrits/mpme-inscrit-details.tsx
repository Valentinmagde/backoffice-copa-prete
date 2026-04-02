'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Text, Title } from 'rizzui';
import { PiEnvelope, PiPhone, PiMapPin, PiCalendar, PiBuilding, PiUser, PiChartBar, PiGenderIntersex } from 'react-icons/pi';
import WidgetCard from '@core/components/cards/widget-card';

interface MPMEInscritDetailsProps {
  data: any;
}

export default function MPMEInscritDetails({ data }: MPMEInscritDetailsProps) {
  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Text>Données non disponibles</Text>
      </div>
    );
  }

  const formatDate = (date: string) => {
    if (!date) return 'Non renseigné';
    return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'registered':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'validated':
        return 'Validé';
      case 'rejected':
        return 'Rejeté';
      case 'registered':
        return 'Inscrit';
      default:
        return 'En attente';
    }
  };

  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <WidgetCard className="p-6">
        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <div>
            <Title as="h3" className="text-lg font-semibold">
              Informations générales
            </Title>
            <Text className="text-sm text-gray-500">
              Détails du MPME inscrit
            </Text>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(data.status)}`}>
            {getStatusLabel(data.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <PiBuilding className="mt-1 h-5 w-5 text-gray-400" />
            <div>
              <Text className="text-sm text-gray-500">Entreprise</Text>
              <Text className="font-medium">{data.companyName || 'Non renseigné'}</Text>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <PiUser className="mt-1 h-5 w-5 text-gray-400" />
            <div>
              <Text className="text-sm text-gray-500">Représentant</Text>
              <Text className="font-medium">{data.representativeName || 'Non renseigné'}</Text>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <PiEnvelope className="mt-1 h-5 w-5 text-gray-400" />
            <div>
              <Text className="text-sm text-gray-500">Email</Text>
              <Text className="font-medium">{data.email || 'Non renseigné'}</Text>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <PiPhone className="mt-1 h-5 w-5 text-gray-400" />
            <div>
              <Text className="text-sm text-gray-500">Téléphone</Text>
              <Text className="font-medium">{data.phone || 'Non renseigné'}</Text>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <PiMapPin className="mt-1 h-5 w-5 text-gray-400" />
            <div>
              <Text className="text-sm text-gray-500">Province / Commune</Text>
              <Text className="font-medium">
                {data.province || 'Non renseigné'} / {data.commune || 'Non renseigné'}
              </Text>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <PiCalendar className="mt-1 h-5 w-5 text-gray-400" />
            <div>
              <Text className="text-sm text-gray-500">Date d'inscription</Text>
              <Text className="font-medium">{formatDate(data.registrationDate)}</Text>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <PiChartBar className="mt-1 h-5 w-5 text-gray-400" />
            <div>
              <Text className="text-sm text-gray-500">Complétion du profil</Text>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-primary-500"
                    style={{ width: `${data.profileCompletion || 0}%` }}
                  />
                </div>
                <Text className="font-medium">{data.profileCompletion || 0}%</Text>
              </div>
            </div>
          </div>

          {/* <div className="flex items-start gap-3">
            <PiGenderIntersex className="mt-1 h-5 w-5 text-gray-400" />
            <div>
              <Text className="text-sm text-gray-500">Genre</Text>
              <Text className="font-medium">{data.gender || 'Non renseigné'}</Text>
            </div>
          </div> */}
        </div>
      </WidgetCard>

      {/* Informations supplémentaires */}
      {(data.nif || data.employees || data.companyType) && (
        <WidgetCard className="p-6">
          <div className="mb-4 border-b pb-4">
            <Title as="h3" className="text-lg font-semibold">
              Informations complémentaires
            </Title>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {data.companyType && (
              <div>
                <Text className="text-sm text-gray-500">Type d'entreprise</Text>
                <Text className="font-medium">
                  {data.companyType === 'formal' ? 'Formelle' : 
                   data.companyType === 'informal' ? 'Informelle' : 
                   data.companyType || 'Non renseigné'}
                </Text>
              </div>
            )}

            {data.nif && (
              <div>
                <Text className="text-sm text-gray-500">NIF</Text>
                <Text className="font-medium">{data.nif}</Text>
              </div>
            )}

            {data.employees !== undefined && (
              <div>
                <Text className="text-sm text-gray-500">Nombre d'employés</Text>
                <Text className="font-medium">{data.employees}</Text>
              </div>
            )}

            {data.isWomanLed && (
              <div>
                <Text className="text-sm text-gray-500">Entreprise dirigée par une femme</Text>
                <Text className="font-medium text-green-600">Oui</Text>
              </div>
            )}

            {data.isRefugeeLed && (
              <div>
                <Text className="text-sm text-gray-500">Entreprise dirigée par un réfugié</Text>
                <Text className="font-medium text-green-600">Oui</Text>
              </div>
            )}
          </div>
        </WidgetCard>
      )}
    </div>
  );
}