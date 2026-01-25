# Lena - Project Handoff Note

## What is Lena?

Lena is an iPhone app that helps users maintain meaningful friendships by tracking birthdays, life events, and reminding them to stay in touch with the people who matter.

**Core Problem:** The user (Francesco) always forgets friends' birthdays, life events, who to call, and who hasn't been called in a while.

---

## Decisions Made During Planning

These were discussed and agreed upon with Francesco:

| Decision | Choice |
|----------|--------|
| **Tech Stack** | React Native (Expo) with TypeScript |
| **Data Storage** | Local only (SQLite via expo-sqlite) - no cloud sync for MVP |
| **Home Screen** | Timeline feed with smart suggestions |
| **Friend Data** | Basics (name, photo, birthday, phone, city, relationship type) + interaction history |
| **Interaction Logging** | Quick notes after each interaction |
| **Notifications** | Individual push alerts for birthdays and check-ins |
| **Contacts** | Full sync with iPhone Contacts |
| **Design Style** | Soft & warm (Headspace-like) - pastel colors, rounded cards |
| **MVP Scope** | Core features only - ship fast |

---

## Current Status: MVP COMPLETE

All core features have been implemented:

### Screens
- **HomeScreen** - Timeline showing birthdays today, upcoming birthdays, and "haven't talked in X days" suggestions
- **FriendsScreen** - Searchable list of friends with attention indicators
- **FriendDetailScreen** - Profile with info cards, interaction history, call/message buttons
- **AddFriendScreen** - Form to add/edit friends with photo picker
- **SettingsScreen** - Notification toggles, default frequency settings
- **ImportContactsScreen** - Import friends from iPhone Contacts

### Services
- **database.ts** - SQLite with friends, interactions, reminders, settings tables
- **contacts.ts** - expo-contacts integration for importing
- **notifications.ts** - expo-notifications for birthday/check-in alerts

### Components
- **FriendCard** - Card showing friend with last contact info
- **TimelineCard** - Card for timeline events (birthdays, suggestions)
- **QuickLogModal** - Bottom sheet for logging interactions with quick presets
- **EmptyState** - Friendly empty states with action buttons

---

## Design System

```
Colors:
- Background: #FAFAFA (soft white)
- Card: #FFFFFF
- Primary: #7C9EB2 (soft blue)
- Secondary: #E8B4BC (soft pink)
- Accent: #9DD9A8 (soft green)
- Text: #2D3436 / #636E72

Style: Rounded corners (16px cards, 12px buttons), soft shadows, pastel badges
```

---

## How to Run

```bash
cd ~/Lena
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
npx expo start
```

Then scan QR with Expo Go app on iPhone, or press `i` for iOS Simulator.

**Note:** iOS Simulator may need to be set up in Xcode > Settings > Platforms first.

---

## What Could Be Added Next

1. **Date picker** for birthday input (currently manual YYYY-MM-DD)
2. **Better notification scheduling** - actually schedule recurring notifications
3. **Life events tracking** - beyond birthdays (job changes, moves, weddings, etc.)
4. **iCloud sync** - sync data across devices
5. **Widgets** - iOS home screen widget showing upcoming birthdays
6. **App icon & splash screen** - custom branding
7. **TestFlight build** - prepare for beta testing

---

## File Structure

```
Lena/
├── App.tsx                           # Entry point
├── src/
│   ├── theme/index.ts                # Design tokens
│   ├── types/index.ts                # TypeScript interfaces
│   ├── store/useStore.ts             # Zustand state
│   ├── services/
│   │   ├── database.ts               # SQLite
│   │   ├── contacts.ts               # Contacts import
│   │   └── notifications.ts          # Push notifications
│   ├── navigation/index.tsx          # React Navigation
│   ├── screens/                      # 6 screens
│   └── components/                   # 4 reusable components
```

---

## Known Issues

- No iOS Simulator runtime was available during development - needs Xcode setup
- Birthday input is manual text (YYYY-MM-DD) - should add date picker

---

*Created: January 2026*
*Last updated by: Claude (Opus 4.5)*
