import { useState, type FormEvent } from 'react';
import type { Dealer, BMWVehicle, BookingConfirmation } from '@bmw-ai/shared';
import { bmwApi } from '../api/client.ts';

interface BookingFormProps {
  prefillVehicle?: BMWVehicle;
  prefillDealer?: Dealer;
  onSuccess: (confirmation: BookingConfirmation) => void;
  onCancel: () => void;
}

const UAE_CITIES = ['Dubai', 'Abu Dhabi', 'Sharjah'] as const;

// Minimum date: tomorrow
function minDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

// Maximum date: 6 months out
function maxDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().split('T')[0];
}

interface FormFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleName: string;
  dealerCity: string;
  preferredDate: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

export function BookingForm({ prefillVehicle, prefillDealer, onSuccess, onCancel }: BookingFormProps) {
  const [fields, setFields] = useState<FormFields>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    vehicleName: prefillVehicle?.name ?? '',
    dealerCity: (prefillDealer?.city as typeof UAE_CITIES[number]) ?? '',
    preferredDate: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  function set(key: keyof FormFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validate(): boolean {
    const errs: FormErrors = {};

    if (fields.firstName.trim().length < 2) errs.firstName = 'At least 2 characters';
    if (fields.lastName.trim().length < 2) errs.lastName = 'At least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = 'Valid email required';
    if (!/^\+?[\d\s\-()]{8,20}$/.test(fields.phone)) errs.phone = 'Valid phone number required';
    if (!fields.vehicleName) errs.vehicleName = 'Please enter a vehicle name';
    if (!UAE_CITIES.includes(fields.dealerCity as typeof UAE_CITIES[number])) errs.dealerCity = 'Please select a city';
    if (!fields.preferredDate) errs.preferredDate = 'Please select a date';
    else if (new Date(fields.preferredDate) <= new Date()) errs.preferredDate = 'Date must be in the future';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const confirmation = await bmwApi.bookTestDrive({
        firstName: fields.firstName.trim(),
        lastName: fields.lastName.trim(),
        email: fields.email.trim(),
        phone: fields.phone.trim(),
        vehicleName: fields.vehicleName,
        dealerCity: fields.dealerCity,
        preferredDate: new Date(fields.preferredDate).toISOString(),
        notes: fields.notes.trim() || undefined,
      });
      onSuccess(confirmation);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bmw-card animate-slide-up">
      {/* Header */}
      <div className="p-5 border-b border-bmw-border">
        <h2 className="font-bold text-bmw-light text-lg">Book a Test Drive</h2>
        <p className="text-bmw-silver text-sm mt-1">Fill in your details and we'll confirm your appointment.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name" error={errors.firstName}>
            <input
              className={inputCls(errors.firstName)}
              placeholder="John"
              value={fields.firstName}
              onChange={(e) => set('firstName', e.target.value)}
              disabled={isSubmitting}
            />
          </Field>
          <Field label="Last Name" error={errors.lastName}>
            <input
              className={inputCls(errors.lastName)}
              placeholder="Smith"
              value={fields.lastName}
              onChange={(e) => set('lastName', e.target.value)}
              disabled={isSubmitting}
            />
          </Field>
        </div>

        {/* Contact */}
        <Field label="Email Address" error={errors.email}>
          <input
            type="email"
            className={inputCls(errors.email)}
            placeholder="john@example.com"
            value={fields.email}
            onChange={(e) => set('email', e.target.value)}
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Phone Number" error={errors.phone}>
          <input
            type="tel"
            className={inputCls(errors.phone)}
            placeholder="+971-55-123-4567"
            value={fields.phone}
            onChange={(e) => set('phone', e.target.value)}
            disabled={isSubmitting}
          />
        </Field>

        {/* Vehicle */}
        <Field label="Preferred Vehicle" error={errors.vehicleName}>
          <input
            className={inputCls(errors.vehicleName)}
            placeholder="BMW i4 M50"
            value={fields.vehicleName}
            onChange={(e) => set('vehicleName', e.target.value)}
            disabled={isSubmitting}
          />
        </Field>

        {/* City + Date row */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Showroom City" error={errors.dealerCity}>
            <select
              className={inputCls(errors.dealerCity)}
              value={fields.dealerCity}
              onChange={(e) => set('dealerCity', e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Select city</option>
              {UAE_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Preferred Date" error={errors.preferredDate}>
            <input
              type="date"
              className={inputCls(errors.preferredDate)}
              min={minDate()}
              max={maxDate()}
              value={fields.preferredDate}
              onChange={(e) => set('preferredDate', e.target.value)}
              disabled={isSubmitting}
            />
          </Field>
        </div>

        {/* Notes */}
        <Field label="Notes (optional)">
          <textarea
            className={`${inputCls()} resize-none`}
            rows={2}
            placeholder="Any special requests or questions..."
            value={fields.notes}
            onChange={(e) => set('notes', e.target.value)}
            disabled={isSubmitting}
          />
        </Field>

        {/* API error */}
        {apiError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {apiError}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            className="bmw-btn-ghost flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bmw-btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Confirming…' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}

function inputCls(error?: string) {
  return `bmw-input text-sm ${error ? 'border-red-500/60 focus:border-red-400 focus:ring-red-400/20' : ''}`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-bmw-silver text-xs uppercase tracking-widest block mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
