import apiClient from './client'

export const getBuyers = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/buyers/', { params })

export const getBuyer = (id: number) =>
  apiClient.get(`/api/v1/buyers/${id}/`)

export const createBuyer = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/buyers/', data)

export const updateBuyer = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/buyers/${id}/`, data)

export const patchBuyer = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/buyers/${id}/`, data)

export const deleteBuyer = (id: number) =>
  apiClient.delete(`/api/v1/buyers/${id}/`)

export const getBuyerCommunications = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/buyer-communications/', { params })

export const getBuyerCommunication = (id: number) =>
  apiClient.get(`/api/v1/buyer-communications/${id}/`)

export const createBuyerCommunication = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/buyer-communications/', data)

export const getBuyerPortfolios = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/buyer-portfolios/', { params })

export const getBuyerPortfolio = (id: number) =>
  apiClient.get(`/api/v1/buyer-portfolios/${id}/`)

export const getOrderAmendments = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/order-amendment-histories/', { params })

export const getOrderAmendment = (id: number) =>
  apiClient.get(`/api/v1/order-amendment-histories/${id}/`)

export const getBuyerProfitabilities = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/buyer-profitabilities/', { params })

export const getBuyerProfitability = (id: number) =>
  apiClient.get(`/api/v1/buyer-profitabilities/${id}/`)

export const getBuyerRatings = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/buyer-ratings/', { params })

export const getBuyerRating = (id: number) =>
  apiClient.get(`/api/v1/buyer-ratings/${id}/`)
