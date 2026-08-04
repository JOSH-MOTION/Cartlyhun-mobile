import { Stack } from 'expo-router';

/**
 * Seller portal stack.
 *
 * Mobile uses a hub-and-push model rather than the web's sidebar: the index
 * screen lists every section and each one pushes on top, so the back gesture
 * always does the obvious thing.
 */
export default function SellerLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
