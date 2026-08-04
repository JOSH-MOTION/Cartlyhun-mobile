import React from 'react';
import { Text } from 'react-native';

/**
 * Live feedback under a discount input.
 *
 * Tells the seller what shoppers will see before saving, and warns when the
 * figure typed will simply be ignored — a discount at or above the normal
 * price is dropped rather than stored.
 */
export default function DiscountHint({
  original,
  discount,
}: {
  original: string | number;
  discount?: string | number | null;
}) {
  if (discount === undefined || discount === null || discount === '') return null;

  const normal = Number(original);
  const sale = Number(discount);

  if (!Number.isFinite(sale) || sale <= 0) {
    return <Hint tone="warn">Enter an amount above zero, or leave this blank.</Hint>;
  }

  if (!Number.isFinite(normal) || normal <= 0) {
    return <Hint tone="warn">Set the selling price first.</Hint>;
  }

  if (sale >= normal) {
    return (
      <Hint tone="warn">
        Must be below ₵{normal.toLocaleString()} — this discount will be ignored.
      </Hint>
    );
  }

  const percent = Math.round((1 - sale / normal) * 100);

  return (
    <Hint tone="ok">
      Shoppers see ₵{sale.toLocaleString()} with ₵{normal.toLocaleString()} crossed out —{' '}
      {percent}% off.
    </Hint>
  );
}

const Hint = ({ tone, children }: { tone: 'warn' | 'ok'; children: React.ReactNode }) => (
  <Text
    className="text-[10px] font-bold leading-relaxed mt-2 ml-1"
    style={{ color: tone === 'warn' ? '#d97706' : '#059669' }}
  >
    {children}
  </Text>
);
