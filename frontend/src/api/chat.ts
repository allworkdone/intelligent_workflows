import apiClient from './client';
import type { ChatMessage, ApiResponse } from '../types';

export const chatApi = {
    sendMessage: async (stackId: string, message: string): Promise<ApiResponse<{ response: string }>> => {
        const response = await apiClient.post(`/chat/${stackId}/message`, { message });
        return response.data;
    },

    getHistory: async (stackId: string, limit: number = 50): Promise<ApiResponse<ChatMessage[]>> => {
        const response = await apiClient.get(`/chat/${stackId}/history?limit=${limit}`);
        return response.data;
    },

    clearHistory: async (stackId: string): Promise<ApiResponse<{ deleted_count: number }>> => {
        const response = await apiClient.delete(`/chat/${stackId}/history`);
        return response.data;
    },
};
