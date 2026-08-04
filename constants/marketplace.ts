/**
 * Marketplace vocabulary, mirrored from the web app's
 * src/services/marketplace/constants.js.
 *
 * The two projects are separate packages so this cannot be imported directly.
 * If you change an enum value here, change it there too — these strings are
 * persisted in Firestore documents and read by both clients.
 */

export const SELLING_MODES = {
  WHATSAPP: 'whatsapp',
  ONLINE: 'online',
  BOTH: 'both',
} as const;

export const SELLING_MODE_OPTIONS = [
  {
    value: SELLING_MODES.WHATSAPP,
    label: 'WhatsApp Only',
    summary: 'Customers order by chatting with you. No online payments.',
    requiresWhatsapp: true,
    enablesOnline: false,
    recommended: false,
  },
  {
    value: SELLING_MODES.ONLINE,
    label: 'Online Payments',
    summary: 'Customers pay Cartly Hub securely. Earnings land in your wallet.',
    requiresWhatsapp: false,
    enablesOnline: true,
    recommended: false,
  },
  {
    value: SELLING_MODES.BOTH,
    label: 'Both',
    summary: 'Get paid online and keep chatting with customers on WhatsApp.',
    requiresWhatsapp: true,
    enablesOnline: true,
    recommended: true,
  },
];

export const ORDER_CHANNELS = {
  ONLINE: 'online',
  WHATSAPP: 'whatsapp',
} as const;

export const ORDER_STATUS = {
  AWAITING_PAYMENT: 'awaiting_payment',
  AWAITING_VENDOR: 'awaiting_vendor',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.AWAITING_PAYMENT]: 'Awaiting payment',
  [ORDER_STATUS.AWAITING_VENDOR]: 'Awaiting vendor',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.REFUNDED]: 'Refunded',
};

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const WALLET_TRANSACTION_TYPES = {
  EARNING: 'earning',
  WITHDRAWAL_HOLD: 'withdrawal_hold',
  WITHDRAWAL_PAID: 'withdrawal_paid',
  WITHDRAWAL_REVERSAL: 'withdrawal_reversal',
  ADJUSTMENT: 'adjustment',
  REFUND: 'refund',
} as const;

export const WALLET_TRANSACTION_LABELS: Record<string, string> = {
  [WALLET_TRANSACTION_TYPES.EARNING]: 'Order earnings',
  [WALLET_TRANSACTION_TYPES.WITHDRAWAL_HOLD]: 'Withdrawal requested',
  [WALLET_TRANSACTION_TYPES.WITHDRAWAL_PAID]: 'Withdrawal paid',
  [WALLET_TRANSACTION_TYPES.WITHDRAWAL_REVERSAL]: 'Withdrawal returned',
  [WALLET_TRANSACTION_TYPES.ADJUSTMENT]: 'Adjustment',
  [WALLET_TRANSACTION_TYPES.REFUND]: 'Refund',
};

export const WITHDRAWAL_METHODS = [
  { value: 'mtn_momo', label: 'MTN Mobile Money', kind: 'mobile_money' },
  { value: 'telecel_cash', label: 'Telecel Cash', kind: 'mobile_money' },
  { value: 'airteltigo_money', label: 'AirtelTigo Money', kind: 'mobile_money' },
  { value: 'bank_account', label: 'Bank Account', kind: 'bank' },
];

export const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'paid',
  REJECTED: 'rejected',
} as const;

/** Formats an amount the same way the web app does. */
export const formatCurrency = (amount: number | undefined | null, currency = 'GHS') => {
  const symbols: Record<string, string> = { GHS: 'GH₵', NGN: '₦', USD: '$' };
  const symbol = symbols[currency] || `${currency} `;
  return `${symbol}${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
