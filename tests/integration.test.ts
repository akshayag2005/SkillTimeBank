import { describe, it, expect, beforeEach } from 'vitest';
import { TimeBankManager } from '../src/state/timebank';
import { User } from '../src/types/user';
import { Gig, GigStatus, GigCategory } from '../src/types/gig';
import { TransactionStatus, TransactionType } from '../src/types/transaction';

describe('Full Lifecycle Integration Test', () => {
  let timeBank: TimeBankManager;
  let gigCreator: User;
  let gigWorker: User;

  beforeEach(() => {
    timeBank = new TimeBankManager();
    
    gigCreator = {
      id: 'creator',
      username: 'creator',
      timeCredits: 100,
      reputation: 5,
      skills: ['management'],
      joinedAt: new Date(),
      isActive: true
    };

    gigWorker = {
      id: 'worker',
      username: 'worker',
      timeCredits: 20,
      reputation: 4,
      skills: ['programming', 'design'],
      joinedAt: new Date(),
      isActive: true
    };

    timeBank.addUser(gigCreator);
    timeBank.addUser(gigWorker);
  });

  it('should complete full gig lifecycle: OPEN→ASSIGNED→IN_PROGRESS→COMPLETED with transaction', () => {
    // Snapshot initial state
    const initialState = timeBank.getState();
    expect(initialState.gigs.size).toBe(0);
    expect(initialState.transactions.size).toBe(0);
    expect(initialState.users.get(gigCreator.id)?.timeCredits).toBe(100);
    expect(initialState.users.get(gigWorker.id)?.timeCredits).toBe(20);

    // 1. Create gig (OPEN status)
    const gig: Gig = {
      id: 'lifecycle-gig',
      title: 'Build mobile app',
      description: 'Create a React Native app',
      category: GigCategory.TECH,
      timeCreditsOffered: 50,
      estimatedDuration: 240,
      requiredSkills: ['programming'],
      isRemote: true,
      createdBy: gigCreator.id,
      createdAt: new Date(),
      status: GigStatus.OPEN
    };

    timeBank.createGig(gig);
    
    // Verify OPEN state
    let currentGig = timeBank.getGig(gig.id);
    expect(currentGig?.status).toBe(GigStatus.OPEN);
    expect(currentGig?.assignedTo).toBeUndefined();

    // 2. Accept gig (OPEN → ASSIGNED)
    timeBank.acceptGig(gig.id, gigWorker.id);
    
    // Verify ASSIGNED state
    currentGig = timeBank.getGig(gig.id);
    expect(currentGig?.status).toBe(GigStatus.ASSIGNED);
    expect(currentGig?.assignedTo).toBe(gigWorker.id);

    // 3. Start gig (ASSIGNED → IN_PROGRESS)
    timeBank.startGig(gig.id, gigWorker.id);
    
    // Verify IN_PROGRESS state
    currentGig = timeBank.getGig(gig.id);
    expect(currentGig?.status).toBe(GigStatus.IN_PROGRESS);

    // 4. Complete gig (IN_PROGRESS → COMPLETED + create transaction)
    timeBank.completeGig(gig.id, gigWorker.id);
    
    // Verify COMPLETED state
    currentGig = timeBank.getGig(gig.id);
    expect(currentGig?.status).toBe(GigStatus.COMPLETED);
    expect(currentGig?.completedAt).toBeDefined();

    // Verify transaction was created
    const stateAfterCompletion = timeBank.getState();
    expect(stateAfterCompletion.transactions.size).toBe(1);
    
    const transactions = Array.from(stateAfterCompletion.transactions.values());
    const transaction = transactions[0];
    
    expect(transaction.fromUserId).toBe(gigCreator.id);
    expect(transaction.toUserId).toBe(gigWorker.id);
    expect(transaction.gigId).toBe(gig.id);
    expect(transaction.amount).toBe(50);
    expect(transaction.type).toBe(TransactionType.GIG_PAYMENT);
    expect(transaction.status).toBe(TransactionStatus.PENDING);

    // 5. Process the payment transaction
    timeBank.processTransaction(transaction.id);
    
    // Verify final state with completed transaction
    const finalState = timeBank.getState();
    const finalTransaction = finalState.transactions.get(transaction.id);
    const finalCreator = finalState.users.get(gigCreator.id);
    const finalWorker = finalState.users.get(gigWorker.id);
    
    // Transaction should be completed
    expect(finalTransaction?.status).toBe(TransactionStatus.COMPLETED);
    expect(finalTransaction?.completedAt).toBeDefined();
    
    // Credits should be transferred
    expect(finalCreator?.timeCredits).toBe(50); // 100 - 50
    expect(finalWorker?.timeCredits).toBe(70);  // 20 + 50

    // Snapshot final state comparison
    expect(finalState.gigs.size).toBe(1);
    expect(finalState.transactions.size).toBe(1);
    expect(finalState.users.size).toBe(2);
  });

  it('should handle lifecycle with insufficient funds', () => {
    // Create user with insufficient credits
    const poorCreator: User = {
      id: 'poor-creator',
      username: 'poor-creator',
      timeCredits: 10, // Less than gig payment
      reputation: 2,
      skills: [],
      joinedAt: new Date(),
      isActive: true
    };

    timeBank.addUser(poorCreator);

    const expensiveGig: Gig = {
      id: 'expensive-gig',
      title: 'Expensive task',
      description: 'This costs more than creator has',
      category: GigCategory.OTHER,
      timeCreditsOffered: 30, // More than creator's 10 credits
      estimatedDuration: 60,
      requiredSkills: [],
      isRemote: true,
      createdBy: poorCreator.id,
      createdAt: new Date(),
      status: GigStatus.OPEN
    };

    // Complete the lifecycle up to completion
    timeBank.createGig(expensiveGig);
    timeBank.acceptGig(expensiveGig.id, gigWorker.id);
    timeBank.startGig(expensiveGig.id, gigWorker.id);

    // Completion should fail due to insufficient funds
    expect(() => timeBank.completeGig(expensiveGig.id, gigWorker.id)).toThrow('Insufficient time credits');

    // Verify gig remains in IN_PROGRESS state
    const gig = timeBank.getGig(expensiveGig.id);
    expect(gig?.status).toBe(GigStatus.IN_PROGRESS);

    // Verify no transaction was created
    const state = timeBank.getState();
    expect(state.transactions.size).toBe(0);
  });

  it('should handle cancellation during lifecycle', () => {
    const gig: Gig = {
      id: 'cancel-gig',
      title: 'Cancelled task',
      description: 'This will be cancelled',
      category: GigCategory.CREATIVE,
      timeCreditsOffered: 25,
      estimatedDuration: 90,
      requiredSkills: ['design'],
      isRemote: false,
      createdBy: gigCreator.id,
      createdAt: new Date(),
      status: GigStatus.OPEN
    };

    // Progress through partial lifecycle
    timeBank.createGig(gig);
    timeBank.acceptGig(gig.id, gigWorker.id);
    
    // Cancel after acceptance
    timeBank.cancelGig(gig.id, gigCreator.id);
    
    // Verify cancelled state
    const cancelledGig = timeBank.getGig(gig.id);
    expect(cancelledGig?.status).toBe(GigStatus.CANCELLED);
    
    // Verify no transactions created
    const state = timeBank.getState();
    expect(state.transactions.size).toBe(0);
    
    // Verify user credits unchanged
    expect(state.users.get(gigCreator.id)?.timeCredits).toBe(100);
    expect(state.users.get(gigWorker.id)?.timeCredits).toBe(20);
  });
});