import { Redirect } from 'expo-router';

/**
 * The seller dashboard moved to /seller, which carries the full portal —
 * orders, wallet, withdrawals, inventory, customers, analytics and settings.
 *
 * This route is kept so existing links and notification deep-links still land
 * somewhere sensible.
 */
export default function SellerDashboardRedirect() {
  return <Redirect href="/seller" />;
}
