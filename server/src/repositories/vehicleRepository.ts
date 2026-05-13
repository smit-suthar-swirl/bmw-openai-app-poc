import type { BMWVehicle, SearchParams } from '@bmw-ai/shared';
import { prisma } from '../db/prisma.js';
import { BMW_VEHICLES, getVehicleByName as getMockByName } from '../data/bmwVehicles.js';

function toSharedVehicle(v: {
  id: string;
  name: string;
  type: string;
  price: number;
  range: number | null;
  horsepower: number;
  acceleration: number;
  seating: number;
  description: string;
  imageUrl: string | null;
  features: string[];
  isElectric: boolean;
  tags: string[];
}): BMWVehicle {
  return { ...v, type: v.type as BMWVehicle['type'] };
}

export class VehicleRepository {
  private async dbAvailable(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async findAll(params: SearchParams = {}): Promise<BMWVehicle[]> {
    if (!(await this.dbAvailable())) return this.searchMock(params);

    const where: Record<string, unknown> = {};

    if (params.type) where.type = params.type;
    if (params.isElectric !== undefined) where.isElectric = params.isElectric;
    if (params.minHorsepower) where.horsepower = { gte: params.minHorsepower };
    if (params.minSeating) where.seating = { gte: params.minSeating };

    if (params.maxPrice || params.minPrice) {
      where.price = {
        ...(params.maxPrice ? { lte: params.maxPrice } : {}),
        ...(params.minPrice ? { gte: params.minPrice } : {}),
      };
    }

    if (params.query) {
      const q = params.query.toLowerCase();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { hasSome: [q] } },
        { type: { contains: q, mode: 'insensitive' } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      skip: params.page ? (params.page - 1) * (params.limit ?? 20) : 0,
      take: params.limit ?? 20,
      orderBy: { price: 'asc' },
    });

    return vehicles.map(toSharedVehicle);
  }

  async count(params: SearchParams = {}): Promise<number> {
    if (!(await this.dbAvailable())) return this.searchMock(params).length;

    const where: Record<string, unknown> = {};
    if (params.type) where.type = params.type;
    if (params.isElectric !== undefined) where.isElectric = params.isElectric;
    if (params.maxPrice || params.minPrice) {
      where.price = {
        ...(params.maxPrice ? { lte: params.maxPrice } : {}),
        ...(params.minPrice ? { gte: params.minPrice } : {}),
      };
    }
    if (params.query) {
      where.OR = [
        { name: { contains: params.query, mode: 'insensitive' } },
        { description: { contains: params.query, mode: 'insensitive' } },
      ];
    }

    return prisma.vehicle.count({ where });
  }

  async findById(id: string): Promise<BMWVehicle | null> {
    if (!(await this.dbAvailable())) {
      return BMW_VEHICLES.find((v) => v.id === id) ?? null;
    }
    const v = await prisma.vehicle.findUnique({ where: { id } });
    return v ? toSharedVehicle(v) : null;
  }

  async findByName(name: string): Promise<BMWVehicle | null> {
    if (!(await this.dbAvailable())) {
      return getMockByName(name) ?? null;
    }
    const normalized = name.toLowerCase();
    const v = await prisma.vehicle.findFirst({
      where: {
        OR: [
          { name: { contains: normalized, mode: 'insensitive' } },
          { tags: { hasSome: [normalized] } },
        ],
      },
    });
    return v ? toSharedVehicle(v) : null;
  }

  // Fallback: filter in-memory mock data when DB is unavailable
  private searchMock(params: SearchParams): BMWVehicle[] {
    let results = [...BMW_VEHICLES];
    const q = params.query?.toLowerCase() ?? '';

    if (params.type) results = results.filter((v) => v.type === params.type);
    if (params.isElectric !== undefined) results = results.filter((v) => v.isElectric === params.isElectric);
    if (params.maxPrice) results = results.filter((v) => v.price <= params.maxPrice!);
    if (params.minPrice) results = results.filter((v) => v.price >= params.minPrice!);
    if (params.minHorsepower) results = results.filter((v) => v.horsepower >= params.minHorsepower!);
    if (params.minSeating) results = results.filter((v) => v.seating >= params.minSeating!);

    if (q) {
      results = results.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.tags.some((t) => t.includes(q)) ||
          v.type.toLowerCase().includes(q)
      );
    }

    return results;
  }
}

export const vehicleRepository = new VehicleRepository();
