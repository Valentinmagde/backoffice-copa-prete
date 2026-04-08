export const routes = {
  searchAndFilter: {
    realEstate: '/search/real-estate',
    nft: '/search/nft',
    flight: '/search/flight',
  },
  executive: {
    dashboard: '/executive',
  },
  mpme: {
    inscrits: {
      list: '/mpme/inscrits',
      details: (id: number | string) => `/mpme/inscrits/${id}`,
      edit: (id: number | string) => `/mpme/inscrits/${id}/edit`,
      create: '/mpme/inscrits/create',
    },
    candidatures: {
      list: '/mpme/candidatures',
      details: (id: number | string) => `/mpme/candidatures/${id}`,
      evaluate: (id: number | string) => `/mpme/candidatures/${id}/evaluate`,
      create: '/mpme/candidatures/create',
    },
  },
  cohorts: {
    list: '/cohorts',
    details: (id: number | string) => `/cohorts/${id}`,
    edit: (id: number | string) => `/cohorts/${id}/edit`,
    create: '/cohorts/create',
  },
  settings: {
    rolesPermissions: '/settings/roles-permissions',
    profile: '/settings/profile',
    profileSettings: '/settings/profile-settings',
    // notificationPreference: '/settings/:id/profile-settings/notification',
    // personalInformation: '/settings/:id/profile-settings/profile',
    // newsletter: '/forms/newsletter',
  },
  accessDenied: '/access-denied',
  notFound: '/not-found',
  maintenance: '/maintenance',
  blank: '/blank',
  auth: {
    signIn: '/auth/signin',
    forgotPassword: '/auth/forgot-password'
  },
};
