import type { RecurringInstance, RecurringTemplate } from '@/lib/types';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function yyyymmdd(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}${m}${day}`;
}

export function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: string) {
  // If it's an ISO string with time (YYYY-MM-DDTHH:mm...), normalize to the date part
  // so we don't get timezone day-shifts.
  const head = String(s || '').slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(head);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(s);
}

export function addDays(d: Date, days: number) {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

export function addMonths(d: Date, months: number) {
  const out = new Date(d);
  out.setMonth(out.getMonth() + months);
  return out;
}

export function addYears(d: Date, years: number) {
  const out = new Date(d);
  out.setFullYear(out.getFullYear() + years);
  return out;
}

export function deterministicInstanceId(templateId: string, due: Date) {
  return `${templateId}_${yyyymmdd(due)}`;
}

export function generateDueDates(template: RecurringTemplate, from: Date, to: Date) {
  const start = parseISODate(template.startDate);
  const end = template.endDate ? parseISODate(template.endDate) : null;

  // No instances if paused
  if (template.status === 'paused') return [];

  // Clamp the window
  const windowStart = from > start ? from : start;
  const windowEnd = to;

  // If endDate exists and is before windowStart, nothing
  if (end && end < windowStart) return [];

  const dueDates: Date[] = [];

  // Find the first due date >= windowStart
  let cursor = start;

  // Step cursor forward until it reaches windowStart
  // (safe because we’re only doing 90 days windows)
  while (cursor < windowStart) {
    cursor = nextDueDate(template, cursor);
  }

  while (cursor <= windowEnd) {
    if (!end || cursor <= end) dueDates.push(cursor);
    cursor = nextDueDate(template, cursor);
  }

  return dueDates;
}

function nextDueDate(template: RecurringTemplate, current: Date) {
  switch (template.frequency) {
    case 'weekly':
      return addDays(current, 7);
    case 'biweekly':
      return addDays(current, 14);
    case 'monthly':
      return addMonths(current, 1);
    case 'yearly':
      return addYears(current, 1);
    default:
      return addMonths(current, 1);
  }
}

export function generateInstancesForWindow(
  template: RecurringTemplate,
  from: Date,
  to: Date
): RecurringInstance[] {
  const dues = generateDueDates(template, from, to);

  return dues.map((due) => ({
    id: deterministicInstanceId(template.id, due),
    templateId: template.id,
    dueDate: isoDate(due),
    amountSnapshot: template.amount,
    categorySnapshot: template.category,
    status: 'scheduled',
  }));
}

export function next90DaysWindow() {
  const from = new Date();
  // normalize to start-of-day to reduce timezone weirdness
  from.setHours(0, 0, 0, 0);
  const to = addDays(from, 30);
  return { from, to };
}

