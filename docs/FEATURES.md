# Features

A grouped, scannable list of what Alongside currently does.

## Authentication
- Email + password sign-in and sign-up.
- Google OAuth.
- Password reset flow with dedicated landing route.
- Session-aware redirects: unauthenticated users land on `/auth`; users without completed onboarding are routed through it before reaching Today.

## Onboarding
- Two-tile entry chooser: *Let me process this a bit more* vs *Show me what needs to be done*.
- Multi-step intake (`/care-journey-intro`):
  - Inline pill-style relationship picker (Son, Daughter, Spouse, Grandchild, Sibling, Parent, Friend, custom).
  - Diagnosis stage (recently diagnosed → advanced → not sure).
  - Emotional check-in with line iconography per option (Overwhelmed, Numb, Anxious, Lost, Trying to stay strong, Managing okay).
  - Priorities multi-select (what would help most right now).
- Progress dots and back/continue navigation.
- Personalized confirmation screen using the caregiver's name when provided.

## Today (home)
- Greeting tuned to time of day and the user's emotional state.
- Curated cards: subsidies, key questions, capture a moment, family update, rest, breathing, send a message.
- Always-available links into Care Journey, Moments and Support.

## Care Journey
- Structured checklist of next steps grouped by domain (medical, legal, financial, emotional).
- Singapore-specific resource carousel (subsidies, hospice, helplines, official guidance).
- Progress tracking — see how many steps are complete.

## Moments
- Capture photos, short video, or voice notes against a title and date.
- AI-suggested bucket-list ideas via the `suggest-bucket-ideas` edge function (Lovable AI Gateway, no user API key required).
- Seeded demo moments shown to new users; cleared automatically the moment the user adds their first real entry.
- Shareable read-only scrapbook link for family members.

## Support
- Guided breathing exercise.
- Singapore helplines: SOS (1-767), AIC Caregiver Support (1800 650 6060), Singapore Hospice Council (6538 2231), Emergency (995).
- Self-care prompts and quiet content.

## Family
- Add and manage family members (name, relationship, optional email).
- `/family` route consolidates into the family section of `/support`.
- Share moments with family via tokenized public scrapbook.

## Public Scrapbook
- Tokenized, read-only view of selected moments at `/scrapbook/$token`.
- Backed by the `public-scrapbook` edge function — no auth required for viewers.

## Design system
- `oklch` semantic tokens defined in `src/styles.css`.
- Paper textures, serif headings, Inter body, generous spacing.
- Framer Motion page and element transitions throughout.
- Fully responsive; works on phone, tablet, and desktop.
