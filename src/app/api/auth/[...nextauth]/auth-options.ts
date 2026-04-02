import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '@/env.mjs';
import { pagesOptions } from './pages-options';
import { authApi } from '@/lib/api/endpoints/auth.api';
import { decodeToken } from '@/lib/api/utils/helpers';

export const authOptions: NextAuthOptions = {
  // debug: true,
  pages: {
    ...pagesOptions,
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {

      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          roles: token.roles as string[],
          image: token.image as string,
        },
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
      };
    },

    async jwt({ token, user }) {
      console.log('JWT Callback', { token, user })
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.roles = user.roles;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpiry = user.accessTokenExpiry;
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      const parsedUrl = new URL(url, baseUrl);

      if (parsedUrl.searchParams.has('callbackUrl')) {
        const callbackUrl = parsedUrl.searchParams.get('callbackUrl');
        if (callbackUrl?.startsWith(baseUrl)) {
          return callbackUrl;
        }
      }

      return `${baseUrl}`;
    },
  },

  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validation des credentials
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email ou mot de passe manquant');
          }

          // Appel à votre API NestJS
          const response = await authApi.login({
            email: credentials.email,
            password: credentials.password,
          });

          // Vérifier si la réponse contient une erreur
          if (!response || response.error) {
            throw new Error(response.message || response.error || 'Identifiants invalides');
          }

          // Vérifier que toutes les données requises sont présentes
          if (!response.accessToken || !response.refreshToken || !response.user) {
            console.error('Données manquantes dans la réponse:', {
              hasAccessToken: !!response.accessToken,
              hasRefreshToken: !!response.refreshToken,
              hasUser: !!response.user,
            });
            throw new Error('Données manquantes dans la réponse de l’API');
          }

          // S'assurer que l'ID utilisateur existe
          if (!response.user.id) {
            console.error('ID utilisateur manquant');
            return null;
          }

          // Calculer l'expiration du token
          let accessTokenExpiry = Date.now() + 3600 * 1000; // 1 heure par défaut

          if (response.accessToken) {
            const decoded = decodeToken(response.accessToken);
            if (decoded?.exp) {
              accessTokenExpiry = decoded.exp * 1000;
            } else if (response.expiresIn) {
              accessTokenExpiry = Date.now() + (response.expiresIn * 1000);
            }
          }

          // Construire l'objet utilisateur avec des valeurs garanties non-undefined
          const user = {
            id: String(response.user.id), // Force la conversion en string
            email: response.user.email,
            name: `${response.user.firstName} ${response.user.lastName}`.trim(),
            roles: response.user.roles,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            accessTokenExpiry: accessTokenExpiry,
            image: response.user.image || null,
          };

          console.log('Utilisateur authentifié:', {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.roles,
          });

          return user;
        } catch (error: any) {
          console.error('Erreur d\'authentification:', error);
          throw new Error(error.message || 'Erreur inconnue');
        }
      },
    }),

    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
};
