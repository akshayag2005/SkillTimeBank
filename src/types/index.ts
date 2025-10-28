// Simple types for Community TimeBank

export interface User {
  username: string;
  balance: number;
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  timeCredits: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'AWAITING_CONFIRMATION' | 'COMPLETED';
  poster: string;
  acceptedBy?: string;
}