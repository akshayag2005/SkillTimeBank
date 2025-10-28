/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { Devvit } from '@devvit/public-api';
import { GigCategory, GigType } from '../types/gig.js';
import { useTimebankState, saveState } from '../state/timebank.js';
import { GigService } from '../services/gigService.js';
import { UserService } from '../services/userService.js';

interface PostGigProps {
  context: any;
}

export function PostGig({ context }: PostGigProps) {
  const [state, setState] = useTimebankState();
  const [title, setTitle] = Devvit.useState('');
  const [description, setDescription] = Devvit.useState('');
  const [category, setCategory] = Devvit.useState<GigCategory>(GigCategory.OTHER);
  const [gigType, setGigType] = Devvit.useState<GigType>(GigType.FIND_HELP);
  const [timeCredits, setTimeCredits] = Devvit.useState('');
  const [duration, setDuration] = Devvit.useState('');
  const [isRemote, setIsRemote] = Devvit.useState(false);
  const [isSubmitting, setIsSubmitting] = Devvit.useState(false);

  const categories = [
    { value: GigCategory.TECH, label: 'Technology' },
    { value: GigCategory.CREATIVE, label: 'Creative' },
    { value: GigCategory.EDUCATION, label: 'Education' },
    { value: GigCategory.HOUSEHOLD, label: 'Household' },
    { value: GigCategory.TRANSPORTATION, label: 'Transportation' },
    { value: GigCategory.CARE, label: 'Care' },
    { value: GigCategory.OTHER, label: 'Other' },
  ];

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Ensure user is registered
      const userResult = await UserService.ensureUserRegistered(state, context);
      if (!userResult.success || !userResult.userId || !userResult.newState) {
        context.ui.showToast({ text: userResult.error || 'Failed to register user' });
        return;
      }
      
      const userId = userResult.userId;
      const currentState = userResult.newState;
      setState(currentState);

      const gigData = {
        title: title.trim(),
        description: description.trim(),
        category,
        type: gigType,
        timeCreditsOffered: parseInt(timeCredits),
        estimatedDuration: parseInt(duration),
        requiredSkills: [],
        isRemote,
        createdBy: userId
      };

      const result = GigService.createGig(currentState, gigData, context);
      
      if (result.success && result.newState) {
        setState(result.newState);
        await saveState(result.newState, context);
        
        // Reset form
        setTitle('');
        setDescription('');
        setTimeCredits('');
        setDuration('');
        setIsRemote(false);
        
        context.ui.showToast({ text: 'Gig posted successfully!' });
      } else {
        context.ui.showToast({ text: result.error || 'Failed to post gig' });
      }
    } catch (error) {
      context.ui.showToast({ text: 'Error posting gig' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <vstack width="100%" gap="medium">
      {/* Header */}
      <vstack gap="small">
        <text size="large" weight="bold" color="#1e293b">
          Post a New Gig
        </text>
        <text size="medium" color="#64748b">
          Share a task and offer time credits
        </text>
      </vstack>

      {/* Form */}
      <vstack 
        backgroundColor="#ffffff"
        cornerRadius="medium"
        padding="medium"
        gap="medium"
        border="thin"
        borderColor="#e2e8f0"
      >
        {/* Title */}
        <vstack gap="xsmall">
          <text size="small" weight="bold" color="#374151">
            Gig Title *
          </text>
          <textInput
            placeholder="e.g., Help with React development"
            value={title}
            onChangeText={setTitle}
          />
        </vstack>

        {/* Description */}
        <vstack gap="xsmall">
          <text size="small" weight="bold" color="#374151">
            Description *
          </text>
          <textInput
            placeholder="Describe what you need help with..."
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </vstack>

        {/* Gig Type */}
        <vstack gap="small">
          <text size="small" weight="bold" color="#374151">
            Gig Type *
          </text>
          <hstack gap="small">
            <button
              appearance={gigType === GigType.FIND_HELP ? 'primary' : 'secondary'}
              size="small"
              onPress={() => setGigType(GigType.FIND_HELP)}
            >
              🔍 Find Help (I pay)
            </button>
            <button
              appearance={gigType === GigType.OFFER_HELP ? 'primary' : 'secondary'}
              size="small"
              onPress={() => setGigType(GigType.OFFER_HELP)}
            >
              🤝 Offer Help (They pay)
            </button>
          </hstack>
        </vstack>

        {/* Category */}
        <vstack gap="small">
          <text size="small" weight="bold" color="#374151">
            Category *
          </text>
          <hstack gap="small" wrap>
            {categories.map((cat) => (
              <button
                key={cat.value}
                appearance={category === cat.value ? 'primary' : 'secondary'}
                size="small"
                onPress={() => setCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </hstack>
        </vstack>

        {/* Time Credits and Duration */}
        <hstack gap="medium" width="100%">
          <vstack gap="xsmall" grow>
            <text size="small" weight="bold" color="#374151">
              Time Credits *
            </text>
            <textInput
              placeholder="60"
              value={timeCredits}
              onChangeText={setTimeCredits}
            />
          </vstack>
          
          <vstack gap="xsmall" grow>
            <text size="small" weight="bold" color="#374151">
              Duration (minutes) *
            </text>
            <textInput
              placeholder="60"
              value={duration}
              onChangeText={setDuration}
            />
          </vstack>
        </hstack>

        {/* Remote Option */}
        <hstack gap="small" alignment="center">
          <button
            appearance={isRemote ? 'primary' : 'secondary'}
            size="small"
            onPress={() => setIsRemote(!isRemote)}
          >
            {isRemote ? '✓' : '○'} Remote Work
          </button>
        </hstack>

        {/* Submit Button */}
        <button
          appearance="primary"
          size="large"
          onPress={handleSubmit}
          disabled={!title || !description || !timeCredits || !duration || isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post Gig'}
        </button>
      </vstack>

      {/* Tips */}
      <vstack 
        backgroundColor="#f8fafc"
        cornerRadius="medium"
        padding="medium"
        gap="small"
      >
        <text size="small" weight="bold" color="#374151">
          💡 Tips for a great gig post:
        </text>
        <text size="xsmall" color="#64748b">
          • Be specific about what you need
        </text>
        <text size="xsmall" color="#64748b">
          • Set fair time credits based on complexity
        </text>
        <text size="xsmall" color="#64748b">
          • Include any required skills or tools
        </text>
      </vstack>
    </vstack>
  );
}