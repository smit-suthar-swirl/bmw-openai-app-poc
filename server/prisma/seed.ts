import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const vehicles = [
  {
    name: 'BMW M4 Competition',
    type: 'Coupe',
    price: 84900,
    range: null,
    horsepower: 503,
    acceleration: 3.8,
    seating: 4,
    description:
      'The BMW M4 Competition is the ultimate expression of BMW M performance. With a twin-turbocharged inline-6 producing 503 hp, it delivers supercar-level performance wrapped in a stunning coupe body.',
    imageUrl: null,
    features: [
      'M TwinPower Turbo 3.0L inline-6',
      'M Steptronic 8-speed automatic',
      'M Sport differential',
      'Adaptive M suspension',
      'M Drive Professional',
      'Harman Kardon surround sound',
      'Head-up display',
    ],
    isElectric: false,
    tags: ['performance', 'sports', 'coupe', 'track'],
  },
  {
    name: 'BMW i7 xDrive60',
    type: 'EV',
    price: 119300,
    range: 625,
    horsepower: 536,
    acceleration: 4.5,
    seating: 5,
    description:
      'The BMW i7 xDrive60 redefines electric luxury. The flagship BMW sedan now comes fully electric, offering 625 km of range, a theatre-inspired rear cabin, and unmatched digital sophistication.',
    imageUrl: null,
    features: [
      '101.7 kWh lithium-ion battery',
      'Dual electric motors (AWD)',
      'Executive Lounge rear seating',
      '31.3" BMW Theatre Screen (rear)',
      'Sky Lounge panoramic roof',
      'B&W Diamond surround sound',
      'Level 2 automated driving',
      'Massaging seats (4-zone)',
    ],
    isElectric: true,
    tags: ['electric', 'luxury', 'sedan', 'ev', 'flagship', 'long-range'],
  },
  {
    name: 'BMW X5 xDrive40i',
    type: 'SUV',
    price: 66900,
    range: null,
    horsepower: 335,
    acceleration: 5.3,
    seating: 7,
    description:
      'The BMW X5 is the SAV that started it all. Combining athletic performance with luxurious versatility, the X5 remains the benchmark for premium mid-size SUVs with available 3rd-row seating.',
    imageUrl: null,
    features: [
      'TwinPower Turbo 3.0L inline-6',
      'xDrive intelligent AWD',
      'Adaptive air suspension',
      'Optional 3rd-row seating',
      'Panoramic Sky Lounge roof',
      'BMW Live Cockpit Professional',
      'Harman Kardon sound',
      'Gesture control',
    ],
    isElectric: false,
    tags: ['suv', 'family', 'awd', 'luxury', 'versatile'],
  },
  {
    name: 'BMW XM',
    type: 'SUV',
    price: 159000,
    range: 80,
    horsepower: 644,
    acceleration: 4.1,
    seating: 5,
    description:
      'The BMW XM is the most powerful production BMW M vehicle ever built. A plug-in hybrid SUV with 644 hp, blurring the line between luxury SUV and supercar. Bold, unapologetic design.',
    imageUrl: null,
    features: [
      'M Hybrid V8 twin-turbo 4.4L',
      '25.7 kWh high-voltage battery',
      '80 km electric-only range',
      'M Sport Pro exhaust',
      'Iconic Glow exterior lighting',
      'Sofina Nappa leather',
      'Bowers & Wilkins Diamond sound',
    ],
    isElectric: false,
    tags: ['suv', 'hybrid', 'phev', 'performance', 'luxury', 'flagship'],
  },
  {
    name: 'BMW i4 M50',
    type: 'EV',
    price: 75800,
    range: 520,
    horsepower: 536,
    acceleration: 3.9,
    seating: 5,
    description:
      'The BMW i4 M50 is the electric gran coupe that proves EVs can be thrilling. With 536 hp from dual motors, 520 km range, and M Sport tuning.',
    imageUrl: null,
    features: [
      '83.9 kWh lithium-ion battery',
      'Dual electric motors (M xDrive)',
      'M Sport suspension',
      'M Sport brakes',
      'BMW Curved Display (14.9")',
      'Harman Kardon sound',
      '205 kW DC fast charging',
    ],
    isElectric: true,
    tags: ['electric', 'performance', 'sedan', 'ev', 'sports', 'm-sport'],
  },
  {
    name: 'BMW X3 xDrive30i',
    type: 'SUV',
    price: 48200,
    range: null,
    horsepower: 248,
    acceleration: 6.2,
    seating: 5,
    description:
      'The BMW X3 is the perfect entry into BMW SAV ownership — premium driving experience, practical interior, and BMW\'s renowned driving dynamics in a compact package.',
    imageUrl: null,
    features: [
      'TwinPower Turbo 2.0L 4-cylinder',
      'xDrive intelligent AWD',
      'Sport automatic transmission',
      'Panoramic moonroof',
      'BMW Live Cockpit Plus',
      'Wireless Apple CarPlay & Android Auto',
    ],
    isElectric: false,
    tags: ['suv', 'compact', 'practical', 'awd', 'entry-luxury'],
  },
  {
    name: 'BMW 5 Series 540i',
    type: 'Sedan',
    price: 62500,
    range: null,
    horsepower: 375,
    acceleration: 4.6,
    seating: 5,
    description:
      'The BMW 5 Series continues its legacy as the definitive executive sedan. Refined turbocharged inline-6, cutting-edge technology, and elegant design set the standard in its class.',
    imageUrl: null,
    features: [
      'TwinPower Turbo 3.0L inline-6',
      'xDrive all-wheel drive',
      '8-speed Sport automatic',
      'Integral active steering',
      'BMW Curved Display',
      'Augmented Reality Navigation',
      'Harman Kardon sound',
    ],
    isElectric: false,
    tags: ['sedan', 'executive', 'luxury', 'awd', 'business'],
  },
];

const dealers = [
  {
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

async function main() {
  console.log('🌱 Seeding BMW AI database...\n');

  // Clear existing data in correct order (respects FK constraints)
  await prisma.testDriveBooking.deleteMany();
  // @ts-ignore — Inventory model added in Phase 3
  await prisma.inventory.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.dealer.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  console.log('  ✓ Cleared existing data');

  // Seed vehicles
  const createdVehicles = await prisma.vehicle.createMany({ data: vehicles });
  console.log(`  ✓ Seeded ${createdVehicles.count} vehicles`);

  // Seed dealers
  const createdDealers = await prisma.dealer.createMany({ data: dealers });
  console.log(`  ✓ Seeded ${createdDealers.count} dealers`);

  // Seed inventory (per UAE city)
  const allVehicles = await prisma.vehicle.findMany({ select: { id: true, name: true } });
  const inventoryData: Array<{ vehicleId: string; city: string; quantity: number; inStock: boolean }> = [];

  const stockLevels: Record<string, { Dubai: number; 'Abu Dhabi': number; Sharjah: number }> = {
    'BMW M4 Competition':  { Dubai: 2, 'Abu Dhabi': 0, Sharjah: 1 },
    'BMW i7 xDrive60':    { Dubai: 1, 'Abu Dhabi': 1, Sharjah: 0 },
    'BMW X5 xDrive40i':   { Dubai: 5, 'Abu Dhabi': 3, Sharjah: 2 },
    'BMW XM':             { Dubai: 1, 'Abu Dhabi': 0, Sharjah: 0 },
    'BMW i4 M50':         { Dubai: 4, 'Abu Dhabi': 2, Sharjah: 1 },
    'BMW X3 xDrive30i':   { Dubai: 6, 'Abu Dhabi': 4, Sharjah: 3 },
    'BMW 5 Series 540i':  { Dubai: 3, 'Abu Dhabi': 2, Sharjah: 0 },
  };

  for (const vehicle of allVehicles) {
    const levels = stockLevels[vehicle.name] ?? { Dubai: 2, 'Abu Dhabi': 1, Sharjah: 0 };
    for (const city of ['Dubai', 'Abu Dhabi', 'Sharjah'] as const) {
      inventoryData.push({
        vehicleId: vehicle.id,
        city,
        quantity: levels[city],
        inStock: levels[city] > 0,
      });
    }
  }

  // @ts-ignore — Inventory model added in Phase 3
  const createdInventory = await prisma.inventory.createMany({ data: inventoryData });
  console.log(`  ✓ Seeded ${createdInventory.count} inventory records`);

  console.log('\n✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
