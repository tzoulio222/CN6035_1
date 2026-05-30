const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'EUR';

export function formatCurrency(value, currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return '€0.00';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    return `€${numericValue.toFixed(2)}`;
  }
}

export function formatShortDateTime(value) {
  if (!value) {
    return 'TBA';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'TBA';
  }

  try {
    return `${date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })} • ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } catch {
    return date.toISOString();
  }
}

export function formatDateLabel(value) {
  if (!value) {
    return 'TBA';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'TBA';
  }

  try {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return date.toDateString();
  }
}

export function formatTimeLabel(value) {
  if (!value) {
    return 'TBA';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'TBA';
  }

  try {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date.toLocaleTimeString();
  }
}

function parseSeatIndex(seatNumber) {
  const numericPart = parseInt(String(seatNumber || '').slice(1), 10);
  return Number.isNaN(numericPart) ? 0 : numericPart;
}

export function groupSeatsByRow(seats = []) {
  const rows = new Map();

  seats.forEach((seat) => {
    const seatNumber = String(seat?.seatNumber || seat?.seat_number || '').trim().toUpperCase();
    if (!seatNumber) {
      return;
    }

    const row = seatNumber.charAt(0);
    const current = rows.get(row) || [];
    current.push({
      seatNumber,
      booked: Boolean(seat?.booked || seat?.status === 'booked' || seat?.isBooked),
    });
    rows.set(row, current);
  });

  return Array.from(rows.entries())
    .sort(([rowA], [rowB]) => rowA.localeCompare(rowB))
    .map(([row, rowSeats]) => ({
      row,
      seats: rowSeats.sort((a, b) => parseSeatIndex(a.seatNumber) - parseSeatIndex(b.seatNumber)),
    }));
}
