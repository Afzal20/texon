import apiClient from './client'

// ─── Buyers ──────────────────────────────────────────────────────────────────

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

// ─── Buyer Communications ────────────────────────────────────────────────────

export const getBuyerCommunications = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/buyer-communications/', { params })

export const getBuyerCommunication = (id: number) =>
  apiClient.get(`/api/v1/buyer-communications/${id}/`)

export const createBuyerCommunication = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/buyer-communications/', data)

export const updateBuyerCommunication = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/buyer-communications/${id}/`, data)

export const patchBuyerCommunication = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/buyer-communications/${id}/`, data)

export const deleteBuyerCommunication = (id: number) =>
  apiClient.delete(`/api/v1/buyer-communications/${id}/`)

// ─── Buyer Enquiries ─────────────────────────────────────────────────────────

export const getBuyerEnquiries = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/buyer-enquiries/', { params })

export const getBuyerEnquiry = (id: number) =>
  apiClient.get(`/api/v1/buyer-enquiries/${id}/`)

export const createBuyerEnquiry = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/buyer-enquiries/', data)

export const updateBuyerEnquiry = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/buyer-enquiries/${id}/`, data)

export const patchBuyerEnquiry = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/buyer-enquiries/${id}/`, data)

export const deleteBuyerEnquiry = (id: number) =>
  apiClient.delete(`/api/v1/buyer-enquiries/${id}/`)

// ─── Buyer Portfolios ────────────────────────────────────────────────────────

export const getBuyerPortfolios = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/buyer-portfolios/', { params })

export const getBuyerPortfolio = (id: number) =>
  apiClient.get(`/api/v1/buyer-portfolios/${id}/`)

// ─── Buyer Profitabilities ───────────────────────────────────────────────────

export const getBuyerProfitabilities = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/buyer-profitabilities/', { params })

export const getBuyerProfitability = (id: number) =>
  apiClient.get(`/api/v1/buyer-profitabilities/${id}/`)

// ─── Buyer Ratings ───────────────────────────────────────────────────────────

export const getBuyerRatings = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/buyer-ratings/', { params })

export const getBuyerRating = (id: number) =>
  apiClient.get(`/api/v1/buyer-ratings/${id}/`)

// ─── Styles ──────────────────────────────────────────────────────────────────

export const getStyles = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/styles/', { params })

export const getStyle = (id: number) =>
  apiClient.get(`/api/v1/styles/${id}/`)

export const createStyle = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/styles/', data)

export const updateStyle = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/styles/${id}/`, data)

export const patchStyle = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/styles/${id}/`, data)

export const deleteStyle = (id: number) =>
  apiClient.delete(`/api/v1/styles/${id}/`)

// ─── Style Analyses ──────────────────────────────────────────────────────────

export const getStyleAnalyses = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/style-analyses/', { params })

export const getStyleAnalysis = (id: number) =>
  apiClient.get(`/api/v1/style-analyses/${id}/`)

export const createStyleAnalysis = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/style-analyses/', data)

export const updateStyleAnalysis = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/style-analyses/${id}/`, data)

export const patchStyleAnalysis = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/style-analyses/${id}/`, data)

export const deleteStyleAnalysis = (id: number) =>
  apiClient.delete(`/api/v1/style-analyses/${id}/`)

// ─── Shade Approvals ─────────────────────────────────────────────────────────

export const getShadeApprovals = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/shade-approvals/', { params })

export const getShadeApproval = (id: number) =>
  apiClient.get(`/api/v1/shade-approvals/${id}/`)

export const createShadeApproval = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/shade-approvals/', data)

export const updateShadeApproval = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/shade-approvals/${id}/`, data)

export const patchShadeApproval = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/shade-approvals/${id}/`, data)

export const deleteShadeApproval = (id: number) =>
  apiClient.delete(`/api/v1/shade-approvals/${id}/`)
