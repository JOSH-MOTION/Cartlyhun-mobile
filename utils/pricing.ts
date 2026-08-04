/**
 * Discount pricing, mirrored from the web app's src/lib/pricing.js.
 *
 * The rule that keeps this safe: `price` is always what the customer actually
 * pays, and `compareAtPrice` is the old price shown struck through. Because of
 * that, cart totals, order building, commission and wallet credits keep
 * reading `price` and need no knowledge of discounts.
 */

const round2 = (amount: number) => Math.round(Number(amount || 0) * 100) / 100;

export type Pricing = {
  price: number;
  compareAtPrice: number | null;
  isDiscounted: boolean;
  percentOff: number;
  saving: number;
};

/**
 * Turns what a seller typed into the two stored fields. A discount that is
 * empty, zero, negative, non-numeric or not below the original is ignored
 * rather than rejected — sellers end a sale by blanking the field.
 */
export const normaliseDiscount = (
  original: string | number,
  discount?: string | number | null,
): { price: number; compareAtPrice: number | null } => {
  const normal = Number(original);
  if (!Number.isFinite(normal) || normal <= 0) {
    return { price: 0, compareAtPrice: null };
  }

  const sale = Number(discount);
  const hasDiscount = Number.isFinite(sale) && sale > 0 && sale < normal;

  return hasDiscount
    ? { price: round2(sale), compareAtPrice: round2(normal) }
    : { price: round2(normal), compareAtPrice: null };
};

/** The prices to render for a product, optionally for a specific variant. */
export const resolvePricing = (product: any, variant?: any): Pricing => {
  const source =
    variant && Number(variant.price) > 0
      ? variant
      : { price: product?.basePrice, compareAtPrice: product?.compareAtPrice };

  const price = Number(source?.price) || Number(product?.basePrice) || 0;
  const compareAtRaw = Number(source?.compareAtPrice) || null;
  const onSale = compareAtRaw != null && compareAtRaw > price && price > 0;

  return {
    price,
    compareAtPrice: onSale ? compareAtRaw : null,
    isDiscounted: onSale,
    percentOff: onSale ? Math.round((1 - price / compareAtRaw) * 100) : 0,
    saving: onSale ? round2(compareAtRaw - price) : 0,
  };
};

/** Cheapest live price across a product's variants, for listing cards. */
export const resolveListPricing = (product: any): Pricing => {
  const variants: any[] = product?.variants || [];
  const inStock = variants.filter((variant) => Number(variant.stock ?? 0) > 0);
  const candidates = inStock.length ? inStock : variants;

  if (!candidates.length) return resolvePricing(product);

  const cheapest = candidates.reduce((lowest, variant) =>
    Number(variant.price || Infinity) < Number(lowest.price || Infinity) ? variant : lowest,
  );

  return resolvePricing(product, cheapest);
};
