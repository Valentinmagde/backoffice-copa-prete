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
    notifications: {
      list: '/mpme/notifications',
      // details: (id: number | string) => `/mpme/notifications/${id}`,
      // edit: (id: number | string) => `/mpme/notifications/${id}/edit`,
      // create: '/mpme/notifications/create',
    },
    contacts: {
      list: '/mpme/contacts',
    },
  },
  complaints: {
    list: '/mpme/complaints',
    details: (id: number | string) => `/mpme/complaints/${id}`,
  },
  formations: {
    list: '/formations',
    sessions: '/formations/sessions',
    sessionDetails: (id: number | string) => `/formations/sessions/${id}`,
  },
  subventions: {
    list: '/subventions',
    details: (id: number | string) => `/subventions/${id}`,
  },
  businessPlans: {
    list: '/plans-affaires',
    details: (id: number | string) => `/plans-affaires/${id}`,
    documents: (id: number | string) => `/plans-affaires/${id}/documents`,
    evaluations: (id: number | string) => `/plans-affaires/${id}/evaluations`,
  },
  evaluation: {
    search: '/evaluation',
    evaluate: (id: number | string) => `/evaluation/${id}`,
    all: '/evaluations',
  },
  cohorts: {
    list: '/cohorts',
    details: (id: number | string) => `/cohorts/${id}`,
    edit: (id: number | string) => `/cohorts/${id}/edit`,
    create: '/cohorts/create',
  },
  publicDocuments: {
    list: '/public-documents',
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
