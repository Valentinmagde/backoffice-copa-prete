import { DUMMY_ID } from '@/config/constants';
import { routes } from '@/config/routes';
import {
  PiBriefcaseDuotone,
  PiChatCenteredDotsDuotone,
  PiFolderLockDuotone,
  PiHouseLineDuotone,
  PiUserCircleDuotone,
} from 'react-icons/pi';

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  // label start
  {
    name: 'Aperçu',
  },
  // label end
  {
    name: 'Tableau de bord',
    href: '/',
    icon: <PiHouseLineDuotone />,
  },
  // label start
  {
    name: 'Pages',
  },
  {
    name: 'MPME & Coopératives',
    href: '#',
    icon: <PiBriefcaseDuotone />,
    dropdownItems: [
      {
        name: 'Liste des inscrits',
        href: routes.mpme.inscrits.list,
        badge: '',
      },
      {
        name: 'Dossiers de candidature',
        href: routes.mpme.candidatures.list
      },
    ],
  },
  {
    name: 'Paramètres',
  },
  {
    name: 'Rôles & permissions',
    href: routes.settings.rolesPermissions,
    icon: <PiFolderLockDuotone />,
  },
  {
    name: 'Profil',
    href: routes.settings.profile,
    icon: <PiUserCircleDuotone />,
  },
  {
    name: 'Paramètres du compte',
    href: routes.settings.profileSettings,
    icon: <PiChatCenteredDotsDuotone />,
  },
  // label end
];
