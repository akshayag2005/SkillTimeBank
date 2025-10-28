# Community TimeBank ⏰

**Trade skills with TimeCredits — 1 TC = 1 hour**

A Reddit-native skill exchange platform built with **Devvit Web Interactive Posts** for the Community Games Challenge. Help your community, earn credits, and build reputation—all within Reddit.

🏆 **Tagged for: Best Kiro Developer Experience Award**

## ✨ Features

### Core Functionality
- ✅ **Time Credits Economy**: Local currency where 1 TC = 1 hour of work
- ✅ **Gig Marketplace**: Post requests for help or offer your skills
- ✅ **Dual Confirmation**: Both parties must confirm before payment settles
- ✅ **Transaction History**: Complete audit trail of all credit transfers
- ✅ **Reputation System**: Build trust through completed gigs

### Community Play (Massively Multiplayer)
- 🏃 **Weekly Skill Swap Sprints**: Cooperative community goals with rewards
- 🏆 **Real-Time Leaderboards**: Top Helpers, Fastest Responders, Most Versatile
- 📊 **Community Analytics**: Track gigs completed, active participants, avg time-to-match
- 💬 **Comment Prompts**: Reddit-y engagement features
- ⭐ **Seasonal Rankings**: Quarterly resets for fresh competition

### Safety & Moderation
- 🛡️ **Rate Limits**: Configurable per trust level (New/Trusted/Veteran)
- ⚖️ **Dispute Workflow**: 24-hour dispute window with escrow holds
- 👮 **Mod Panel**: Freeze users, award credits, resolve disputes
- 📝 **Audit Log**: Immutable record of all moderator actions
- 🔒 **Minimum Reputation**: Prevent spam from new accounts

### UX & Polish
- 🎨 **Custom Splash Screen**: Onboarding with 3 clear CTAs
- ⚡ **Optimistic UI**: Instant feedback, smooth interactions
- 💀 **Skeleton States**: Loading placeholders for better perceived performance
- ♿ **Accessibility**: Keyboard navigation, ARIA labels, high contrast option
- 📱 **Responsive**: Desktop-first (for judging) with mobile support

### Kiro Developer Experience
- 📋 **6 Domain Specs**: Requirements-driven development in `.kiro/specs/`
- 🔧 **Code Generation**: Auto-generate services, types, and tests
- 🎯 **Steering Orchestration**: Declarative workflow automation
- ⏱️ **~1,050 lines saved**: Quantified boilerplate reduction
- 📚 **5 Reusable Patterns**: Documented for community adoption

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run local playtest
npm run dev:run

# Upload to Reddit
npm run dev:upload

# Run tests
npm test

# Type check
npm run typecheck
```

### Kiro Workflow

```bash
# Generate service scaffolds from specs
npm run kiro:generate-services

# Generate types from requirements
npm run kiro:generate-types

# Sync test scaffolds
npm run kiro:sync-tests

# Regenerate admin documentation
npm run kiro:regen-admin-docs
```

### Admin Tools

```bash
# Award time credits to users
npm run admin:award-credit -- --username "alice" --amount 50 --reason "Great contribution"

# Ban/freeze abusive users
npm run admin:ban-user -- --username "spammer" --reason "Repeated spam"

# Reset economy (emergency only)
npm run admin:reset-economy
```

### Demo & Submission

```bash
# Create demo post with seed data
npm run demo:create-post

# Print submission assets for Devpost
npm run submit:assets
```

## 📁 Project Structure

```
SkillTimeBank/
├── .kiro/                      # Kiro specs, hooks & steering
│   ├── specs/                  # Domain requirements (6 specs)
│   │   ├── gig-lifecycle/
│   │   ├── timecredits-economy/
│   │   ├── weekly-events/
│   │   ├── leaderboards/
│   │   ├── moderation-trust/
│   │   └── first-screen/
│   ├── hooks/                  # Code generation scripts
│   │   ├── generate-services.kiro.ts
│   │   └── ...
│   └── steering/               # Workflow orchestration
│       └── gig-lifecycle-orchestration.md
├── src/
│   ├── main.tsx                # Devvit entry point
│   ├── app/
│   │   └── App.tsx             # Main app component
│   ├── components/             # UI components
│   │   ├── EnhancedSplashScreen.tsx
│   │   ├── WeeklyEventCard.tsx
│   │   ├── LeaderboardDisplay.tsx
│   │   └── ...
│   ├── services/               # Business logic
│   │   ├── gigService.ts
│   │   ├── userService.ts
│   │   ├── eventService.ts
│   │   ├── leaderboardService.ts
│   │   └── moderationService.ts
│   ├── state/                  # State management
│   │   └── timebank.ts
│   ├── types/                  # TypeScript types
│   │   ├── gig.ts
│   │   ├── user.ts
│   │   ├── event.ts
│   │   ├── leaderboard.ts
│   │   └── moderation.ts
│   └── scripts/                # Admin utilities
│       ├── award-credit.ts
│       ├── ban-user.ts
│       └── reset-economy.ts
├── scripts/                    # Build & demo scripts
│   ├── create-demo-post.ts
│   └── submit-assets.ts
├── docs/
│   ├── APP_LISTING.md          # Full app documentation
│   ├── KIRO_EXPERIENCE.md      # Kiro metrics & patterns
│   └── ADMIN_TOOLKIT.md        # Moderator guide
├── tests/                      # Vitest test suite
│   ├── timebank.test.ts
│   ├── integration.test.ts
│   └── gig-edge-cases.test.ts
└── devvit.yaml                 # Devvit configuration
```

## 📖 Documentation

- 📖 **[App Listing](docs/APP_LISTING.md)** - Complete feature documentation
- 🏆 **[Kiro Experience](docs/KIRO_EXPERIENCE.md)** - Developer experience metrics
- 👮 **[Admin Toolkit](docs/ADMIN_TOOLKIT.md)** - Moderation guide
- 📹 **[Demo Video](https://youtu.be/PASTE_ID)** - 3-minute walkthrough

## 🛠️ Technologies

- **Devvit Web**: Reddit's custom post framework
- **TypeScript**: Type-safe development
- **Vitest**: Fast unit testing
- **Tailwind CSS**: Utility-first styling (PostCSS)
- **Kiro**: Code generation & requirements-driven development

## 🏆 Kiro Highlights

### Specs-First Development
Every feature starts with a requirements document in `.kiro/specs/`. Example:

```markdown
**User Story:** As a community member, I want to accept available gigs

**Acceptance Criteria:**
1. WHEN a user attempts to accept a gig, THE system SHALL verify user is not the poster
2. IF a user attempts to accept their own gig, THEN THE system SHALL prevent acceptance
```

### Code Generation
Run `npm run kiro:generate-services` to scaffold services from specs:

```typescript
// Auto-generated with error handling
export class GigService {
  static acceptGig(
    state: TimebankState,
    gigId: string,
    userId: string
  ): { success: boolean; newState?: TimebankState; error?: string } {
    try {
      // Implement from spec acceptance criteria
    } catch (error) {
      return { success: false, error: 'Failed to accept gig' };
    }
  }
}
```

### Metrics
- **~1,050 lines** of boilerplate avoided
- **~4 hours saved** per feature iteration
- **5 reusable patterns** documented for community

See [KIRO_EXPERIENCE.md](docs/KIRO_EXPERIENCE.md) for full details.

## 🎮 Community Games Challenge

This project is built for the **Reddit Community Games Challenge** with focus on:

✅ **Devvit Web + Interactive Posts** (desktop-first, fast, self-explanatory)  
✅ **Delightful UX** (custom splash, onboarding, smooth performance)  
✅ **Community Play** (weekly sprints, leaderboards, cooperative goals)  
✅ **Reddit-y Feel** (comment prompts, native to Reddit)  
✅ **Moderation Tools** (disputes, freezes, audit logs)  
✅ **Kiro Developer Experience** (specs, generation, patterns)  

### Judging Criteria Coverage

| Criterion | Implementation |
|-----------|----------------|
| Delightful UX | Custom splash, skeleton states, optimistic UI |
| Community Play | Weekly sprints, leaderboards, analytics |
| Polish | Responsive, accessible, keyboard nav |
| Reddit-y | Comment integration, native feel |
| Desktop Performance | Lazy loading, caching, <2s load |

## 📜 License

**MIT License** - Fully open source

## 🎯 Submission

🏆 **Awards Targeted:**
- Best Kiro Developer Experience (primary)
- Community Games Challenge (general)

📋 **Submission Assets:**
- App Listing: [docs/APP_LISTING.md](docs/APP_LISTING.md)
- Demo Post: [Create with `npm run demo:create-post`]
- Video: [3-minute desktop walkthrough]
- GitHub: [This repository]
- Kiro Docs: [docs/KIRO_EXPERIENCE.md](docs/KIRO_EXPERIENCE.md)

Run `npm run submit:assets` for Devpost-ready links.

## 🤝 Contributing

Contributions welcome! This project demonstrates patterns that can be reused:
- `.kiro/` structure for your own projects
- Service patterns for Devvit apps
- State management for complex Reddit apps
- Testing strategies for interactive posts

## 📧 Contact

- **Issues**: [GitHub Issues](https://github.com/akshayag2005/SkillTimeBank/issues)
- **Feedback**: [Developer Survey](https://forms.gle/example)
- **Demo**: [r/SkillTimeBank](https://reddit.com/r/SkillTimeBank)

---

Built with ❤️ for the Reddit Community Games Challenge
