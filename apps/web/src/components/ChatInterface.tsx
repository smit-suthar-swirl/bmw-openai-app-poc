import { useState, useRef, useEffect, type FormEvent } from 'react';
import type {
  SearchResult,
  ComparisonResult,
  PricingResult,
  DealerSearchResult,
  BookingConfirmation,
  RecommendationResult,
  BMWVehicle,
  Dealer,
  SearchParams,
} from '@bmw-ai/shared';
import { bmwApi, parseIntent } from '../api/client.ts';
import { VehicleCard } from './VehicleCard.tsx';
import { ComparisonTable } from './ComparisonTable.tsx';
import { PricingCard } from './PricingCard.tsx';
import { DealerCard } from './DealerCard.tsx';
import { BookingForm } from './BookingForm.tsx';
import { BookingConfirmationCard } from './BookingConfirmationCard.tsx';
import { FilterPanel } from './FilterPanel.tsx';
import { RecommendationCard } from './RecommendationCard.tsx';
import { LoadingDots } from './LoadingState.tsx';

type MessageContent =
  | { kind: 'text'; text: string }
  | { kind: 'search'; result: SearchResult }
  | { kind: 'comparison'; result: ComparisonResult }
  | { kind: 'pricing'; result: PricingResult }
  | { kind: 'dealers'; result: DealerSearchResult }
  | { kind: 'recommendation'; result: RecommendationResult }
  | { kind: 'booking_form'; prefillVehicle?: BMWVehicle; prefillDealer?: Dealer }
  | { kind: 'booking_confirmation'; confirmation: BookingConfirmation }
  | { kind: 'error'; message: string };

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: MessageContent;
  timestamp: Date;
}

const EXAMPLE_PROMPTS = [
  'Recommend a BMW for my family',
  'Best electric BMW under $80k',
  'Compare BMW M4 vs BMW i4',
  'BMW X5 price',
  'Nearest BMW showroom in Dubai',
  'Book a test drive for BMW i4',
  'Best performance BMW',
  'BMW i7 specs',
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: {
        kind: 'text',
        text: 'Welcome to the BMW AI Assistant. Search vehicles, compare models, find UAE showrooms, or book a test drive.',
      },
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterParams, setFilterParams] = useState<SearchParams>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function addMessage(role: Message['role'], content: MessageContent) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role, content, timestamp: new Date() },
    ]);
  }

  function replaceLastAssistant(content: MessageContent) {
    setMessages((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === 'assistant') {
          copy[i] = { ...copy[i], content };
          return copy;
        }
      }
      return copy;
    });
  }

  async function handleSubmit(e: FormEvent | string) {
    if (typeof e !== 'string') e.preventDefault();
    const query = typeof e === 'string' ? e : input.trim();
    if (!query || isLoading) return;

    setInput('');
    setShowFilters(false);
    addMessage('user', { kind: 'text', text: query });
    setIsLoading(true);

    try {
      const intent = parseIntent(query);

      switch (intent.type) {
        case 'search': {
          const merged = { ...intent.params, ...filterParams };
          const result = await bmwApi.search(merged);
          addMessage(
            'assistant',
            result.vehicles.length === 0
              ? { kind: 'text', text: `No BMW models found for "${query}". Try "electric BMW", "BMW SUV", or a specific model name.` }
              : { kind: 'search', result }
          );
          break;
        }

        case 'compare': {
          const result = await bmwApi.compare(intent.modelA, intent.modelB);
          addMessage('assistant', { kind: 'comparison', result });
          break;
        }

        case 'pricing': {
          const result = await bmwApi.pricing(intent.model);
          addMessage('assistant', { kind: 'pricing', result });
          break;
        }

        case 'recommend': {
          const result = await bmwApi.recommend(intent.params);
          addMessage('assistant', { kind: 'recommendation', result });
          break;
        }

        case 'dealers': {
          const result = await bmwApi.getDealers(intent.city);
          addMessage('assistant', { kind: 'dealers', result });
          break;
        }

        case 'booking': {
          addMessage('assistant', {
            kind: 'booking_form',
            prefillVehicle: undefined,
            prefillDealer: undefined,
          });
          break;
        }

        case 'list': {
          const result = await bmwApi.search({});
          addMessage('assistant', { kind: 'search', result });
          break;
        }

        default: {
          const result = await bmwApi.search({ query, ...filterParams });
          addMessage(
            'assistant',
            result.vehicles.length > 0
              ? { kind: 'search', result }
              : { kind: 'text', text: "I couldn't find what you're looking for. Try asking about SUVs, EVs, showrooms, or a specific model like BMW i4 or X5." }
          );
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      addMessage('assistant', { kind: 'error', message });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleCompareFromCard(modelName: string) {
    setInput(`Compare ${modelName} vs `);
    inputRef.current?.focus();
  }

  function handlePricingFromCard(modelName: string) {
    handleSubmit(`${modelName} price`);
  }

  function handleBookFromDealer(dealer: Dealer) {
    addMessage('user', { kind: 'text', text: `Book a test drive at ${dealer.name}` });
    addMessage('assistant', { kind: 'booking_form', prefillDealer: dealer });
  }

  function handleBookFromVehicle(vehicle: BMWVehicle) {
    addMessage('user', { kind: 'text', text: `Book a test drive for ${vehicle.name}` });
    addMessage('assistant', { kind: 'booking_form', prefillVehicle: vehicle });
  }

  function handleBookingSuccess(id: string, confirmation: BookingConfirmation) {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === id) {
          return { ...msg, content: { kind: 'booking_confirmation', confirmation } };
        }
        return msg;
      })
    );
  }

  function handleFilterApply() {
    setShowFilters(false);
    const activeCount = Object.values(filterParams).filter(Boolean).length;
    if (activeCount > 0) {
      handleSubmit(`Search with ${activeCount} active filter${activeCount > 1 ? 's' : ''}`);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'user' ? (
              <div className="chat-bubble-user animate-fade-in">
                <p className="text-sm">{(msg.content as { text: string }).text}</p>
              </div>
            ) : (
              <div className="flex-1 max-w-4xl animate-fade-in">
                <AssistantMessage
                  msgId={msg.id}
                  content={msg.content}
                  onCompare={handleCompareFromCard}
                  onViewPricing={handlePricingFromCard}
                  onBookFromDealer={handleBookFromDealer}
                  onBookFromVehicle={handleBookFromVehicle}
                  onBookingSuccess={(confirmation) => handleBookingSuccess(msg.id, confirmation)}
                />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="chat-bubble-ai">
              <LoadingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Filter panel drawer */}
      {showFilters && (
        <div className="px-4 pb-3 max-w-xl">
          <FilterPanel
            params={filterParams}
            onChange={setFilterParams}
            onApply={handleFilterApply}
            onReset={() => setFilterParams({})}
          />
        </div>
      )}

      {/* Example prompts (shown early in conversation) */}
      {messages.length <= 2 && (
        <div className="px-4 pb-3">
          <p className="text-bmw-silver text-xs uppercase tracking-widest mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                className="px-3 py-1.5 bg-bmw-dark border border-bmw-border rounded-full text-xs text-bmw-light hover:border-bmw-blue hover:text-bmw-blue transition-all duration-200"
                onClick={() => handleSubmit(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 pb-4 space-y-2">
        <div className="flex gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            title="Advanced filters"
            className={`p-3 rounded-xl border transition-all duration-200 ${
              showFilters || Object.keys(filterParams).length > 0
                ? 'bg-bmw-blue/20 border-bmw-blue text-bmw-blue'
                : 'bg-bmw-dark border-bmw-border text-bmw-silver hover:border-bmw-blue hover:text-bmw-blue'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
          </button>

          <form onSubmit={handleSubmit} className="flex gap-2 flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about BMW vehicles, showrooms, or book a test drive…"
              className="bmw-input flex-1"
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bmw-btn-primary px-5 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>

        {Object.keys(filterParams).length > 0 && (
          <p className="text-bmw-blue text-xs px-1">
            {Object.values(filterParams).filter(Boolean).length} filter{Object.values(filterParams).filter(Boolean).length > 1 ? 's' : ''} active
          </p>
        )}
      </div>
    </div>
  );
}

function AssistantMessage({
  msgId,
  content,
  onCompare,
  onViewPricing,
  onBookFromDealer,
  onBookFromVehicle,
  onBookingSuccess,
}: {
  msgId: string;
  content: MessageContent;
  onCompare: (name: string) => void;
  onViewPricing: (name: string) => void;
  onBookFromDealer: (dealer: Dealer) => void;
  onBookFromVehicle: (vehicle: BMWVehicle) => void;
  onBookingSuccess: (confirmation: BookingConfirmation) => void;
}) {
  switch (content.kind) {
    case 'text':
      return (
        <div className="chat-bubble-ai">
          <p className="text-sm leading-relaxed">{content.text}</p>
        </div>
      );

    case 'error':
      return (
        <div className="chat-bubble-ai border-red-500/30 bg-red-500/10">
          <p className="text-sm text-red-400">{content.message}</p>
        </div>
      );

    case 'search':
      return (
        <div className="space-y-3">
          <div className="chat-bubble-ai">
            <p className="text-sm">
              Found <span className="text-bmw-blue font-semibold">{content.result.totalFound}</span>{' '}
              BMW model{content.result.totalFound !== 1 ? 's' : ''}
              {content.result.query ? ` for "${content.result.query}"` : ''}:
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.result.vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onCompare={(vehicle) => onCompare(vehicle.name)}
                onViewPricing={(vehicle) => onViewPricing(vehicle.name)}
                onBookTestDrive={onBookFromVehicle}
              />
            ))}
          </div>
        </div>
      );

    case 'comparison':
      return (
        <div className="space-y-3">
          <div className="chat-bubble-ai">
            <p className="text-sm">
              Comparing{' '}
              <span className="text-bmw-blue font-semibold">{content.result.vehicleA.name}</span>{' '}
              vs{' '}
              <span className="text-bmw-blue font-semibold">{content.result.vehicleB.name}</span>:
            </p>
          </div>
          <ComparisonTable result={content.result} />
        </div>
      );

    case 'pricing':
      return (
        <div className="space-y-3">
          <div className="chat-bubble-ai">
            <p className="text-sm">
              Pricing & specs for the{' '}
              <span className="text-bmw-blue font-semibold">{content.result.vehicle.name}</span>:
            </p>
          </div>
          <PricingCard result={content.result} onCompare={onCompare} />
        </div>
      );

    case 'recommendation':
      return (
        <div className="space-y-3">
          <div className="chat-bubble-ai">
            <p className="text-sm">
              Here's my personalised BMW recommendation for you:
            </p>
          </div>
          <RecommendationCard
            result={content.result}
            onViewPricing={onViewPricing}
            onCompare={onCompare}
            onBook={(name) => {
              const vehicle = content.result.topPick.name === name
                ? content.result.topPick
                : content.result.alternatives.find((v) => v.name === name);
              if (vehicle) onBookFromVehicle(vehicle);
            }}
          />
        </div>
      );

    case 'dealers':
      return (
        <div className="space-y-3">
          <div className="chat-bubble-ai">
            <p className="text-sm">
              Found <span className="text-bmw-blue font-semibold">{content.result.totalFound}</span>{' '}
              BMW showroom{content.result.totalFound !== 1 ? 's' : ''}
              {content.result.city ? ` in ${content.result.city}` : ''}:
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {content.result.dealers.map((d) => (
              <DealerCard key={d.id} dealer={d} onBookTestDrive={onBookFromDealer} />
            ))}
          </div>
        </div>
      );

    case 'booking_form':
      return (
        <BookingForm
          prefillVehicle={content.prefillVehicle}
          prefillDealer={content.prefillDealer}
          onSuccess={onBookingSuccess}
          onCancel={() => {}}
        />
      );

    case 'booking_confirmation':
      return <BookingConfirmationCard confirmation={content.confirmation} />;
  }
}
