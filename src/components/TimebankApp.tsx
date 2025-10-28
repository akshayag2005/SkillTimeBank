/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { Devvit } from '@devvit/public-api';
import { SplashScreen } from './SplashScreen.js';
import { BrowseGigs } from './BrowseGigs.js';
import { MyGigs } from './MyGigs.js';
import { PostGig } from './PostGig.js';
import { TabNavigation } from './TabNavigation.js';
import { useTimebankState, saveState } from '../state/timebank.js';
import { UserService } from '../services/userService.js';

export type TabType = 'splash' | 'browse' | 'my-gigs' | 'post-gig';

interface TimebankAppProps {
  context: any;
}

export function TimebankApp({ context }: TimebankAppProps) {
  const [state, setState] = useTimebankState();
  const [currentTab, setCurrentTab] = Devvit.useState<TabType>('splash');
  const [hasEntered, setHasEntered] = Devvit.useState(false);
  const [isInitializing, setIsInitializing] = Devvit.useState(true);

  const handleEnterTimebank = async () => {
    setIsInitializing(true);
    
    try {
      const result = await UserService.ensureUserRegistered(state, context);
      
      if (result.success && result.newState) {
        setState(result.newState);
        await saveState(result.newState, context);
        
        // Show welcome message for new users
        if (result.newState.users[result.userId!]?.timeCredits === UserService.SIGNUP_BONUS_AMOUNT) {
          context.ui.showToast({ 
            text: `Welcome to TimeBank! You've received ${UserService.SIGNUP_BONUS_AMOUNT} time credit to get started!` 
          });
        }
      }
      
      setHasEntered(true);
      setCurrentTab('browse');
    } catch (error) {
      context.ui.showToast({ text: 'Error initializing user' });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
  };

  if (!hasEntered && currentTab === 'splash') {
    return <SplashScreen onEnter={handleEnterTimebank} isLoading={isInitializing} />;
  }

  return (
    <vstack height="100%" width="100%" backgroundColor="#f8fafc">
      <TabNavigation 
        currentTab={currentTab} 
        onTabChange={handleTabChange}
      />
      
      <vstack height="100%" width="100%" padding="medium">
        {currentTab === 'browse' && <BrowseGigs context={context} />}
        {currentTab === 'my-gigs' && <MyGigs context={context} />}
        {currentTab === 'post-gig' && <PostGig context={context} />}
      </vstack>
    </vstack>
  );
}