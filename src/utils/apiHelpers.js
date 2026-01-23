/**
 * API Error Handling & Response Utilities
 */

export class APIError extends Error {
    constructor(message, status = 500, details = null) {
        super(message);
        this.status = status;
        this.details = details;
        this.name = 'APIError';
    }
}

export const apiRequest = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: response.statusText };
            }

            throw new APIError(
                errorData.error || errorData.message || `HTTP ${response.status}`,
                response.status,
                errorData
            );
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }

        throw new APIError(
            error.message || 'Failed to make API request',
            0,
            { originalError: error }
        );
    }
};

export const handleAPIError = (error, fallbackMessage = 'Une erreur est survenue') => {
    if (error instanceof APIError) {
        return {
            success: false,
            message: error.message || fallbackMessage,
            status: error.status,
            details: error.details,
        };
    }

    return {
        success: false,
        message: fallbackMessage,
        status: 0,
        details: { originalError: error },
    };
};

export const apiRequestWithRetry = async (
    url,
    options = {},
    maxRetries = 3,
    baseDelay = 1000
) => {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await apiRequest(url, options);
        } catch (error) {
            lastError = error;

            if (error.status >= 400 && error.status < 500) {
                throw error;
            }

            if (attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.warn(
                    `API request failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`
                );
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
};

export const formatAPIError = (error) => {
    if (error instanceof APIError) {
        const errorMap = {
            400: 'Requête invalide. Vérifiez vos données.',
            401: 'Non authentifié. Connectez-vous.',
            403: 'Accès refusé.',
            404: 'Ressource non trouvée.',
            429: 'Trop de requêtes. Réessayez plus tard.',
            500: 'Erreur serveur. Réessayez plus tard.',
            503: 'Service indisponible. Réessayez plus tard.',
        };

        return errorMap[error.status] || error.message || 'Une erreur est survenue';
    }

    return 'Erreur de connexion. Vérifiez votre internet.';
};
