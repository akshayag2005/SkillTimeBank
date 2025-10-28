# TimeBank Admin Toolkit

This document provides comprehensive information about the administrative tools available for managing the TimeBank community platform.

## Overview

The TimeBank Admin Toolkit consists of command-line scripts that allow administrators to manage users, transactions, and the overall economy. All admin actions are logged and create audit trails for transparency and accountability.

## Prerequisites

- Node.js and npm installed
- Access to the TimeBank state file (`timebank-state.json`)
- Administrative privileges
- TypeScript execution environment (`npx tsx` or similar)

## Available Scripts

### 1. Award Credits (`award-credit.ts`)

Awards time credits to a specific user and creates an admin transaction record.

**Usage:**
```bash
npx tsx src/scripts/award-credit.ts --username <username> --amount <amount> --reason <reason>
```

**Parameters:**
- `--username`: Target username to award credits to (required)
- `--amount`: Number of time credits to award (positive integer, required)
- `--reason`: Reason for the credit award (required)

**Example:**
```bash
npx tsx src/scripts/award-credit.ts --username "john_doe" --amount 50 --reason "Community contribution bonus"
```

**What it does:**
1. Loads current TimeBank state
2. Finds user by username
3. Increments user's time credit balance
4. Creates an `ADMIN_AWARD` transaction record
5. Saves updated state with audit trail

**Safety Features:**
- Validates user exists before proceeding
- Shows current and new balance before confirmation
- Creates permanent transaction record
- Handles system user creation automatically

### 2. Reset Economy (`reset-economy.ts`) 🚧

**Status:** Not yet implemented - stub with safety prompts

Completely resets the TimeBank economy while preserving user accounts.

**Usage:**
```bash
npx tsx src/scripts/reset-economy.ts --confirm-reset --backup-file <backup-path>
```

**Parameters:**
- `--confirm-reset`: Required safety flag to confirm destructive action
- `--backup-file`: Path where current state will be backed up (required)

**Example:**
```bash
npx tsx src/scripts/reset-economy.ts --confirm-reset --backup-file ./backup-$(date +%Y%m%d).json
```

**Planned Functionality:**
- Reset all user balances to signup bonus amount (1 TC)
- Clear all gig history
- Clear all transaction history (except signup bonuses)
- Preserve user accounts and profiles
- Create comprehensive backup before reset
- Interactive confirmation prompts

**Safety Requirements:**
- Must provide confirmation flag
- Must specify backup file location
- Additional interactive confirmation required
- Creates rollback capability

### 3. Ban User (`ban-user.ts`) 🚧

**Status:** Not yet implemented - stub with safety prompts

Bans a user from TimeBank and handles cleanup of their activities.

**Usage:**
```bash
npx tsx src/scripts/ban-user.ts --username <username> --reason <reason> [--freeze-credits]
```

**Parameters:**
- `--username`: Username of the user to ban (required)
- `--reason`: Clear reason for the ban (required, will be logged)
- `--freeze-credits`: Freeze user's time credits (optional)

**Example:**
```bash
npx tsx src/scripts/ban-user.ts --username "problematic_user" --reason "Violating community guidelines" --freeze-credits
```

**Planned Functionality:**
- Mark user account as inactive/banned
- Cancel all their open gigs
- Handle in-progress gigs (refunds, reassignments)
- Create audit trail of ban action
- Optionally freeze time credits
- Display user activity summary before ban

**Safety Requirements:**
- Must provide clear reason for ban
- Shows user's current activity before proceeding
- Interactive confirmation required
- Creates permanent audit record
- Rollback/unban capability planned

## Transaction Types

The admin toolkit creates specific transaction types for audit purposes:

- `ADMIN_AWARD`: Credits awarded by administrators
- `SIGNUP_BONUS`: Initial credits given to new users
- `GIG_PAYMENT`: Payments for completed gigs
- `BONUS`: Performance or community bonuses
- `PENALTY`: Deductions for violations
- `REFUND`: Refunded payments

## State Management

All scripts operate on the `timebank-state.json` file which contains:

```typescript
interface TimebankState {
  users: Record<string, User>;
  gigs: Record<string, Gig>;
  transactions: Record<string, Transaction>;
  currentUser?: string;
}
```

## Security Considerations

1. **Access Control**: Admin scripts should only be run by authorized administrators
2. **Audit Trail**: All admin actions create permanent transaction records
3. **Backups**: Critical operations require backup creation
4. **Confirmation**: Destructive operations require multiple confirmations
5. **Logging**: All admin actions should be logged for review

## Best Practices

1. **Always backup** before running destructive operations
2. **Document reasons** for all administrative actions
3. **Review user activity** before taking moderation actions
4. **Test scripts** in development environment first
5. **Monitor impact** of administrative changes on community

## Troubleshooting

### Common Issues

1. **User not found**: Verify username spelling and case sensitivity
2. **State file missing**: Scripts will create new state if file doesn't exist
3. **Permission errors**: Ensure proper file system permissions
4. **Invalid amounts**: Credit amounts must be positive integers

### Recovery Procedures

1. **Backup restoration**: Copy backup file to `timebank-state.json`
2. **Transaction reversal**: Create offsetting admin transactions
3. **User restoration**: Manually edit state file if needed (with caution)

## Development

To add new admin scripts:

1. Create script in `src/scripts/` directory
2. Follow existing patterns for argument parsing and safety checks
3. Include comprehensive help text and examples
4. Add transaction logging for audit purposes
5. Update this documentation

## Support

For issues with admin tools:
1. Check script help text (`--help` flag)
2. Review transaction logs for audit trail
3. Consult backup files for state recovery
4. Contact development team for complex issues

---

*This documentation is auto-generated. Last updated: $(date)*