/**
 * Utilitaires de dates et de prix.
 *
 * Les dates circulent dans l'app sous forme de chaînes « YYYY-MM-DD ».
 * On ne les parse JAMAIS avec `new Date('2025-09-12')` : ce format est
 * interprété en UTC par le moteur JS, ce qui décale d'un jour dans les
 * fuseaux négatifs. On construit toujours une date locale à midi.
 */

const MONTHS_SHORT = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

const MONTHS_LONG = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

export const WEEKDAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/** Date locale (midi) à partir d'une clé « YYYY-MM-DD ». */
export function parseDay(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}

/** Clé « YYYY-MM-DD » à partir d'une Date locale. */
export function dayKey(date: Date): string {
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number): Date {
  // On se place au 1er du mois avant de décaler, sinon le 31 janvier + 1 mois
  // retombe en mars (février n'ayant pas de 31).
  return new Date(date.getFullYear(), date.getMonth() + months, 1, 12, 0, 0, 0);
}

/** Nombre de nuits entre deux clés de jour. Toujours >= 0. */
export function nightsBetween(from: string, to: string): number {
  const ms = parseDay(to).getTime() - parseDay(from).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

/** « 12 sept. » */
export function formatDay(key: string): string {
  const d = parseDay(key);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** « 12 septembre 2025 » */
export function formatDayLong(key: string): string {
  const d = parseDay(key);
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

/** « Septembre 2025 » */
export function formatMonth(date: Date): string {
  const label = MONTHS_LONG[date.getMonth()];
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} ${date.getFullYear()}`;
}

/** « 12 sept. – 15 sept. » ou un libellé de repli si l'une des dates manque. */
export function formatRange(from: string | null, to: string | null, fallback = 'Ajouter des dates'): string {
  if (!from || !to) return fallback;
  return `${formatDay(from)} – ${formatDay(to)}`;
}

/**
 * Séparateur de milliers appliqué à la main : `toLocaleString('fr-FR')` dépend
 * du support d'Intl dans Hermes, qui varie selon la plateforme et retomberait
 * silencieusement sur un format anglais.
 */
export function formatPrice(amount: number): string {
  const rounded = Math.abs(Math.round(amount));
  const grouped = `${rounded}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${amount < 0 ? '-' : ''}$${grouped}`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count > 1 ? plural : singular}`;
}

/** Grille du mois : cases vides en tête pour aligner sur lundi. */
export function monthGrid(month: Date): (Date | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1, 12, 0, 0, 0);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  // getDay() : 0 = dimanche. On veut lundi en première colonne.
  const lead = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), d, 12, 0, 0, 0));
  }
  return cells;
}
