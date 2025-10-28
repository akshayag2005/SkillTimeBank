import { User } from '../types/user.js';
import { Gig } from '../types/gig.js';
import { Transaction } from '../types/transaction.js';
import { WeeklyEvent } from '../types/event.js';
import { LeaderboardEntry, UserStats, CommunityAnalytics } from '../types/leaderboard.js';
import { ModerationAction, Dispute, UserModerationStatus } from '../types/moderation.js';

export interface TimebankState {
  users: Record<string, User>;
  gigs: Record<string, Gig>;
  transactions: Record<string, Transaction>;
  weeklyEvents: Record<string, WeeklyEvent>;
  leaderboards: Record<string, LeaderboardEntry[]>;
  userStats: Record<string, UserStats>;
  communityAnalytics?: CommunityAnalytics;
  moderationActions: Record<string, ModerationAction>;
  disputes: Record<string, Dispute>;
  userModerationStatus: Record<string, UserModerationStatus>;
  currentUser?: string;
}

const initialState: TimebankState = {
  users: {},
  gigs: {},
  transactions: {},
  weeklyEvents: {},
  leaderboards: {},
  userStats: {},
  moderationActions: {},
  disputes: {},
  userModerationStatus: {},
  currentUser: undefined
};

export const TIMEBANK_STATE_KEY = 'timebank:state';

export function getInitialState(): TimebankState {
  return initialState;
}

// This function should be called from components where Devvit is available
// Components should import Devvit and use: const [state, setState] = createTimebankState(Devvit);
export function createTimebankState(Devvit: any) {
  return Devvit.useState(TIMEBANK_STATE_KEY, initialState);
}

// Legacy function for backward compatibility - components should migrate to createTimebankState
export function useTimebankState(): [TimebankState, (state: TimebankState) => void] {
  // This is a placeholder that will be replaced by the component's implementation
  return [initialState, () => {}];
}

export async function saveState(state: TimebankState, context: any) {
  try {
    await context.redis.set(TIMEBANK_STATE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Failed to save timebank state:', error);
    return false;
  }
}

export async function loadState(context: any): Promise<TimebankState> {
  try {
    const saved = await context.redis.get(TIMEBANK_STATE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load timebank state:', error);
  }
  return initialState;
}

// Helper functions for state management
export function addUser(state: TimebankState, user: User): TimebankState {
  return {
    ...state,
    users: {
      ...state.users,
      [user.id]: user
    }
  };
}

export function addGig(state: TimebankState, gig: Gig): TimebankState {
  return {
    ...state,
    gigs: {
      ...state.gigs,
      [gig.id]: gig
    }
  };
}

export function addTransaction(state: TimebankState, transaction: Transaction): TimebankState {
  return {
    ...state,
    transactions: {
      ...state.transactions,
      [transaction.id]: transaction
    }
  };
}