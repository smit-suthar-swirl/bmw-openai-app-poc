// ─── Vehicle ────────────────────────────────────────────────────────────────

export interface BMWVehicle {
  id: string;
  name: string;
  type: 'SUV' | 'Sedan' | 'Coupe' | 'EV' | 'Sports';
  price: number;
  range: number | null;
  horsepower: number;
  acceleration: number;
  seating: number;
  description: string;
  imageUrl?: string | null;
  // Legacy alias kept for Phase 1 compat
  image?: string;
  features: string[];
  isElectric: boolean;
  tags: string[];
}

export interface SearchParams {
  query?: string;
  type?: BMWVehicle['type'];
  maxPrice?: number;
  minPrice?: number;
  isElectric?: boolean;
  minHorsepower?: number;
  minSeating?: number;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  vehicles: BMWVehicle[];
  query: string;
  totalFound: number;
  page: number;
  totalPages: number;
}

export interface CompareParams {
  modelA: string;
  modelB: string;
}

export interface ComparisonResult {
  vehicleA: BMWVehicle;
  vehicleB: BMWVehicle;
  winner: {
    price: string;
    horsepower: string;
    acceleration: string;
    range: string | null;
    seating: string;
  };
}

export interface PricingParams {
  model: string;
}

export interface PricingResult {
  vehicle: BMWVehicle;
  formattedPrice: string;
  pricePerHorsepower: string;
  category: string;
}

// ─── Dealer ─────────────────────────────────────────────────────────────────

export interface Dealer {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email?: string | null;
  openingHours: string;
  lat: number;
  lng: number;
  mapsUrl?: string;
}

export interface DealerSearchParams {
  city?: string;
  query?: string;
}

export interface DealerSearchResult {
  dealers: Dealer[];
  city: string | null;
  totalFound: number;
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export interface BookingRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleName: string;
  dealerCity: string;
  preferredDate: string; // ISO string
  notes?: string;
  userId?: string;
}

export interface BookingConfirmation {
  id: string;
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicle: BMWVehicle;
  dealer: Dealer;
  preferredDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

// ─── Recommendation ──────────────────────────────────────────────────────────

export interface RecommendParams {
  budget?: number;
  lifestyle?: 'family' | 'performance' | 'eco' | 'business' | 'adventure';
  preferElectric?: boolean;
  city?: 'Dubai' | 'Abu Dhabi' | 'Sharjah';
  dailyCommute?: number;
  passengers?: number;
}

export interface InventoryStatus {
  city: string;
  inStock: boolean;
  quantity: number;
}

export interface RecommendationResult {
  topPick: BMWVehicle;
  alternatives: BMWVehicle[];
  reasoning: string[];
  matchScore: number;
  inventory: InventoryStatus[];
}

// ─── Shared ──────────────────────────────────────────────────────────────────

export type ToolName =
  | 'search_bmw_models'
  | 'compare_bmw_models'
  | 'get_bmw_pricing'
  | 'find_bmw_showrooms'
  | 'book_test_drive'
  | 'recommend_bmw_vehicle';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
