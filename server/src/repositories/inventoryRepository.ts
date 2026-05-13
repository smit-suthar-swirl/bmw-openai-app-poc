import type { InventoryStatus } from '@bmw-ai/shared';
import { prisma } from '../db/prisma.js';

// Mock fallback — used when DB unavailable
const MOCK_INVENTORY: Record<string, InventoryStatus[]> = {
  'bmw-m4-competition':  [{ city: 'Dubai', inStock: true, quantity: 2 }, { city: 'Abu Dhabi', inStock: false, quantity: 0 }, { city: 'Sharjah', inStock: true, quantity: 1 }],
  'bmw-i7-xdrive60':    [{ city: 'Dubai', inStock: true, quantity: 1 }, { city: 'Abu Dhabi', inStock: true, quantity: 1 }, { city: 'Sharjah', inStock: false, quantity: 0 }],
  'bmw-x5-xdrive40i':   [{ city: 'Dubai', inStock: true, quantity: 5 }, { city: 'Abu Dhabi', inStock: true, quantity: 3 }, { city: 'Sharjah', inStock: true, quantity: 2 }],
  'bmw-xm':             [{ city: 'Dubai', inStock: true, quantity: 1 }, { city: 'Abu Dhabi', inStock: false, quantity: 0 }, { city: 'Sharjah', inStock: false, quantity: 0 }],
  'bmw-i4-m50':         [{ city: 'Dubai', inStock: true, quantity: 4 }, { city: 'Abu Dhabi', inStock: true, quantity: 2 }, { city: 'Sharjah', inStock: true, quantity: 1 }],
  'bmw-x3-xdrive30i':   [{ city: 'Dubai', inStock: true, quantity: 6 }, { city: 'Abu Dhabi', inStock: true, quantity: 4 }, { city: 'Sharjah', inStock: true, quantity: 3 }],
  'bmw-5-series-540i':  [{ city: 'Dubai', inStock: true, quantity: 3 }, { city: 'Abu Dhabi', inStock: true, quantity: 2 }, { city: 'Sharjah', inStock: false, quantity: 0 }],
};

class InventoryRepository {
  private async dbAvailable(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async findByVehicle(vehicleId: string): Promise<InventoryStatus[]> {
    if (!(await this.dbAvailable())) return this.mockByVehicle(vehicleId);
    try {
      const rows = await prisma.$queryRaw<{ city: string; inStock: boolean; quantity: number }[]>`
        SELECT city, "inStock", quantity FROM inventory WHERE "vehicleId" = ${vehicleId} ORDER BY city
      `;
      return rows.map((r) => ({ city: r.city, inStock: r.inStock, quantity: r.quantity }));
    } catch {
      return this.mockByVehicle(vehicleId);
    }
  }

  async findByVehicleAndCity(vehicleId: string, city: string): Promise<InventoryStatus[]> {
    if (!(await this.dbAvailable())) return this.mockByVehicle(vehicleId).filter((i) => i.city === city);
    try {
      const rows = await prisma.$queryRaw<{ city: string; inStock: boolean; quantity: number }[]>`
        SELECT city, "inStock", quantity FROM inventory WHERE "vehicleId" = ${vehicleId} AND city = ${city}
      `;
      return rows.map((r) => ({ city: r.city, inStock: r.inStock, quantity: r.quantity }));
    } catch {
      return this.mockByVehicle(vehicleId).filter((i) => i.city === city);
    }
  }

  private mockByVehicle(vehicleId: string): InventoryStatus[] {
    const direct = MOCK_INVENTORY[vehicleId];
    if (direct) return direct;
    const key = Object.keys(MOCK_INVENTORY).find((k) => vehicleId.includes(k) || k.includes(vehicleId));
    return key ? MOCK_INVENTORY[key] : [
      { city: 'Dubai', inStock: true, quantity: 2 },
      { city: 'Abu Dhabi', inStock: true, quantity: 1 },
      { city: 'Sharjah', inStock: false, quantity: 0 },
    ];
  }
}

export const inventoryRepository = new InventoryRepository();
