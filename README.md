# Lena

As I've moved around and built friendships across different cities, I've noticed something: it's surprisingly easy to lose touch with the people who matter most. Not because you stop caring — but because life gets busy, and before you know it, months have passed since you last spoke.

Lena is my answer to that. It's a personal relationship manager built for friendships — a place to remember birthdays, life events, and the little things that make staying in touch feel meaningful rather than transactional. It reminds me when to reach out, tracks when I last spoke to someone, and helps me be the kind of friend I actually want to be.

---

## What it does

- **Timeline feed** — shows who has a birthday coming up, who you haven't spoken to in a while, and who deserves a catch-up
- **Friend profiles** — store birthdays, phone numbers, cities, and interaction history
- **Quick logging** — log a call, coffee, or message in seconds after it happens
- **Smart reminders** — get notified before birthdays and when it's been too long since you last talked
- **Contact import** — pull friends straight from your iPhone contacts
- **Tiers** — organize friends into Clique, Good friends, and Catch-up groups

---

## How it's built

- **React Native + Expo** — cross-platform mobile app written in TypeScript
- **SQLite (expo-sqlite)** — all data stored locally on device, no cloud, no accounts
- **Zustand** — lightweight state management
- **React Navigation** — tab and stack navigation
- **expo-notifications** — birthday and check-in reminders
- **expo-contacts** — import from iPhone contacts

---

## Running locally

```bash
cd ~/Lena
npx expo start
```

Then scan the QR code with Expo Go on your iPhone, or press `i` for the iOS Simulator.
