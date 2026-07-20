import apiClient from './client'

export const aiChat = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/ai/chat/', data)

export const getAiConversations = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/ai/conversations/', { params })

export const getAiConversation = (id: number) =>
  apiClient.get(`/api/v1/ai/conversations/${id}/`)

export const deleteAiConversation = (id: number) =>
  apiClient.delete(`/api/v1/ai/conversations/${id}/`)
