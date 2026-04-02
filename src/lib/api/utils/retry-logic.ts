export interface RetryOptions {
    maxAttempts?: number;
    delay?: number;
    backoff?: boolean;
    shouldRetry?: (error: any) => boolean;
}

/**
 * Fonction générique pour réessayer une requête
 */
export async function retryLogic<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 1,
    options: RetryOptions = {}
): Promise<T> {
    const {
        delay = 1000,
        backoff = true,
        shouldRetry = (error) => {
            // Ne pas réessayer pour certaines erreurs
            if (error?.response?.status === 401) return false;
            if (error?.response?.status === 403) return false;
            if (error?.response?.status === 404) return false;
            return true;
        }
    } = options;

    let lastError: any;
    let currentDelay = delay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Vérifier si on doit réessayer
            if (!shouldRetry(error) || attempt === maxAttempts) {
                throw error;
            }

            // Attendre avant de réessayer
            await new Promise(resolve => setTimeout(resolve, currentDelay));

            // Backoff exponentiel
            if (backoff) {
                currentDelay *= 2;
            }
        }
    }

    throw lastError;
}

/**
 * Version spécifique pour les requêtes API
 */
export async function retryApiRequest<T>(
    request: () => Promise<T>,
    maxRetries: number = 1
): Promise<T> {
    return retryLogic(request, maxRetries, {
        backoff: true,
        shouldRetry: (error) => {
            // Réessayer pour les erreurs réseau et les erreurs 5xx
            if (!error?.response) return true; // Erreur réseau
            const status = error.response?.status;
            return status >= 500 && status < 600; // Erreurs serveur
        }
    });
}