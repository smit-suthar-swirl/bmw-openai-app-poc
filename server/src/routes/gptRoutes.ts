import { Router } from 'express';
import type { Request, Response } from 'express';
import { vehicleService } from '../services/vehicleService.js';
import { dealerService } from '../services/dealerService.js';
import { bookingService } from '../services/bookingService.js';
import { recommendService } from '../recommendations/recommendService.js';
import type { BMWVehicle, Dealer } from '@bmw-ai/shared';

const router = Router();

// Strip internal DB fields ChatGPT doesn't need
function slimVehicle(v: BMWVehicle & { createdAt?: unknown; updatedAt?: unknown }) {
  return {
    name: v.name,
    type: v.type,
    price: v.price,
    horsepower: v.horsepower,
    acceleration: v.acceleration,
    seating: v.seating,
    isElectric: v.isElectric,
    range: v.range ?? undefined,
    description: v.description.split('.')[0] + '.', // first sentence only
    features: v.features.slice(0, 4),
    tags: v.tags,
  };
}

function slimDealer(d: Dealer) {
  return {
    name: d.name,
    city: d.city,
    address: d.address,
    phone: d.phone,
    openingHours: d.openingHours,
    mapsUrl: d.mapsUrl ?? `https://maps.google.com/?q=${encodeURIComponent(d.name + ' ' + d.address)}`,
  };
}

// POST /api/gpt/search
router.post('/search', async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.search(req.body);
    res.json({
      totalFound: result.totalFound,
      vehicles: result.vehicles.slice(0, 5).map(slimVehicle),
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Search failed' });
  }
});

// POST /api/gpt/compare
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const { modelA, modelB } = req.body as { modelA: string; modelB: string };
    if (!modelA || !modelB) { res.status(400).json({ error: 'modelA and modelB are required' }); return; }
    const result = await vehicleService.compare(modelA, modelB);
    res.json({
      vehicleA: slimVehicle(result.vehicleA),
      vehicleB: slimVehicle(result.vehicleB),
      winner: result.winner,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Comparison failed' });
  }
});

// POST /api/gpt/pricing
router.post('/pricing', async (req: Request, res: Response) => {
  try {
    const { model } = req.body as { model: string };
    if (!model) { res.status(400).json({ error: 'model is required' }); return; }
    const result = await vehicleService.getPricing(model);
    res.json({
      vehicle: slimVehicle(result.vehicle),
      formattedPrice: result.formattedPrice,
      pricePerHorsepower: result.pricePerHorsepower,
      category: result.category,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Pricing lookup failed' });
  }
});

// POST /api/gpt/recommend
router.post('/recommend', async (req: Request, res: Response) => {
  try {
    const result = await recommendService.recommend(req.body);
    res.json({
      topPick: slimVehicle(result.topPick),
      matchScore: result.matchScore,
      reasoning: result.reasoning,
      inventory: result.inventory,
      alternatives: result.alternatives.map(slimVehicle),
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Recommendation failed' });
  }
});

// GET /api/gpt/dealers
router.get('/dealers', async (req: Request, res: Response) => {
  try {
    const city = req.query.city as string | undefined;
    const result = await dealerService.search({ city });
    res.json({
      totalFound: result.totalFound,
      city: result.city,
      dealers: result.dealers.map(slimDealer),
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Dealer search failed' });
  }
});

// POST /api/gpt/book
router.post('/book', async (req: Request, res: Response) => {
  try {
    const confirmation = await bookingService.create(req.body);
    res.json({
      reference: confirmation.reference,
      vehicle: confirmation.vehicle.name,
      dealer: confirmation.dealer.name,
      city: confirmation.dealer.city,
      date: confirmation.preferredDate,
      status: confirmation.status,
      message: `Test drive booked! Reference: ${confirmation.reference}. The team at ${confirmation.dealer.name} will contact you to confirm.`,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Booking failed' });
  }
});

export default router;
