# Lena UI Polish Plan - Phase 2

## Goal
Make Lena feel more premium with vibrant colors, better contrast, and interactive elements.

**User Feedback:**
- "Need more color" - Current soft/muted palette feels dull
- "Background too grey" - #FAFAFA feels too neutral
- "All chips editable" - Info chips in Friend Detail should be tappable

---

## 1. Vibrant Color Palette Update

### Current vs New Colors

| Element | Current (Muted) | New (Vibrant) |
|---------|----------------|---------------|
| Background | `#FAFAFA` (grey) | `#FFF9F5` (warm cream) |
| Primary | `#7C9EB2` (soft blue) | `#4A90D9` (vibrant blue) |
| Secondary | `#E8B4BC` (soft pink) | `#FF6B9D` (vibrant pink) |
| Accent | `#9DD9A8` (soft green) | `#34D399` (vibrant mint) |

### Files to Modify
- `src/theme/index.ts` - Update all color values
- `src/types/index.ts` - Update RELATIONSHIP_COLORS and TIER_COLORS to match new palette

### New Color Scheme
```typescript
// Warm cream background - not grey, not cold
background: '#FFF9F5',

// Vibrant primary blue - energetic, friendly
primary: '#4A90D9',
primaryLight: '#7CB3F0',
primaryDark: '#2B6CB0',

// Vibrant pink/coral - warm, inviting
secondary: '#FF6B9D',
secondaryLight: '#FFB8D1',
secondaryDark: '#E05086',

// Vibrant mint green - fresh, positive
accent: '#34D399',
accentLight: '#6EE7B7',
accentDark: '#10B981',
```

---

## 2. Editable Info Chips (FriendDetailScreen)

### Current State
Info chips (Birthday, Last Seen, Tier) are display-only

### New Design: Tappable Chips with Edit Actions

```
┌─────────────────────────────────────┐
│ Hero Card                           │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │🎂 May 15│ │📅 14 days│ │⭐ Top  │ │
│  │Birthday→│ │Frequency→│ │ Tier →│ │
│  └─────────┘ └─────────┘ └────────┘ │
│  (tap edit)  (tap edit)  (tap edit) │
└─────────────────────────────────────┘
```

### Implementation

**A. Birthday Chip → Date Picker Modal**
- Tap opens date picker
- Shows current birthday or "Add birthday"
- Updates friend.birthday on save

**B. Frequency Chip → Selection Modal** (NEW - replace "Last Seen")
- Shows current contact frequency (e.g., "Every 2 weeks")
- Tap opens picker: 1 week, 2 weeks, 1 month, 3 months
- Updates friend.contactFrequencyDays

**C. Tier Chip → Selection Modal**
- Shows current tier (Top, Close, Cordialities, Other)
- Tap opens picker with all tier options
- Updates friend.tier

### New Components
- `src/components/EditChipModal.tsx` - Generic modal for chip editing (tier, frequency)
- `src/components/DatePickerModal.tsx` - Date picker for birthday

### Changes to FriendDetailScreen
- Wrap chips in TouchableOpacity
- Add state for edit modals
- Add updateFriend calls on save
- Add visual indicator that chips are tappable (subtle chevron or edit icon)

---

## 3. HomeScreen Improvements

### Current Issues
- Header feels plain
- Section titles lack personality
- No visual differentiation between urgency levels

### Improvements

**A. Header Enhancement**
- Add subtle colored accent to the title
- Make greeting more prominent

**B. Section Styling**
- Add colored accent to section titles
- Better visual hierarchy

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/theme/index.ts` | New vibrant color palette |
| `src/types/index.ts` | Update RELATIONSHIP_COLORS, TIER_COLORS |
| `src/screens/FriendDetailScreen.tsx` | Make chips tappable, add edit modals |
| `src/components/EditChipModal.tsx` | NEW - Generic selection modal |
| `src/components/DatePickerModal.tsx` | NEW - Birthday date picker |
| `src/screens/HomeScreen.tsx` | Enhanced header styling |
| `src/store/useStore.ts` | Ensure updateFriend handles tier/frequency/birthday |

---

## Implementation Order

1. **Step 1: Theme Colors**
   - Update `src/theme/index.ts` with vibrant palette
   - Update `src/types/index.ts` color constants
   - All screens automatically get new colors

2. **Step 2: Editable Chips**
   - Create EditChipModal component (reuses FilterModal pattern)
   - Create DatePickerModal component
   - Update FriendDetailScreen to use tappable chips
   - Wire up updateFriend for tier/frequency/birthday

3. **Step 3: HomeScreen Polish**
   - Enhance header styling with accent color

---

## Verification

1. **Colors**:
   - Background should be warm cream, not grey
   - Primary actions (buttons, badges) should feel vibrant
   - All text should have good contrast

2. **Editable Chips**:
   - Tap birthday chip → date picker opens
   - Tap tier chip → tier selector opens
   - Tap frequency chip → frequency selector opens
   - Changes persist after closing and reopening friend

3. **Test command:**
```bash
npx expo start
```
Test on iPhone via Expo Go.
