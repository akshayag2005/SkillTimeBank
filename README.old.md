# Community Timebank

A Devvit Web Interactive Post app that enables community members to exchange time and skills through a time-based credit system.

## Features

- Time credit system for fair exchange
- Gig posting and browsing
- User profiles with skills and reputation
- Transaction tracking
- Tailwind CSS styling

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev:run

# Upload to Reddit
npm run dev:upload

# Run tests
npm test
```

## Admin Toolkit

TimeBank includes administrative tools for community management:

```bash
# Award credits to users
npm run admin:award-credit -- --username "john_doe" --amount 50 --reason "Community contribution"

# Reset economy (not yet implemented)
npm run admin:reset-economy -- --confirm-reset --backup-file ./backup.json

# Ban users (not yet implemented)  
npm run admin:ban-user -- --username "spammer" --reason "Inappropriate content"
```

See [docs/ADMIN_TOOLKIT.md](docs/ADMIN_TOOLKIT.md) for complete documentation.

## Project Structure

- `src/types/` - TypeScript type definitions
- `src/state/` - State management with Devvit useState
- `src/main.tsx` - Main app component
- `src/styles.css` - Tailwind CSS styles
