import type { InventoryStatus } from '@bmw-ai/shared';
import { inventoryRepository } from '../repositories/inventoryRepository.js';

class InventoryService {
  getForVehicle(vehicleId: string): Promise<InventoryStatus[]> {
    return inventoryRepository.findByVehicle(vehicleId);
  }

  getForVehicleInCity(vehicleId: string, city: string): Promise<InventoryStatus[]> {
    return inventoryRepository.findByVehicleAndCity(vehicleId, city);
  }
}

export const inventoryService = new InventoryService();
