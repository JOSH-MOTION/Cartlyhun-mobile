# Play Console setup — answer sheet

Account type: **Personal** (decided). Means: no D-U-N-S/business paperwork, just your government ID + a card for the $25 fee — but CartlyHub can't go to production until **12 testers are opted into a closed test for 14 continuous days**. See "Closed testing plan" below — start that track as early as possible, it's the long pole.

---

## 1. Account creation

| Field | Answer |
|---|---|
| Account type | Personal |
| Developer name (public, shown on every listing) | `Khodz` — I'd drop the `.com`; Play Store developer names read as brand names, not URLs, and "Khodz" alone is cleaner. Your call though — `khodz.com` isn't against any rule, just unconventional. |
| Registration fee | **$25, one-time — you pay this yourself**, real payment on your own card. I can't do this step. |
| Government ID | Yours, for identity verification — Google may ask for this during or shortly after signup. |

---

## 2. Closed testing plan (do this first — it's the bottleneck)

You need **12 people opted in continuously for 14 days** before Google will even let you apply for production. Practical path:

1. Build a preview/internal APK (`eas build --profile preview --platform android` once you're logged into EAS).
2. In Play Console, create the app, go to **Testing → Closed testing**, create a track, upload that build.
3. Get 12 real people (friends, family, early sellers, your Instagram followers) to click the opt-in link and install it.
4. Wait 14 straight days with all 12 still opted in — if someone drops out and rejoins, their clock resets.
5. Apply for production access once the 14 days are up.

Start this the same day you finish account setup — it's calendar time you can't compress.

## 3. App details

| Field | Answer |
|---|---|
| App name | CartlyHub |
| Default language | English (Ghana) if offered, else English (US/UK) |
| App or game | App |
| Free or paid | Free |

## 4. Declarations (Play Console → App content)

**Ads** — No. No ad SDK anywhere in the codebase (checked `package.json`).

**Government app** — No.

**COVID-19 contact tracing/status app** — No.

**Financial features declaration** — CartlyHub does process payments (Paystack) and has a seller wallet/withdrawal system. This is standard marketplace behavior (same category as Etsy, Depop) — you're very unlikely to need to declare it as a dedicated financial-services app. If Play Console's financial-features form asks directly, answer honestly: yes, the app facilitates payments between buyers and sellers via a licensed processor (Paystack); CartlyHub itself doesn't issue credit, hold deposits as a bank would, or offer investment products.

**Target audience** — Recommend **18 and over**. The app has real financial transactions (checkout, seller payouts) and account creation with no separate "kids mode" — cleanest to declare adult-only rather than try to qualify for a mixed-age or children's policy tier, which comes with extra restrictions (no personalized ads infra needed either way, since you have none).

**Data safety section** — this is the one Google checks most carefully for accuracy. Based on what's actually in the code:

| Data type | Collected? | Shared with 3rd party? | Purpose | Notes |
|---|---|---|---|---|
| Name, email, phone | Yes | No* | Account functionality, order fulfillment | Firebase Auth + Firestore user profile |
| Precise location | Yes | No | App functionality | `ACCESS_FINE_LOCATION` — used for "nearby listings" per the iOS usage string |
| Photos | Yes | No* | App functionality | Camera/photo-library permission, uploaded to Cloudinary for product images |
| Purchase history | Yes | No* | App functionality | Order records in Firestore |
| Payment info | Yes (in-transit only) | Yes — Paystack | App functionality | Card/MoMo details go to Paystack, a licensed processor; CartlyHub doesn't store raw card numbers |
| Device/push ID | Yes | No | App functionality | Expo push token for order notifications |
| Biometric data | **No** | — | — | Face ID/fingerprint gate the session locally via the OS API — the app never receives or stores actual biometric data, only a pass/fail result |

\* "Shared with 3rd party" in Google's specific sense means transferred to another company for *their own* purposes. Firebase and Cloudinary process this data *on your behalf* as service providers under your instruction — that's "Processed by a service provider," a different checkbox in the form than "Shared with a third party." Don't conflate them; the form asks this distinction directly.

**Data deletion**: Firestore based, so a user-data-deletion request is a manual/scripted process on your end right now — Play Console's Data Safety form asks if you provide a way for users to request account deletion. If there's no in-app "delete my account" flow yet, answer honestly (no self-serve deletion yet) or add one before submitting — worth flagging back to me if you want that built.

**Content rating questionnaire** — standard IARC form, answer based on real app content:
- Violence, sexual content, profanity, gambling, controlled substances: **None** (it's a general marketplace; you don't host user-generated adult content categories)
- User-generated content: **Yes** (product listings, reviews) — this typically triggers a moderate rating regardless of your other answers, since Google assumes UGC could theoretically include anything
- User-to-user communication: **Yes** (WhatsApp handoff, seller contact) — flag this honestly, it affects the rating slightly

## 5. Store listing

Already drafted — see [`play-store-listing.md`](./play-store-listing.md) in this same folder. Graphics are in `play-store-assets/`.

## 6. Reviewer access

Play Console will ask how a reviewer can test the app if login is required. Give them a real test account (email/password) that has both a buyer and seller profile set up, so the reviewer can see the full flow — checkout, seller portal, everything. Worth creating one dedicated test account now rather than handing over a real one.

---

**Bottom line — what's actually yours to do next:** create the account, pay the $25, decide the developer-name wording, and get the closed-testing build out to 12 people. Everything else above is a ready answer for when the corresponding question shows up.
