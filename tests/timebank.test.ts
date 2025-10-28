import { describe, it, expect, beforeEach } from 'vitest';
import { TimeBankManager } from '../src/state/timebank';
import { User } from '../src/types/user';
import { Gig, GigStatus, GigCategory } from '../src/types/gig';
import { TransactionType, TransactionStatus } from '../src/types/transaction';

describe('TimeBankManager', () => {
  let timeBank: TimeBankManager;
  let alice: User;
  let bob: User;
  let testGig: Gig;

  beforeEach(() => {
    timeBank = new TimeBankManager();
    
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

    testGig = {
      id: 'gig1',
      title: 'Build a website',
      description: 'Need a simple website built',
      category: GigCategory.TECH,
      timeCreditsOffered: 30,
      estimatedDuration: 120,
      requiredSkills: ['programming'],
      isRemote: true,
      createdBy: alice.id,
      createdAt: new Date(),
      status: GigStatus.OPEN
    };

    timeBank.addUser(alice);
    timeBank.addUser(bob);
  });

  describe('Gig Creation and Management', () => {
    it('should create a gig successfully', () => {
      timeBank.createGig(testGig);
      const retrievedGig = timeBank.getGig(testGig.id);
      expect(retrievedGig).toEqual(testGig);
    });

    it('should prevent creating gig with non-OPEN status', () => {
      const invalidGig = { ...testGig, status: GigStatus.ASSIGNED };
      expect(() => timeBank.createGig(invalidGig)).toThrow('New gigs must have OPEN status');
    });
  });

  describe('Self-Accept Prevention', () => {
    it('should prevent user from accepting their own gig', () => {
      timeBank.createGig(testGig);
      expect(() => timeBank.acceptGig(testGig.id, alice.id)).toThrow('Cannot accept your own gig');
    });
  });

  describe('Double-Accept Race Condition', () => {
    it('should prevent double acceptance of the same gig', () => {
      timeBank.createGig(testGig);
      
      // First acceptance should succeed
      timeBank.acceptGig(testGig.id, bob.id);
      const gig = timeBank.getGig(testGig.id);
      expect(gig?.status).toBe(GigStatus.ASSIGNED);
      expect(gig?.assignedTo).toBe(bob.id);

      // Second acceptance should fail
      const charlie = { ...alice, id: 'charlie', username: 'charlie' };
      timeBank.addUser(charlie);
      expect(() => timeBank.acceptGig(testGig.id, charlie.id)).toThrow('Gig is not available for acceptance');
    });
  });

  describe('Insufficient Balance', () => {
    it('should prevent transaction when user has insufficient credits', () => {
      const poorUser = {
        id: 'poor',
        username: 'poor',
        timeCredits: 10, // Less than gig payment
        reputation: 1,
        skills: [],
        joinedAt: new Date(),
        isActive: true
      };
      
      timeBank.addUser(poorUser);
      
      const expensiveGig = { ...testGig, createdBy: poorUser.id, timeCreditsOffered: 50 };
      timeBank.createGig(expensiveGig);
      timeBank.acceptGig(expensiveGig.id, bob.id);
      timeBank.startGig(expensiveGig.id, bob.id);

      expect(() => timeBank.completeGig(expensiveGig.id, bob.id)).toThrow('Insufficient time credits');
    });
  });

  describe('Conflicting Confirmations', () => {
    it('should handle conflicting gig state changes', () => {
      timeBank.createGig(testGig);
      timeBank.acceptGig(testGig.id, bob.id);
      
      // Try to cancel after acceptance
      expect(() => timeBank.cancelGig(testGig.id, alice.id)).not.toThrow();
      
      const gig = timeBank.getGig(testGig.id);
      expect(gig?.status).toBe(GigStatus.CANCELLED);
    });

    it('should prevent cancellation of completed gig', () => {
      timeBank.createGig(testGig);
      timeBank.acceptGig(testGig.id, bob.id);
      timeBank.startGig(testGig.id, bob.id);
      timeBank.completeGig(testGig.id, bob.id);

      expect(() => timeBank.cancelGig(testGig.id, alice.id)).toThrow('Cannot cancel completed gig');
    });
  });

  describe('Idempotent Payment (No Double-Pay)', () => {
    it('should not create duplicate transactions', () => {
      const transaction = {
        id: 'tx1',
        fromUserId: alice.id,
        toUserId: bob.id,
        gigId: testGig.id,
        amount: 30,
        type: TransactionType.GIG_PAYMENT,
        status: TransactionStatus.PENDING,
        createdAt: new Date(),
        description: 'Test payment'
      };

      // Create transaction twice
      timeBank.createTransaction(transaction);
      timeBank.createTransaction(transaction); // Should be idempotent

      const retrievedTx = timeBank.getTransaction('tx1');
      expect(retrievedTx).toEqual(transaction);
    });

    it('should not process the same transaction twice', () => {
      const transaction = {
        id: 'tx2',
        fromUserId: alice.id,
        toUserId: bob.id,
        gigId: testGig.id,
        amount: 30,
        type: TransactionType.GIG_PAYMENT,
        status: TransactionStatus.PENDING,
        createdAt: new Date(),
        description: 'Test payment'
      };

      timeBank.createTransaction(transaction);
      
      // Process transaction twice
      timeBank.processTransaction('tx2');
      const aliceAfterFirst = timeBank.getUser(alice.id);
      const bobAfterFirst = timeBank.getUser(bob.id);
      
      timeBank.processTransaction('tx2'); // Should be idempotent
      const aliceAfterSecond = timeBank.getUser(alice.id);
      const bobAfterSecond = timeBank.getUser(bob.id);

      expect(aliceAfterFirst?.timeCredits).toBe(70);
      expect(bobAfterFirst?.timeCredits).toBe(80);
      expect(aliceAfterSecond?.timeCredits).toBe(70); // No change
      expect(bobAfterSecond?.timeCredits).toBe(80); // No change
    });
  });

  describe('Cancel-After-Accept', () => {
    it('should allow cancellation by gig creator after acceptance', () => {
      timeBank.createGig(testGig);
      timeBank.acceptGig(testGig.id, bob.id);
      
      // Creator can cancel
      timeBank.cancelGig(testGig.id, alice.id);
      
      const gig = timeBank.getGig(testGig.id);
      expect(gig?.status).toBe(GigStatus.CANCELLED);
    });

    it('should allow cancellation by assigned user', () => {
      timeBank.createGig(testGig);
      timeBank.acceptGig(testGig.id, bob.id);
      
      // Assigned user can cancel
      timeBank.cancelGig(testGig.id, bob.id);
      
      const gig = timeBank.getGig(testGig.id);
      expect(gig?.status).toBe(GigStatus.CANCELLED);
    });

    it('should prevent cancellation by unauthorized user', () => {
      const charlie = { ...alice, id: 'charlie', username: 'charlie' };
      timeBank.addUser(charlie);
      
      timeBank.createGig(testGig);
      timeBank.acceptGig(testGig.id, bob.id);
      
      expect(() => timeBank.cancelGig(testGig.id, charlie.id)).toThrow('Only gig creator or assigned user can cancel');
    });
  });

  describe('Transaction Audit Trail', () => {
    it('should maintain complete transaction history', () => {
      timeBank.createGig(testGig);
      timeBank.acceptGig(testGig.id, bob.id);
      timeBank.startGig(testGig.id, bob.id);
      
      const stateBefore = timeBank.getState();
      expect(stateBefore.transactions.size).toBe(0);
      
      timeBank.completeGig(testGig.id, bob.id);
      
      const stateAfter = timeBank.getState();
      expect(stateAfter.transactions.size).toBe(1);
      
      const transactions = Array.from(stateAfter.transactions.values());
      const transaction = transactions[0];
      
      expect(transaction.fromUserId).toBe(alice.id);
      expect(transaction.toUserId).toBe(bob.id);
      expect(transaction.gigId).toBe(testGig.id);
      expect(transaction.amount).toBe(30);
      expect(transaction.type).toBe(TransactionType.GIG_PAYMENT);
      expect(transaction.status).toBe(TransactionStatus.PENDING);
      expect(transaction.description).toContain('Build a website');
    });

    it('should track transaction processing', () => {
      const transaction = {
        id: 'tx3',
        fromUserId: alice.id,
        toUserId: bob.id,
        gigId: testGig.id,
        amount: 25,
        type: TransactionType.GIG_PAYMENT,
        status: TransactionStatus.PENDING,
        createdAt: new Date(),
        description: 'Manual payment'
      };

      timeBank.createTransaction(transaction);
      timeBank.processTransaction('tx3');
      
      const processedTx = timeBank.getTransaction('tx3');
      expect(processedTx?.status).toBe(TransactionStatus.COMPLETED);
      expect(processedTx?.completedAt).toBeDefined();
    });
  });
});