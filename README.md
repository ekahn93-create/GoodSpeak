# Articulation Trainer

A comprehensive web application designed to help you speak more articulately and eloquently. Build your vocabulary, practice storytelling, and develop conscious word selection skills.

## Features

### 📚 Vocabulary Builder
- **100 curated words** across three difficulty levels (Beginner, Intermediate, Advanced)
- Learn words with definitions, pronunciations, examples, and synonyms
- Interactive practice exercises with multiple-choice questions
- Track learned and mastered words
- Progress visualization by difficulty level

### 📖 Story-Telling Practice
- **30 story prompts** across three themes (Personal, Fictional, Descriptive)
- Structured guidance for crafting compelling narratives
- Practice telling comprehensive stories with clear beginnings, middles, and ends
- Save drafts and track completed stories
- Build confidence in verbal storytelling

### ✨ Daily Word Practice
- **60+ daily words** focused on replacing weak, overused terms
- Word-of-the-day rotation system
- Practice exercises for conscious word selection
- Streak tracking to build consistent practice habits
- Learn to replace vague words like "good," "bad," and "very" with precise alternatives

### 📊 Progress Tracking
- Comprehensive dashboard showing your improvement
- Vocabulary progress by difficulty level
- Story completion tracking
- Practice streak monitoring
- Achievement badges for milestones

## Getting Started

### Installation

No installation required! This is a pure client-side web application.

1. **Download or clone** the `articulation-app` folder
2. **Open** `index.html` in any modern web browser
3. **Start learning!**

### Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

**Requirements:**
- JavaScript enabled
- LocalStorage enabled (for saving progress)

## How to Use

### First Time Setup

When you first open the app:
1. The app automatically creates a new user profile
2. Your progress is saved locally in your browser
3. No account or internet connection required

### Vocabulary Builder

1. Click **"Vocabulary"** in the navigation
2. Select your difficulty level (Beginner, Intermediate, Advanced)
3. Click **"Show New Word"** to see a new vocabulary word
4. Read the definition, pronunciation, example, and synonyms
5. Click **"Practice Exercise"** to test your knowledge
6. Click **"Mark as Learned"** when you've mastered the word
7. View your learned words in the list below

**Tips:**
- Start with Beginner words and progress to higher levels
- Practice exercises help reinforce learning
- Review your learned words by clicking on them
- Try to use learned words in your daily conversations

### Story-Telling Practice

1. Click **"Stories"** in the navigation
2. Choose a theme or view all prompts
3. Click on a story prompt that interests you
4. Read the prompt and click **"Show Structure Guidance"** for help
5. Use the text area to plan or write your story (or speak it out loud!)
6. Click **"Save Draft"** to save your progress
7. Click **"Complete Story"** when finished (optionally add reflection notes)

**Tips:**
- Speak your story out loud for the best practice
- Use the structure guidance (beginning, middle, end) to organize your thoughts
- Complete multiple prompts across different themes
- Reflect on what you learned after each story

### Daily Word Practice

1. Click **"Daily Word"** in the navigation
2. Read today's word-of-the-day
3. Study the examples of weak vs. strong word usage
4. Complete the precision exercise
5. Click **"Complete Today's Practice"** to update your streak

**Tips:**
- Visit daily to maintain your streak
- Try to avoid using weak words in your conversations
- Practice replacing one weak word at a time
- The reference section shows common replacements

### Tracking Progress

1. Click **"Progress"** in the navigation
2. View your overall statistics
3. See vocabulary progress by difficulty level
4. Review recent activity
5. Check your achievement badges

**Milestones:**
- First Word (1 word learned)
- Word Master (25 words)
- Vocabulary Expert (50 words)
- Storyteller (1 story completed)
- Week Warrior (7 day streak)
- And more!

## Understanding Your Data

### Data Storage

All your progress is stored locally in your browser using LocalStorage:
- No data is sent to any server
- Your progress is private and stays on your device
- Clearing browser data will erase your progress

### Exporting/Backing Up

Currently, the app doesn't include export functionality, but your data persists as long as:
- You don't clear browser data
- You use the same browser and device
- LocalStorage is enabled

## Tips for Success

### Building Vocabulary
1. **Start small** - Begin with beginner words
2. **Use them** - Try to use new words in conversation the same day
3. **Review regularly** - Click on learned words to refresh your memory
4. **Progress gradually** - Move to intermediate and advanced as you gain confidence

### Improving Storytelling
1. **Practice out loud** - Don't just write, speak your stories
2. **Use structure** - Follow the beginning/middle/end guidance
3. **Be specific** - Use precise, descriptive language
4. **Vary themes** - Try personal, fictional, and descriptive prompts

### Word Precision
1. **Build awareness** - Notice when you use weak words
2. **Replace consciously** - Think about better alternatives before speaking
3. **Maintain streaks** - Daily practice builds lasting habits
4. **Review alternatives** - Study the full synonym lists

### General Practice
- **Consistency over intensity** - Daily practice is better than cramming
- **Mix it up** - Rotate between vocabulary, stories, and daily words
- **Track progress** - Check your progress view for motivation
- **Be patient** - Language skills improve gradually with practice

## Troubleshooting

### Progress Not Saving

**Problem:** Your progress disappears when you close the browser.

**Solutions:**
- Check that LocalStorage is enabled in your browser settings
- Don't use private/incognito mode (it doesn't save LocalStorage)
- Make sure you're not clearing browser data when closing

### App Not Loading

**Problem:** The page is blank or not working.

**Solutions:**
- Check that JavaScript is enabled
- Try a different browser
- Open the browser console (F12) to check for errors
- Make sure all files are in the correct folders

### Streak Reset Unexpectedly

**Problem:** Your daily word streak went back to zero.

**Reason:** Streaks reset if you skip a day. Visit the Daily Word page at least once every day to maintain your streak.

## Technical Details

### Architecture
- **Pure vanilla JavaScript** - No frameworks or dependencies
- **Single Page Application (SPA)** - Hash-based routing
- **Module Pattern** - Clean, organized code structure
- **Responsive Design** - Works on desktop, tablet, and mobile

### File Structure
```
articulation-app/
├── index.html              # Main HTML file
├── css/                    # Stylesheets
│   ├── styles.css         # Base styles
│   ├── components.css     # UI components
│   └── responsive.css     # Mobile responsive
├── js/
│   ├── app.js             # Main app logic
│   ├── router.js          # SPA routing
│   ├── storage.js         # LocalStorage management
│   ├── components/        # Reusable components
│   ├── modules/           # Feature modules
│   └── data/              # Content databases
└── README.md              # This file
```

### Data Files
- **vocabularyData.js** - 100 words (35 beginner, 35 intermediate, 30 advanced)
- **storyPrompts.js** - 30 prompts (10 per theme)
- **dailyWords.js** - 60 words for precision practice

## Future Enhancements

Potential features for future versions:
- Export/import progress data
- Dark mode
- Text-to-speech pronunciation
- Custom vocabulary lists
- More story prompts
- Advanced search and filtering
- Print-friendly progress reports
- PWA support for offline use

## Support

This is a standalone web application with no backend or support system. For questions or issues:
1. Review this README carefully
2. Check the browser console for errors (F12)
3. Try using a different browser
4. Verify all files are present and correctly named

## License

This application is provided as-is for educational and personal use.

## Credits

**Designed and built for improving articulation and eloquent speech.**

Content curated to help users:
- Expand vocabulary naturally
- Practice structured storytelling
- Develop conscious word selection
- Build confidence in articulate expression

---

## Quick Start Summary

1. Open `index.html` in your browser
2. Explore the dashboard
3. Start with Vocabulary Builder (Beginner level)
4. Try a Story prompt (Personal theme)
5. Complete today's Daily Word practice
6. Check your Progress page to see your stats

**Practice consistently, and watch your articulation improve!**
