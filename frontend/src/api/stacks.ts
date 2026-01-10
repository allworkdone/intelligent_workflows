import apiClient from './client';
import type { Stack, StackCreate, StackUpdate, WorkflowData, ApiResponse } from '../types';

export const stacksApi = {
    getAll: async (): Promise<ApiResponse<Stack[]>> => {
        const response = await apiClient.get('/stacks');
        return response.data;
    },

    getById: async (id: string): Promise<ApiResponse<Stack>> => {
        const response = await apiClient.get(`/stacks/${id}`);
        return response.data;
    },

    create: async (data: StackCreate): Promise<ApiResponse<Stack>> => {
        const response = await apiClient.post('/stacks', data);
        return response.data;
    },

    update: async (id: string, data: StackUpdate): Promise<ApiResponse<Stack>> => {
        const response = await apiClient.put(`/stacks/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const response = await apiClient.delete(`/stacks/${id}`);
        return response.data;
    },

    saveWorkflow: async (id: string, workflow: WorkflowData): Promise<ApiResponse<Stack>> => {
        const response = await apiClient.post(`/stacks/${id}/workflow`, workflow);
        return response.data;
    },

    build: async (id: string): Promise<ApiResponse<{ valid: boolean; warnings: string[] }>> => {
        const response = await apiClient.post(`/stacks/${id}/build`);
        return response.data;
    },
};
