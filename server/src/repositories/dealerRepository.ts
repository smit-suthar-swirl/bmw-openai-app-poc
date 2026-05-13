import type { Dealer } from '@bmw-ai/shared';
import { prisma } from '../db/prisma.js';

// Fallback mock dealers used when DB is unavailable
const MOCK_DEALERS: Dealer[] = [
  {
    id: 'dealer-abudhabi-1',
    name: 'BMW Abu Dhabi Motors',
    city: 'Abu Dhabi',
    address: 'Hamdan Street, Al Hosn, Abu Dhabi, UAE',
    phone: '+971-2-123-4567',
    email: 'info@bmwabudhabi.ae',
    openingHours: 'Mon-Sat: 9AM-9PM | Sun: 10AM-7PM',
    lat: 24.4539,
    lng: 54.3773,
  },
  {
    id: 'dealer-dubai-1',
    name: 'BMW AGMC — Sheikh Zayed Road',
    city: 'Dubai',
    address: 'Sheikh Zayed Road, Al Quoz Industrial Area, Dubai, UAE',
    phone: '+971-4-234-5678',
    email: 'szr@bmwdubai.ae',
    openingHours: 'Mon-Sat: 9AM-9PM | Sun: 10AM-7PM',
    lat: 25.1503,
    lng: 55.2228,
  },
  {
    id: 'dealer-dubai-2',
    name: 'BMW AGMC — Festival City',
    city: 'Dubai',
    address: 'Al Rebat Street, Dubai Festival City, Dubai, UAE',
    phone: '+971-4-345-6789',
    email: 'festival@bmwdubai.ae',
    openingHours: 'Daily: 10AM-10PM',
    lat: 25.2271,
    lng: 55.3477,
  },
  {
    id: 'dealer-sharjah-1',
    name: 'BMW Sharjah Motors',
    city: 'Sharjah',
    address: 'Al Wahda Street, Al Nahda, Sharjah, UAE',
    phone: '+971-6-456-7890',
    email: 'info@bmwsharjah.ae',
    openingHours: 'Mon-Sat: 9AM-8PM | Sun: 10AM-6PM',
    lat: 25.3462,
    lng: 55.4209,
  },
];

function addMapsUrl(dealer: Dealer): Dealer {
  return {
    ...dealer,
    mapsUrl: `https://www.google.com/maps?q=${dealer.lat},${dealer.lng}`,
  };
}

export class DealerRepository {
  private async dbAvailable(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async findAll(): Promise<Dealer[]> {
    if (!(await this.dbAvailable())) return MOCK_DEALERS.map(addMapsUrl);

    const dealers = await prisma.dealer.findMany({ orderBy: { city: 'asc' } });
    return dealers.map(addMapsUrl);
  }

  async findByCity(city: string): Promise<Dealer[]> {
    if (!(await this.dbAvailable())) {
      return MOCK_DEALERS.filter((d) =>
        d.city.toLowerCase().includes(city.toLowerCase())
      ).map(addMapsUrl);
    }

    const dealers = await prisma.dealer.findMany({
      where: { city: { contains: city, mode: 'insensitive' } },
      orderBy: { name: 'asc' },
    });
    return dealers.map(addMapsUrl);
  }

  async findById(id: string): Promise<Dealer | null> {
    if (!(await this.dbAvailable())) {
      const d = MOCK_DEALERS.find((d) => d.id === id);
      return d ? addMapsUrl(d) : null;
    }

    const dealer = await prisma.dealer.findUnique({ where: { id } });
    return dealer ? addMapsUrl(dealer) : null;
  }

  async search(query: string): Promise<Dealer[]> {
    if (!(await this.dbAvailable())) {
      const q = query.toLowerCase();
      return MOCK_DEALERS.filter(
        (d) =>
          d.city.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q) ||
          d.address.toLowerCase().includes(q)
      ).map(addMapsUrl);
    }

    const dealers = await prisma.dealer.findMany({
      where: {
        OR: [
          { city: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
    return dealers.map(addMapsUrl);
  }
}

export const dealerRepository = new DealerRepository();
