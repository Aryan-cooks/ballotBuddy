# Native Localization (i18n) Implementation Plan

We are going to remove the real-time Google Translate implementation and replace it with a proper, native localized system. This ensures the Hindi copy is natural, punchy, and UI-friendly rather than a literal machine translation.

## Proposed Changes

### 1. Stop Google Translate
We will rip out the `googtrans` cookie logic and the `window.location.reload()` hack in `AppLayout.jsx`. 

### 2. Native Translation Context
We will create a lightweight `TranslationContext.jsx` to manage the language state (`en` vs `hi`) and provide a `t()` function to retrieve localized strings.

### 3. Localization Dictionaries
We will create two JSON files to store our curated UI copy. To start, we will translate the core Home Dashboard experience.

**`src/locales/en.json`:**
```json
{
  "tagline": "Your smart companion for a confident democratic journey. Learn, verify, and vote!",
  "welcome": "Welcome to BallotBuddy!",
  "enterPin": "Enter your 6-digit PIN code to personalize your election timeline.",
  "personalizeBtn": "Personalize My App",
  "myProgress": "My Progress",
  "democracyScore": "Democracy Score"
}
```

**`src/locales/hi.json`:**
```json
{
  "tagline": "जानें • समझें • वोट करें",
  "welcome": "BallotBuddy में आपका स्वागत है!",
  "enterPin": "अपनी चुनाव टाइमलाइन देखने के लिए अपना 6-अंकों का पिन कोड दर्ज करें।",
  "personalizeBtn": "ऐप पर्सनलाइज़ करें",
  "myProgress": "मेरी प्रगति",
  "democracyScore": "डेमोक्रेसी स्कोर"
}
```

### 4. Language-Specific Tweaks (Design for Hindi)
When Hindi is active, we will attach a `lang-hi` class to the body. We will add specific CSS rules in `index.css`:
```css
body.lang-hi {
  line-height: 1.6;
}
body.lang-hi .tagline {
  max-width: 300px;
  font-weight: 600;
}
```

### Files to Modify:

#### [NEW] [src/context/TranslationContext.jsx](file:///d:/vibe%20coding/Prompt%20War%20-%20Challenge%202/src/context/TranslationContext.jsx)
- Creates the context and hook `useTranslation`.

#### [NEW] [src/locales/en.json](file:///d:/vibe%20coding/Prompt%20War%20-%20Challenge%202/src/locales/en.json)
- English dictionary.

#### [NEW] [src/locales/hi.json](file:///d:/vibe%20coding/Prompt%20War%20-%20Challenge%202/src/locales/hi.json)
- Curated, natural Hindi dictionary.

#### [MODIFY] [App.jsx](file:///d:/vibe%20coding/Prompt%20War%20-%20Challenge%202/src/App.jsx)
- Wrap the app in `TranslationProvider`.

#### [MODIFY] [AppLayout.jsx](file:///d:/vibe%20coding/Prompt%20War%20-%20Challenge%202/src/layouts/AppLayout.jsx)
- Remove `translatePage` logic.
- Connect the language selector to `useTranslation`.
- Toggle the `lang-hi` body class when Hindi is selected.

#### [MODIFY] [HomeDashboard.jsx](file:///d:/vibe%20coding/Prompt%20War%20-%20Challenge%202/src/pages/HomeDashboard.jsx)
- Replace hardcoded English strings with `t('key')` calls using `useTranslation()`.

#### [MODIFY] [index.css](file:///d:/vibe%20coding/Prompt%20War%20-%20Challenge%202/src/index.css)
- Add typography and layout tweaks for `.lang-hi`.

## User Review Required
Please review the proposed plan and the curated Hindi strings for the Dashboard. If this approach looks good, I will execute it and we can gradually move the rest of the application's strings into the dictionary later!
