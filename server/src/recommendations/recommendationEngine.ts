import type { BMWVehicle, RecommendParams } from '@bmw-ai/shared';

interface ScoredVehicle {
  vehicle: BMWVehicle;
  score: number;
  reasons: string[];
}

export function rankVehicles(vehicles: BMWVehicle[], params: RecommendParams): ScoredVehicle[] {
  return vehicles
    .map((v) => scoreVehicle(v, params))
    .sort((a, b) => b.score - a.score);
}

function scoreVehicle(vehicle: BMWVehicle, params: RecommendParams): ScoredVehicle {
  let score = 50;
  const reasons: string[] = [];

  // Budget fit (up to 30 pts)
  if (params.budget) {
    if (vehicle.price > params.budget) {
      score -= 40;
    } else {
      const ratio = vehicle.price / params.budget;
      if (ratio >= 0.85) {
        score += 30;
        reasons.push(`Excellent budget fit at $${vehicle.price.toLocaleString()}`);
      } else if (ratio >= 0.65) {
        score += 18;
        reasons.push('Good value within budget');
      } else {
        score += 8;
        reasons.push('Well under budget');
      }
    }
  }

  // Lifestyle scoring (up to 30 pts)
  switch (params.lifestyle) {
    case 'family':
      if (vehicle.seating >= 7) {
        score += 30;
        reasons.push('7-seat capacity for the whole family');
      } else if (vehicle.seating >= 5) {
        score += 15;
        reasons.push('Comfortable 5-seat family interior');
      }
      if (vehicle.type === 'SUV') {
        score += 10;
        reasons.push('Versatile SUV for family adventures');
      }
      break;

    case 'performance':
      if (vehicle.horsepower >= 500) {
        score += 30;
        reasons.push(`${vehicle.horsepower}hp — supercar territory`);
      } else if (vehicle.horsepower >= 400) {
        score += 20;
        reasons.push(`${vehicle.horsepower}hp high-performance engine`);
      }
      if (vehicle.acceleration <= 4.0) {
        score += 10;
        reasons.push(`Blistering 0-100 in ${vehicle.acceleration}s`);
      }
      break;

    case 'eco':
      if (vehicle.isElectric) {
        score += 30;
        reasons.push('Zero-emission full electric');
      } else if (vehicle.tags.includes('phev') || vehicle.tags.includes('hybrid')) {
        score += 18;
        reasons.push('Plug-in hybrid for reduced emissions');
      }
      break;

    case 'business':
      if (vehicle.type === 'Sedan') {
        score += 20;
        reasons.push('Executive sedan — boardroom ready');
      }
      if (vehicle.tags.includes('luxury') || vehicle.tags.includes('executive')) {
        score += 10;
        reasons.push('Premium business-class luxury');
      }
      if (vehicle.tags.includes('flagship')) {
        score += 5;
        reasons.push('Flagship prestige');
      }
      break;

    case 'adventure':
      if (vehicle.type === 'SUV') {
        score += 25;
        reasons.push('SUV built for any terrain');
      }
      if (vehicle.tags.includes('awd')) {
        score += 10;
        reasons.push('Intelligent all-wheel drive');
      }
      break;
  }

  // EV preference bonus (up to 15 pts)
  if (params.preferElectric === true && vehicle.isElectric) {
    score += 15;
    reasons.push('Matches your EV preference');
  }
  if (params.preferElectric === false && vehicle.isElectric) {
    score -= 5;
  }

  // Commute range check (up to 15 pts)
  if (params.dailyCommute && vehicle.isElectric && vehicle.range) {
    const neededRange = params.dailyCommute * 3;
    if (vehicle.range >= neededRange) {
      score += 15;
      reasons.push(`${vehicle.range}km range covers your ${params.dailyCommute}km daily commute`);
    } else {
      score -= 8;
      reasons.push('Range may require more frequent charging');
    }
  }

  // Seating requirement
  if (params.passengers && vehicle.seating < params.passengers) {
    score -= 25;
  }

  return {
    vehicle,
    score: Math.max(0, Math.min(100, score)),
    reasons: reasons.slice(0, 4),
  };
}
