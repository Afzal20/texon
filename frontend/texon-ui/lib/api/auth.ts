import apiClient from './client'

// Endpoints match the deployed Django backend (dj-rest-auth + SimpleJWT).
// See https://texon-backend.vercel.app/api/schema/

export const login = (data: { email: string; password: string }) =>
  apiClient.post('/api/v1/auth/login/', data)

export const register = (data: {
  email: string
  password: string
  first_name?: string
  last_name?: string
}) => {
  // allauth registration expects username + password1/password2
  const body: Record<string, unknown> = {
    email: data.email,
    username: data.email,
    password1: data.password,
    password2: data.password,
  }
  if (data.first_name) body.first_name = data.first_name
  if (data.last_name) body.last_name = data.last_name
  return apiClient.post('/api/v1/auth/registration/', body)
}

export const logout = (refresh?: string) =>
  apiClient.post('/api/v1/auth/logout/', refresh ? { refresh } : {})

export const refreshToken = (refresh: string) =>
  apiClient.post('/api/v1/auth/token/refresh/', { refresh })

export const getMe = () => apiClient.get('/api/v1/auth/user/')

export const forgotPassword = (data: { email: string }) =>
  apiClient.post('/api/v1/auth/password/reset/', data)

export const resetPassword = (data: {
  uid: string
  token: string
  newPassword: string
}) =>
  apiClient.post('/api/v1/auth/password/reset/confirm/', {
    uid: data.uid,
    token: data.token,
    new_password1: data.newPassword,
    new_password2: data.newPassword,
  })

export const updatePassword = (data: { newPassword: string; currentPassword?: string }) => {
  const body: Record<string, unknown> = {
    new_password1: data.newPassword,
    new_password2: data.newPassword,
  }
  if (data.currentPassword) body.old_password = data.currentPassword
  return apiClient.post('/api/v1/auth/password/change/', body)
}

export const verifyEmail = (key: string) =>
  apiClient.post('/api/v1/auth/registration/verify-email/', { key })

export const resendVerificationEmail = (email: string) =>
  apiClient.post('/api/v1/auth/registration/resend-email/', { email })

/**
 * POST /api/v1/auth/token/verify/
 * Returns 200 when the access token is valid, 401 otherwise.
 */
export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    await apiClient.post('/api/v1/auth/token/verify/', { token })
    return true
  } catch {
    return false
  }
}

// ── Device / session management ─────────────────────────────────────────────

/** One logged-in device/session as tracked by the backend refresh tokens. */
export interface AuthDevice {
  id: number
  device_name?: string
  user_agent?: string
  ip_address?: string
  last_activity?: string
  created_at?: string
}

export const listDevices = () => apiClient.get<AuthDevice[]>('/api/v1/auth/devices/')

export const getDevice = (tokenId: number | string) =>
  apiClient.get<AuthDevice>(`/api/v1/auth/devices/${tokenId}/`)

export const revokeDevice = (tokenId: number | string) =>
  apiClient.delete(`/api/v1/auth/devices/${tokenId}/`)

// ── RBAC bulk role assignment ───────────────────────────────────────────────

export interface BulkRoleAssignment {
  user: number
  role: number
}

export const bulkAssignUserRoles = (assignments: BulkRoleAssignment[]) =>
  apiClient.post('/api/v1/user-roles/bulk-assign/', assignments)

/**
 * GET /api/v1/my-permissions/
 *
 * Singleton endpoint (no list/{id} CRUD) returning the current user's roles
 * and effective permission codenames. Any authenticated user may call it for
 * themselves — use it to gate menus/UI per role.
 */
export interface MyPermissions {
  roles?: string[]
  permissions?: string[]
}

export const getMyPermissions = async (): Promise<MyPermissions> => {
  const res = await apiClient.get('/api/v1/my-permissions/')
  return (res.data ?? {}) as MyPermissions
}
