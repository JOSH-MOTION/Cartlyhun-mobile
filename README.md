# CartlyHub Mobile 📱

Premium, high-end mobile marketplace application built with Expo SDK 54, React Native, and NativeWind.

## Features
- **Glossy iOS Aesthetic**: Blur effects and premium typography.
- **Full Parity**: Matches the CartlyHub web platform feature-for-feature.
- **Native Auth**: Integrated Google Sign-In and Email/Password flows.
- **Inventory Management**: Full seller dashboard for product listings.
- **Global Wishlist**: Persistent saved items across sessions.

## Tech Stack
- **Framework**: Expo / React Native
- **Styling**: Tailwind CSS (NativeWind)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth + Google Auth Provider
- **State Management**: Zustand
- **Media**: Cloudinary SDK

## Seller portal

`/seller` carries the full vendor portal: overview, orders (with detail and
status updates), products, inventory, customers, wallet, withdrawals,
notifications, reviews, analytics and store settings — including the
Selling &amp; Payment Preferences picker.

Navigation is hub-and-push rather than the web's sidebar: `/seller` lists every
section and each one pushes on top, so the back gesture always does the
obvious thing.

### Why some things go through the API

`firestore.rules` makes `orders`, `wallets`, `walletTransactions`,
`withdrawals` and `payments` **read-only to every client** — only the server
may write them, so commission, stock deduction and wallet credits can't be
forged from a device.

So the app writes those through the same endpoints the web app uses, via
`lib/api.ts`, which attaches the caller's Firebase ID token:

| Action | Route |
| --- | --- |
| Wallet + transactions | `GET /api/wallet` |
| Request a payout | `POST /api/withdrawals` |
| Order detail / status | `GET` &amp; `PATCH /api/orders/:id` |
| Selling preferences | `PUT /api/vendor/preferences` |
| Mark notifications read | `PATCH /api/notifications` |

Plain listings (a vendor's own orders, customers, notifications) are still read
straight from Firestore in `utils/marketplaceData.ts`, because the rules allow
the owner to read those.

`constants/marketplace.ts` mirrors the web's enum values. Both clients persist
these exact strings, so changing one without the other will break the other
app.

## Setup
1. Clone this repository.
2. Install dependencies: `npm install`.
3. Configure `.env` with Firebase/Google IDs.
4. Set `EXPO_PUBLIC_SITE_URL` to the deployed web app (it is the API base — it
   defaults to `https://cartlyhubgh.com`). Point it at your machine's LAN
   address when testing against a local Next.js server; `localhost` will not
   resolve from a phone.
5. Start development: `npx expo start`.
