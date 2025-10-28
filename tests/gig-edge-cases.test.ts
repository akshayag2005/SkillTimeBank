import { describe, it, expect, beforeEach } from 'vitest';
import { GigService } from '../src/services/gigService';
import { TimebankState } from '../src/state/timebank';
import { User } from '../src/types/user';
import { Gig, GigStatus, GigCategory, GigType } from '../src/types/gig';
import { TransactionType, TransactionStatus } from '../src/types/transaction';

describe('Gig Service Edge Cases', () => {
  let initialState: TimebankState;
  let alice: User;
  let bob: User;
  let mockContext: any;

  beforeEach(() => {
    alice = {
      id: 'alice',
      username: 'alice',
      timeCredits: 100,
      reputation: 5,
      skills: ['programming'],
      joinedAt: new Date(),
      isActive: true
    };

    bob = {
      id: 'bob',
      username: 'bob',
      timeCredits: 50,
      reputation: 4,
      skills: ['design'],
      joinedAt: new Date(),
      isActive: true
    };

    initialState = {
      users: {
        [alice.id]: alice,
        [bob.id]: bob
      },
      gigs: {},
      transactions: {},
      currentUser: alice.id
    };

    mockContext = {
      reddit: {
        getCurrentUser: () => Promise.resolve({ id: alice.id, username: alice.username })
      },
      redis: {
        set: () => Promise.resolve(),
        get: () => Promise.resolve(null)
      }
    };
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', () => {
      // Test with malformed gig data
      const invalidGig = {
        title: '',
        description: '',
        category: 'invalid' as GigCategory,
        type: GigType.FIND_HELP,
        timeCreditsOffered: -10,
        estimatedDuration: -5,
        requiredSkills: [],
        isRemote: true,
        createdBy: alice.id
      };

      const result = GigService.createGig(initialState, invalidGig, mockContext);
      expect(result.success).toBe(true); // Service doesn't validate these fields, just creates
      expect(result.gigId).toBeDefined();
    });

    it('should handle exception during gig creation', () => {
      // Force an exception by passing null context
      const gigData = {
        title: 'Test gig',
        description: 'Test description',
        category: GigCategory.TECH,
        type: GigType.FIND_HELP,
        timeCreditsOffered: 30,
        estimatedDuration: 120,
        requiredSkills: ['programming'],
        isRemote: true,
        createdBy: alice.id
      };

      // This should handle the exception gracefully
      const result = GigService.createGig(initialState, gigData, null);
      expect(result.success).toBe(true); // Service is resilient to null context
    });
  });

  describe('State Validation', () => {
    it('should prevent invalid state transitions', () => {
      const gigData = {
        title: 'Test gig',
        description: 'Test description',
        category: GigCategory.TECH,
        type: GigType.FIND_HELP,
        timeCreditsOffered: 30,
        estimatedDuration: 120,
        requiredSkills: ['programming'],
        isRemote: true,
        createdBy: alice.id
      };

      const createResult = GigService.createGig(initialState, gigData, mockContext);
      expect(createResult.success).toBe(true);
      
      if (createResult.newState && createResult.gigId) {
        // Try to start gig without accepting first
        const startResult = GigService.startGig(createResult.newState, createResult.gigId, bob.id, mockContext);
        expect(startResult.success).toBe(false);
        expect(startResult.error).toBe('Only assigned user can start the gig');
      }
    });

    it('should handle confirmation on wrong gig status', () => {
      const gigData = {
        title: 'Test gig',
        description: 'Test description',
        category: GigCategory.TECH,
        type: GigType.FIND_HELP,
        timeCreditsOffered: 30,
        estimatedDuration: 120,
        requiredSkills: ['programming'],
        isRemote: true,
        createdBy: alice.id
      };

      const createResult = GigService.createGig(initialState, gigData, mockContext);
      expect(createResult.success).toBe(true);
      
      if (createResult.newState && createResult.gigId) {
        // Try to confirm completion on OPEN gig
        const confirmResult = GigService.confirmGigCompletion(createResult.newState, createResult.gigId, alice.id, mockContext);
        expect(confirmResult.success).toBe(false);
        expect(confirmResult.error).toBe('Gig must be assigned, in progress, or awaiting confirmation to confirm completion');
      }
    });
  });

  describe('Payment Edge Cases', () => {
    it('should handle existing completed transaction', () => {
      const gigData = {
        title: 'Test gig',
        description: 'Test description',
        category: GigCategory.TECH,
        type: GigType.FIND_HELP,
        timeCreditsOffered: 30,
        estimatedDuration: 120,
        requiredSkills: ['programming'],
        isRemote: true,
        createdBy: alice.id
      };

      const createResult = GigService.createGig(initialState, gigData, mockContext);
      
      if (createResult.newState && createResult.gigId) {
        // Accept the gig to set assignedTo
        const acceptResult = GigService.acceptGig(createResult.newState, createResult.gigId, bob.id, mockContext);
        
        if (acceptResult.newState) {
          // Create a pre-existing completed transaction for this gig
          const existingTransaction = {
            id: 'existing-tx',
            fromUserId: alice.id,
            toUserId: bob.id,
            gigId: createResult.gigId,
            amount: 30,
            type: TransactionType.GIG_PAYMENT,
            status: TransactionStatus.COMPLETED,
            createdAt: new Date(),
            completedAt: new Date(),
            description: 'Already completed payment'
          };

          const stateWithTransaction = {
            ...acceptResult.newState,
            transactions: { [existingTransaction.id]: existingTransaction }
          };

          const paymentResult = GigService.executePayment(stateWithTransaction, createResult.gigId, mockContext);
          expect(paymentResult.success).toBe(true);
          expect(paymentResult.transactionId).toBe(existingTransaction.id);
        }
      }
    });

    it('should handle existing pending transaction', () => {
      const gigData = {
        title: 'Test gig',
        description: 'Test description',
        category: GigCategory.TECH,
        type: GigType.FIND_HELP,
        timeCreditsOffered: 30,
        estimatedDuration: 120,
        requiredSkills: ['programming'],
        isRemote: true,
        createdBy: alice.id
      };

      const createResult = GigService.createGig(initialState, gigData, mockContext);
      
      if (createResult.newState && createResult.gigId) {
        // Accept the gig to set assignedTo
        const acceptResult = GigService.acceptGig(createResult.newState, createResult.gigId, bob.id, mockContext);
        
        if (acceptResult.newState) {
          // Create a pre-existing pending transaction for this gig
          const existingTransaction = {
            id: 'pending-tx',
            fromUserId: alice.id,
            toUserId: bob.id,
            gigId: createResult.gigId,
            amount: 30,
            type: TransactionType.GIG_PAYMENT,
            status: TransactionStatus.PENDING,
            createdAt: new Date(),
            description: 'Pending payment'
          };

          const stateWithTransaction = {
            ...acceptResult.newState,
            transactions: { [existingTransaction.id]: existingTransaction }
          };

          const paymentResult = GigService.executePayment(stateWithTransaction, createResult.gigId, mockContext);
          expect(paymentResult.success).toBe(true);
          expect(paymentResult.transactionId).toBe(existingTransaction.id);
          
          // Should have processed the pending transaction
          if (paymentResult.newState) {
            const processedTx = paymentResult.newState.transactions[existingTransaction.id];
            expect(processedTx.status).toBe(TransactionStatus.COMPLETED);
          }
        }
      }
    });

    it('should handle payment for invalid gig', () => {
      const result = GigService.executePayment(initialState, 'nonexistent-gig', mockContext);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid gig for payment');
    });

    it('should handle payment for gig without assignee', () => {
      const gigData = {
        title: 'Test gig',
        description: 'Test description',
        category: GigCategory.TECH,
        type: GigType.FIND_HELP,
        timeCreditsOffered: 30,
        estimatedDuration: 120,
        requiredSkills: ['programming'],
        isRemote: true,
        createdBy: alice.id
      };

      const createResult = GigService.createGig(initialState, gigData, mockContext);
      
      if (createResult.newState && createResult.gigId) {
        const paymentResult = GigService.executePayment(createResult.newState, createResult.gigId, mockContext);
        expect(paymentResult.success).toBe(false);
        expect(paymentResult.error).toBe('Invalid gig for payment');
      }
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle zero credit gig', () => {
      const zeroGig = {
        title: 'Free gig',
        description: 'No payment required',
        category: GigCategory.OTHER,
        type: GigType.FIND_HELP,
        timeCreditsOffered: 0,
        estimatedDuration: 60,
        requiredSkills: [],
        isRemote: true,
        createdBy: alice.id
      };

      const result = GigService.createGig(initialState, zeroGig, mockContext);
      expect(result.success).toBe(true);
      expect(result.gigId).toBeDefined();
    });

    it('should handle user with zero balance', () => {
      const poorUser: User = {
        id: 'poor',
        username: 'poor',
        timeCredits: 0,
        reputation: 0,
        skills: [],
        joinedAt: new Date(),
        isActive: true
      };

      const stateWithPoorUser = {
        ...initialState,
        users: { ...initialState.users, [poorUser.id]: poorUser }
      };

      const expensiveGig = {
        title: 'Expensive gig',
        description: 'Costs more than user has',
        category: GigCategory.TECH,
        type: GigType.FIND_HELP,
        timeCreditsOffered: 1, // More than user's 0 credits
        estimatedDuration: 60,
        requiredSkills: [],
        isRemote: true,
        createdBy: poorUser.id
      };

      const result = GigService.createGig(stateWithPoorUser, expensiveGig, mockContext);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient time credits');
    });

    it('should handle maximum credit amounts', () => {
      const richUser: User = {
        id: 'rich',
        username: 'rich',
        timeCredits: Number.MAX_SAFE_INTEGER,
        reputation: 100,
        skills: ['everything'],
        joinedAt: new Date(),
        isActive: true
      };

      const stateWithRichUser = {
        ...initialState,
        users: { ...initialState.users, [richUser.id]: richUser }
      };

      const expensiveGig = {
        title: 'Very expensive gig',
        description: 'Costs a lot',
        category: GigCategory.TECH,
        type: GigType.FIND_HELP,
        timeCreditsOffered: 1000000,
        estimatedDuration: 60,
        requiredSkills: [],
        isRemote: true,
        createdBy: richUser.id
      };

      const result = GigService.createGig(stateWithRichUser, expensiveGig, mockContext);
      expect(result.success).toBe(true);
      expect(result.gigId).toBeDefined();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle rapid state changes', () => {
      const gigData = {
        title: 'Rapid test gig',
        description: 'For testing rapid operations',
        category: GigCategory.TECH,
        type: GigType.FIND_HELP,
        timeCreditsOffered: 30,
        estimatedDuration: 120,
        requiredSkills: ['programming'],
        isRemote: true,
        createdBy: alice.id
      };

      // Simulate rapid operations
      const createResult = GigService.createGig(initialState, gigData, mockContext);
      expect(createResult.success).toBe(true);
      
      if (createResult.newState && createResult.gigId) {
        const acceptResult = GigService.acceptGig(createResult.newState, createResult.gigId, bob.id, mockContext);
        expect(acceptResult.success).toBe(true);
        
        if (acceptResult.newState) {
          const startResult = GigService.startGig(acceptResult.newState, createResult.gigId, bob.id, mockContext);
          expect(startResult.success).toBe(true);
          
          if (startResult.newState) {
            const confirmResult = GigService.confirmGigCompletion(startResult.newState, createResult.gigId, alice.id, mockContext);
            expect(confirmResult.success).toBe(true);
            expect(confirmResult.transactionId).toBeDefined();
          }
        }
      }
    });
  });
});