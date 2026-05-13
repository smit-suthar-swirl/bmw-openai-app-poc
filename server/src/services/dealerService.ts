import type { Dealer, DealerSearchParams, DealerSearchResult } from '@bmw-ai/shared';
import { dealerRepository } from '../repositories/dealerRepository.js';

export class DealerService {
  async search(params: DealerSearchParams): Promise<DealerSearchResult> {
    let dealers: Dealer[];

    if (params.city) {
      dealers = await dealerRepository.findByCity(params.city);
    } else if (params.query) {
      dealers = await dealerRepository.search(params.query);
    } else {
      dealers = await dealerRepository.findAll();
    }

    return {
      dealers,
      city: params.city ?? null,
      totalFound: dealers.length,
    };
  }

  async getById(id: string): Promise<Dealer | null> {
    return dealerRepository.findById(id);
  }

  async getAll(): Promise<Dealer[]> {
    return dealerRepository.findAll();
  }
}

export const dealerService = new DealerService();
