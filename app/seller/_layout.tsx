import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

/**
 * Seller portal stack.
 *
 * Mobile uses a hub-and-push model rather than the web's sidebar: the index
 * screen lists every section and each one pushes on top, so the back gesture
 * always does the obvious thing.
 *
 * Every screen in this stack queries with `enabled: !!vendorId`, which just
 * renders empty panels for a signed-out visitor instead of bouncing them —
 * gate the whole stack here instead of repeating the check in each screen.
 */
export default function SellerLayout() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/auth/signin" />;
  if (profile?.role !== 'seller') return <Redirect href="/store-setup" />;

  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
