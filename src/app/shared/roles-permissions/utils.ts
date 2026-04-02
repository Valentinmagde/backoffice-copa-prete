import { ROLES } from '@/config/constants';
import { PERMISSIONS, STATUSES } from '@/data/users-data';

export const statuses = [
  {
    label: 'Actif',
    value: STATUSES.Active,
  },
  {
    label: 'Désactivé',
    value: STATUSES.Deactivated,
  },
  {
    label: 'En attente',
    value: STATUSES.Pending
  }
];

export const permissions = Object.values(PERMISSIONS).map((permission) => ({
  label: permission,
  value: permission,
}));

export const roles = Object.entries(ROLES).map(([key, value]) => ({
  label: value,
  value: key,
}));
