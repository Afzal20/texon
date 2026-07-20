import apiClient from './client'

// ─── Accessories ─────────────────────────────────────────────────────────────

export const getAccessories = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/accessories/', { params })

export const getAccessory = (id: number) =>
  apiClient.get(`/api/v1/accessories/${id}/`)

export const createAccessory = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/accessories/', data)

export const updateAccessory = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/accessories/${id}/`, data)

export const patchAccessory = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/accessories/${id}/`, data)

export const deleteAccessory = (id: number) =>
  apiClient.delete(`/api/v1/accessories/${id}/`)

// ─── Fabrics ─────────────────────────────────────────────────────────────────

export const getFabrics = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/fabrics/', { params })

export const getFabric = (id: number) =>
  apiClient.get(`/api/v1/fabrics/${id}/`)

export const createFabric = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/fabrics/', data)

export const updateFabric = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/fabrics/${id}/`, data)

export const patchFabric = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/fabrics/${id}/`, data)

export const deleteFabric = (id: number) =>
  apiClient.delete(`/api/v1/fabrics/${id}/`)

// ─── Fabric Inspections ──────────────────────────────────────────────────────

export const getFabricInspections = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/fabric-inspections/', { params })

export const getFabricInspection = (id: number) =>
  apiClient.get(`/api/v1/fabric-inspections/${id}/`)

export const createFabricInspection = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/fabric-inspections/', data)

export const updateFabricInspection = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/fabric-inspections/${id}/`, data)

export const patchFabricInspection = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/fabric-inspections/${id}/`, data)

export const deleteFabricInspection = (id: number) =>
  apiClient.delete(`/api/v1/fabric-inspections/${id}/`)

// ─── Floor Requisitions ──────────────────────────────────────────────────────

export const getFloorRequisitions = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/floor-requisitions/', { params })

export const getFloorRequisition = (id: number) =>
  apiClient.get(`/api/v1/floor-requisitions/${id}/`)

export const createFloorRequisition = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/floor-requisitions/', data)

export const updateFloorRequisition = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/floor-requisitions/${id}/`, data)

export const patchFloorRequisition = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/floor-requisitions/${id}/`, data)

export const deleteFloorRequisition = (id: number) =>
  apiClient.delete(`/api/v1/floor-requisitions/${id}/`)

// ─── Physical Inventories ────────────────────────────────────────────────────

export const getPhysicalInventories = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/physical-inventories/', { params })

export const getPhysicalInventory = (id: number) =>
  apiClient.get(`/api/v1/physical-inventories/${id}/`)

export const createPhysicalInventory = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/physical-inventories/', data)

export const updatePhysicalInventory = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/physical-inventories/${id}/`, data)

export const patchPhysicalInventory = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/physical-inventories/${id}/`, data)

export const deletePhysicalInventory = (id: number) =>
  apiClient.delete(`/api/v1/physical-inventories/${id}/`)

// ─── RM Bookings ─────────────────────────────────────────────────────────────

export const getRmBookings = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/rm-bookings/', { params })

export const getRmBooking = (id: number) =>
  apiClient.get(`/api/v1/rm-bookings/${id}/`)

export const createRmBooking = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/rm-bookings/', data)

export const updateRmBooking = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/rm-bookings/${id}/`, data)

export const patchRmBooking = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/rm-bookings/${id}/`, data)

export const deleteRmBooking = (id: number) =>
  apiClient.delete(`/api/v1/rm-bookings/${id}/`)

// ─── RM Requisitions ─────────────────────────────────────────────────────────

export const getRmRequisitions = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/rm-requisitions/', { params })

export const getRmRequisition = (id: number) =>
  apiClient.get(`/api/v1/rm-requisitions/${id}/`)

export const createRmRequisition = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/rm-requisitions/', data)

export const updateRmRequisition = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/rm-requisitions/${id}/`, data)

export const patchRmRequisition = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/rm-requisitions/${id}/`, data)

export const deleteRmRequisition = (id: number) =>
  apiClient.delete(`/api/v1/rm-requisitions/${id}/`)

// ─── Stock Movements ─────────────────────────────────────────────────────────

export const getStockMovements = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/stock-movements/', { params })

export const getStockMovement = (id: number) =>
  apiClient.get(`/api/v1/stock-movements/${id}/`)

export const createStockMovement = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/stock-movements/', data)

export const updateStockMovement = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/stock-movements/${id}/`, data)

export const patchStockMovement = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/stock-movements/${id}/`, data)

export const deleteStockMovement = (id: number) =>
  apiClient.delete(`/api/v1/stock-movements/${id}/`)

// ─── Trims ───────────────────────────────────────────────────────────────────

export const getTrims = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/trims/', { params })

export const getTrim = (id: number) =>
  apiClient.get(`/api/v1/trims/${id}/`)

export const createTrim = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/trims/', data)

export const updateTrim = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/trims/${id}/`, data)

export const patchTrim = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/trims/${id}/`, data)

export const deleteTrim = (id: number) =>
  apiClient.delete(`/api/v1/trims/${id}/`)

// ─── Warehouses ──────────────────────────────────────────────────────────────

export const getWarehouses = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/warehouses/', { params })

export const getWarehouse = (id: number) =>
  apiClient.get(`/api/v1/warehouses/${id}/`)

export const createWarehouse = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/warehouses/', data)

export const updateWarehouse = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/warehouses/${id}/`, data)

export const patchWarehouse = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/warehouses/${id}/`, data)

export const deleteWarehouse = (id: number) =>
  apiClient.delete(`/api/v1/warehouses/${id}/`)
