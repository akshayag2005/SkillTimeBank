import { Devvit } from '@devvit/kit';
import { TimebankApp } from './components/TimebankApp.js';
import './styles.css';

// Configure Devvit
Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a menu action for creating posts
Devvit.addMenuItem({
  label: 'Create Community Timebank Post',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    
    await reddit.submitPost({
      title: 'Community Timebank - Exchange Time & Skills',
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large" weight="bold">Community Timebank</text>
          <text>Click to start exchanging time and skills!</text>
        </vstack>
      ),
    });
    
    ui.showToast({ text: 'Timebank post created!' });
  },
});

// Add the main post type
Devvit.addCustomPostType({
  name: 'Community Timebank',
  height: 'tall',
  render: (context) => {
    return <TimebankApp context={context} />;
  },
});

export default Devvit;