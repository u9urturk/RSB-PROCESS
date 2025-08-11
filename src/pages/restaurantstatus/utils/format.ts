// Centralized formatting helpers

export function formatCurrencyTRY(amount: number | null | undefined): string {
  if (!amount) return '0₺';
  return amount.toLocaleString('tr-TR', { minimumFractionDigits: 0 }) + '₺';
}

export function formatHHMM(dateIso?: string): string {
  if (!dateIso) return '--:--';
  const d = new Date(dateIso);
  if (isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export function formatOccupiedDuration(occupiedAt?: string): string {
  if (!occupiedAt) return '--:--';
  const start = new Date(occupiedAt);
  if (isNaN(start.getTime())) return '--:--';
  const diffMinutes = Math.floor((Date.now() - start.getTime()) / 60000);
  if (diffMinutes < 60) return `${diffMinutes}dk`;
  const h = Math.floor(diffMinutes / 60);
  const m = diffMinutes % 60;
  return `${h}sa ${m}dk`;
}
