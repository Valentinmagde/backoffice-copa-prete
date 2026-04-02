/**
 * Transforme les données camelCase en snake_case pour l'API
 */
export function toSnakeCase<T extends Record<string, any>>(obj: T): any {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => toSnakeCase(item));
    }

    return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        const value = obj[key];

        acc[snakeKey] = value && typeof value === 'object'
            ? toSnakeCase(value)
            : value;

        return acc;
    }, {} as any);
}

/**
 * Transforme les données snake_case en camelCase pour le frontend
 */
export function toCamelCase<T extends Record<string, any>>(obj: T): any {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => toCamelCase(item));
    }

    return Object.keys(obj).reduce((acc, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        const value = obj[key];

        acc[camelKey] = value && typeof value === 'object'
            ? toCamelCase(value)
            : value;

        return acc;
    }, {} as any);
}

/**
 * Formate les données pour l'envoi à l'API
 */
export function formatRequestData<T>(data: T): any {
    return toSnakeCase(data as any);
}

/**
 * Formate les données reçues de l'API
 */
export function formatResponseData<T>(data: T): any {
    return toCamelCase(data as any);
}

/**
 * Transforme les paramètres d'URL
 */
export function formatQueryParams(params: Record<string, any>): Record<string, string> {
    const formatted: Record<string, string> = {};

    Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '') {
            formatted[key] = String(value);
        }
    });

    return formatted;
}