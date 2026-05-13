import type {
  SearchParams,
  SearchResult,
  ComparisonResult,
  PricingResult,
  RecommendParams,
  RecommendationResult,
  ApiResponse,
  BMWVehicle,
  Dealer,
  DealerSearchResult,
  BookingRequest,
  BookingConfirmation,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
} from '@bmw-ai/shared';

const BASE_URL = '/api';

// ─── HTTP helpers ────────────────────────────────────────────────────────────

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('bmw_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function post<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(body),
  });
  const data: ApiResponse<T> = await res.json();
  if (!data.success || !res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data.data as T;
}

async function get<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: getAuthHeader(),
  });
  const data: ApiResponse<T> = await res.json();
  if (!data.success || !res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data.data as T;
}

// ─── API methods ─────────────────────────────────────────────────────────────

export const bmwApi = {
  // Vehicles
  getAllVehicles: () => get<BMWVehicle[]>('/vehicles'),
  search: (params: SearchParams) => post<SearchResult>('/vehicles/search', params),
  compare: (modelA: string, modelB: string) =>
    post<ComparisonResult>('/vehicles/compare', { modelA, modelB }),
  pricing: (model: string) => post<PricingResult>('/vehicles/pricing', { model }),

  // Recommendations
  recommend: (params: RecommendParams) => post<RecommendationResult>('/vehicles/recommend', params),

  // Dealers
  getDealers: (city?: string) =>
    get<DealerSearchResult>(`/dealers${city ? `?city=${encodeURIComponent(city)}` : ''}`),

  // Bookings
  bookTestDrive: (req: BookingRequest) => post<BookingConfirmation>('/test-drive', req),

  // Auth
  register: (req: RegisterRequest) => post<AuthResponse>('/auth/register', req),
  login: (req: LoginRequest) => post<AuthResponse>('/auth/login', req),
  me: () => get<{ id: string; email: string; role: string }>('/auth/me'),
};

// ─── Intent parser ───────────────────────────────────────────────────────────

export type ChatIntent =
  | { type: 'search'; params: SearchParams }
  | { type: 'compare'; modelA: string; modelB: string }
  | { type: 'pricing'; model: string }
  | { type: 'dealers'; city?: string }
  | { type: 'recommend'; params: RecommendParams }
  | { type: 'booking'; prefillVehicle?: string; prefillCity?: string }
  | { type: 'list' }
  | { type: 'unknown' };

export function parseIntent(message: string): ChatIntent {
  const lower = message.toLowerCase().trim();

  // Recommend intent
  if (
    lower.includes('recommend') ||
    lower.includes('suggest') ||
    lower.includes('which bmw') ||
    lower.includes('what bmw') ||
    lower.includes('help me choose') ||
    lower.includes('help me pick') ||
    lower.includes('best bmw for') ||
    (lower.includes('best') && (lower.includes('family') || lower.includes('business') || lower.includes('commute')))
  ) {
    const params: RecommendParams = {};
    const underMatch = lower.match(/under\s+\$?([\d,.]+k?)/i);
    if (underMatch) {
      const raw = underMatch[1].replace(',', '').replace('k', '000');
      params.budget = parseInt(raw, 10);
    }
    if (lower.includes('family') || lower.includes('kids')) params.lifestyle = 'family';
    else if (lower.includes('performance') || lower.includes('sport') || lower.includes('fast')) params.lifestyle = 'performance';
    else if (lower.includes('eco') || lower.includes('green') || lower.includes('electric')) { params.lifestyle = 'eco'; params.preferElectric = true; }
    else if (lower.includes('business') || lower.includes('executive') || lower.includes('work')) params.lifestyle = 'business';
    else if (lower.includes('adventure') || lower.includes('offroad') || lower.includes('off-road')) params.lifestyle = 'adventure';
    if (lower.includes('electric') || lower.match(/\bev\b/)) params.preferElectric = true;
    const cityMap: Record<string, 'Dubai' | 'Abu Dhabi' | 'Sharjah'> = { dubai: 'Dubai', 'abu dhabi': 'Abu Dhabi', sharjah: 'Sharjah' };
    const foundCity = Object.entries(cityMap).find(([k]) => lower.includes(k));
    if (foundCity) params.city = foundCity[1];
    return { type: 'recommend', params };
  }

  // Dealer intent
  if (
    lower.includes('showroom') ||
    lower.includes('dealer') ||
    lower.includes('dealership') ||
    lower.includes('nearest bmw') ||
    lower.includes('find bmw')
  ) {
    const cities: Record<string, string> = {
      dubai: 'Dubai',
      'abu dhabi': 'Abu Dhabi',
      abudhabi: 'Abu Dhabi',
      sharjah: 'Sharjah',
    };
    const foundCity = Object.entries(cities).find(([key]) => lower.includes(key));
    return { type: 'dealers', city: foundCity?.[1] };
  }

  // Booking intent
  if (
    lower.includes('book') ||
    lower.includes('test drive') ||
    lower.includes('schedule') ||
    lower.includes('appointment')
  ) {
    const models = ['m4', 'i7', 'x5', 'xm', 'i4', 'x3', '5 series', '540i'];
    const found = models.find((m) => lower.includes(m));
    const cities = ['dubai', 'abu dhabi', 'sharjah'];
    const city = cities.find((c) => lower.includes(c));
    return {
      type: 'booking',
      prefillVehicle: found ? `BMW ${found.toUpperCase()}` : undefined,
      prefillCity: city ? city.charAt(0).toUpperCase() + city.slice(1) : undefined,
    };
  }

  // Compare intent
  const compareMatch = lower.match(
    /compare\s+(.+?)\s+(?:vs?\.?|and|versus)\s+(.+)/i
  ) || lower.match(/(.+?)\s+(?:vs?\.?|versus)\s+(.+)/i);

  if (compareMatch && (lower.includes('compare') || lower.includes('vs') || lower.includes('versus'))) {
    return { type: 'compare', modelA: compareMatch[1].trim(), modelB: compareMatch[2].trim() };
  }

  // Pricing intent
  if (
    lower.includes('price') ||
    lower.includes('cost') ||
    lower.includes('how much') ||
    lower.includes('spec')
  ) {
    const models = ['m4', 'i7', 'x5', 'xm', 'i4', 'x3', '5 series', '540i', 'm4 competition', 'i4 m50', 'i7 xdrive'];
    const found = models.find((m) => lower.includes(m));
    if (found) return { type: 'pricing', model: found };
  }

  // Show all
  if (lower === 'all' || lower.includes('show all') || lower.includes('all models')) {
    return { type: 'list' };
  }

  // Default: search
  const searchParams: SearchParams = { query: message };

  if (lower.includes('electric') || lower.match(/\bev\b/)) searchParams.isElectric = true;
  if (lower.includes('suv')) searchParams.type = 'SUV';
  else if (lower.includes('sedan')) searchParams.type = 'Sedan';
  else if (lower.includes('coupe')) searchParams.type = 'Coupe';

  const underMatch = lower.match(/under\s+\$?([\d,.]+k?)/i);
  if (underMatch) {
    const raw = underMatch[1].replace(',', '').replace('k', '000');
    searchParams.maxPrice = parseInt(raw, 10);
  }

  if (lower.match(/\bfast\b|\bperformance\b|\bsport\b/)) searchParams.minHorsepower = 400;
  if (lower.includes('family') || lower.includes('7 seat')) searchParams.minSeating = 6;

  return { type: 'search', params: searchParams };
}
