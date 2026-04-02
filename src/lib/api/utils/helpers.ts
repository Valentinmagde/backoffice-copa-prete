// lib/utils/token.ts

export interface DecodedToken {
    sub?: string;
    email?: string;
    roles?: string[];
    exp?: number;
    iat?: number;
    [key: string]: any;
}

/**
 * Décode un token JWT sans vérifier sa signature
 * @param token - Le token JWT à décoder
 * @returns L'objet payload décodé ou null en cas d'erreur
 */
export function decodeToken(token: string|undefined): DecodedToken | null {
    if (!token || typeof token !== 'string') {
        console.error('Token invalide: token non fourni ou type incorrect');
        return null;
    }

    try {
        // Vérifier que le token a le format JWT (3 parties séparées par des points)
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('Token invalide: format incorrect, doit avoir 3 parties');
            return null;
        }

        const payload = parts[1];

        // Décoder le base64
        let decoded: string;
        try {
            // atob échoue si le base64 contient des caractères URL-safe
            decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        } catch (base64Error) {
            console.error('Erreur décodage base64:', base64Error);
            return null;
        }

        // Parser le JSON
        const parsed = JSON.parse(decoded);

        // Vérifier que le payload contient des données valides
        if (!parsed || typeof parsed !== 'object') {
            console.error('Token invalide: payload non valide');
            return null;
        }

        return parsed;
    } catch (error) {
        console.error('Erreur décodage token:', error);
        return null;
    }
}

/**
 * Vérifie si un token est expiré
 * @param token - Le token JWT
 * @param bufferSeconds - Marge de sécurité en secondes (défaut: 0)
 * @returns true si le token est expiré, false sinon
 */
export function isTokenExpired(token: string, bufferSeconds: number = 0): boolean {
    const decoded = decodeToken(token);

    if (!decoded || !decoded.exp) {
        return true; // Token invalide ou sans date d'expiration
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp <= currentTime + bufferSeconds;
}

/**
 * Obtient le temps restant avant expiration en secondes
 * @param token - Le token JWT
 * @returns Nombre de secondes restantes ou 0 si expiré/invalide
 */
export function getTokenRemainingTime(token: string): number {
    const decoded = decodeToken(token);

    if (!decoded || !decoded.exp) {
        return 0;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - currentTime;

    return remaining > 0 ? remaining : 0;
}

/**
 * Formate le temps restant en format lisible
 * @param token - Le token JWT
 * @returns String formaté (ex: "2h 30m" ou "5m 30s")
 */
export function getFormattedRemainingTime(token: string): string {
    const remainingSeconds = getTokenRemainingTime(token);

    if (remainingSeconds <= 0) {
        return 'Expiré';
    }

    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
}

/**
 * Extrait l'email du token
 */
export function getEmailFromToken(token: string): string | null {
    const decoded = decodeToken(token);
    return decoded?.email || decoded?.sub || null;
}

/**
 * Extrait les rôles du token
 */
export function getRolesFromToken(token: string): string[] {
    const decoded = decodeToken(token);

    if (decoded?.roles && Array.isArray(decoded.roles)) {
        return decoded.roles;
    }

    if (decoded?.role) {
        return Array.isArray(decoded.role) ? decoded.role : [decoded.role];
    }

    return [];
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export function hasRole(token: string, role: string): boolean {
    const roles = getRolesFromToken(token);
    return roles.includes(role);
}

/**
 * Vérifie si l'utilisateur a au moins un des rôles spécifiés
 */
export function hasAnyRole(token: string, roles: string[]): boolean {
    const userRoles = getRolesFromToken(token);
    return roles.some(role => userRoles.includes(role));
}

/**
 * Vérifie si l'utilisateur a tous les rôles spécifiés
 */
export function hasAllRoles(token: string, roles: string[]): boolean {
    const userRoles = getRolesFromToken(token);
    return roles.every(role => userRoles.includes(role));
}