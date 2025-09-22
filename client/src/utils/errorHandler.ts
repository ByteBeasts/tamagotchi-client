// src/utils/errorHandler.ts

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public errors?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export const handleApiError = (error: any): string => {
    if (error.response) {
        // Error de respuesta del servidor
        const { status, data } = error.response;

        switch (status) {
            case 400:
                return data.message || 'Datos inválidos';
            case 404:
                return 'Recurso no encontrado';
            case 409:
                return 'El recurso ya existe';
            case 500:
                return 'Error del servidor';
            default:
                return data.message || 'Error desconocido';
        }
    } else if (error.request) {
        // No hubo respuesta del servidor
        return 'No se pudo conectar con el servidor';
    } else {
        // Error de configuración
        return error.message || 'Error de configuración';
    }
};