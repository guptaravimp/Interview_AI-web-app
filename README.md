# AI-Powered Interview Assistant

A comprehensive React application that provides an AI-powered interview experience for both candidates and interviewers. Built for the Swipe Internship Assignment.

## Features

### 🎯 Core Functionality
- **Resume Upload**: Support for PDF and DOCX files with automatic field extraction
- **AI-Powered Interviews**: Dynamic question generation and answer evaluation
- **Real-time Chat**: Interactive chat interface for candidate interaction
- **Timer-based Questions**: Automatic time limits with auto-submit functionality
- **Dual Interface**: Separate tabs for interviewees and interviewers
- **Data Persistence**: Local storage with welcome back functionality

### 👤 Interviewee Features
- Upload resume (PDF/DOCX supported)
- Automatic extraction of Name, Email, Phone
- Missing field collection via chatbot
- 6-question interview flow (2 Easy → 2 Medium → 2 Hard)
- Real-time timer for each question
- Auto-submit when time expires
- Pause/Resume functionality
- Progress tracking

### 📊 Interviewer Dashboard
- View all candidates with scores and summaries
- Search and sort functionality
- Detailed candidate profiles
- Complete interview history
- AI-generated summaries and evaluations
- Performance statistics

### 🔧 Technical Features
- **State Management**: Redux with Redux Persist for data persistence
- **UI Framework**: Ant Design for modern, responsive interface
- **File Processing**: PDF and DOCX parsing capabilities
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **UI Library**: Ant Design
- **File Processing**: pdf-parse, mammoth (for DOCX)
- **Build Tool**: Create React App
- **Styling**: CSS3 with responsive design

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-interview-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/           # React components
│   ├── ResumeUpload.tsx     # Resume upload and parsing
│   ├── ChatInterface.tsx    # Chat UI component
│   ├── InterviewFlow.tsx    # Interview flow with timers
│   ├── InterviewerDashboard.tsx # Dashboard for interviewers
│   ├── WelcomeBackModal.tsx # Welcome back modal
│   └── IntervieweeTab.tsx   # Main interviewee interface
├── store/               # Redux store configuration
│   ├── slices/             # Redux slices
│   │   ├── candidateSlice.ts
│   │   ├── interviewSlice.ts
│   │   ├── chatSlice.ts
│   │   └── appSlice.ts
│   └── index.ts           # Store configuration
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   ├── resumeParser.ts     # PDF/DOCX parsing
│   └── aiService.ts        # AI integration (mock)
├── hooks/               # Custom React hooks
│   └── redux.ts           # Redux hooks
├── App.tsx              # Main app component
├── index.tsx            # App entry point
└── index.css            # Global styles
```

## Usage

### For Candidates (Interviewee Tab)

1. **Upload Resume**: Upload your resume in PDF or DOCX format
2. **Verify Information**: Check and complete extracted information
3. **Start Interview**: Begin the AI-powered interview
4. **Answer Questions**: Respond to 6 questions with time limits
5. **View Results**: See your evaluation and summary

### For Interviewers (Interviewer Dashboard)

1. **View Candidates**: See all candidates with their scores
2. **Search & Filter**: Find specific candidates easily
3. **View Details**: Click on any candidate to see full interview details
4. **Analyze Performance**: Review AI-generated summaries and scores

## Interview Flow

1. **Question Generation**: AI generates 6 questions (2 Easy, 2 Medium, 2 Hard)
2. **Time Limits**: 
   - Easy: 20 seconds
   - Medium: 60 seconds  
   - Hard: 120 seconds
3. **Auto-Submit**: Answers are automatically submitted when time expires
4. **Evaluation**: AI evaluates each answer and provides scores
5. **Summary**: Final summary and overall score generated

## Data Persistence

- All data is stored locally using Redux Persist
- Candidates can close and reopen the application without losing progress
- Welcome Back modal appears for incomplete interviews
- Interview state is preserved across sessions

## AI Integration

The application includes mock AI services for:
- Question generation based on difficulty and category
- Answer evaluation with scoring
- Interview summary generation

For production use, replace the mock services in `src/utils/aiService.ts` with actual AI API integrations (OpenAI, Claude, etc.).

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
# Upload dist folder to Netlify
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is created for the Swipe Internship Assignment.

## Demo Video

A 2-5 minute demo video showcasing the application features will be provided.

## Future Enhancements

- Real AI API integration
- Video interview support
- Advanced analytics
- Multi-language support
- Interview scheduling
- Email notifications
