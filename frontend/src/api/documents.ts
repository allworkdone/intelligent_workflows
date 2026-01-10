import apiClient from './client';
import type { Document, ApiResponse } from '../types';

export const documentsApi = {
    upload: async (stackId: string, file: File): Promise<ApiResponse<{ id: string; filename: string; message: string }>> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post(`/documents/upload/${stackId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    process: async (documentId: string, embeddingModel: string = 'openai', apiKey?: string): Promise<ApiResponse<Document>> => {
        const params = new URLSearchParams({ embedding_model: embeddingModel });
        if (apiKey) params.append('api_key', apiKey);

        const response = await apiClient.post(`/documents/${documentId}/process?${params}`);
        return response.data;
    },

    getByStack: async (stackId: string): Promise<ApiResponse<Document[]>> => {
        const response = await apiClient.get(`/documents/stack/${stackId}`);
        return response.data;
    },

    delete: async (documentId: string): Promise<ApiResponse<null>> => {
        const response = await apiClient.delete(`/documents/${documentId}`);
        return response.data;
    },
};
