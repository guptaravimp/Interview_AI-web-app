// Type definitions converted to JavaScript comments for reference
// These interfaces are now just documentation - remove type annotations in actual usage

/*
Candidate structure:
{
  id: string,
  name: string,
  email: string,
  phone: string,
  resumeUrl?: string,
  interviewStatus: 'not_started' | 'in_progress' | 'completed',
  currentQuestionIndex: number,
  finalScore?: number,
  summary?: string,
  createdAt: Date,
  updatedAt: Date
}

Question structure:
{
  id: string,
  text: string,
  difficulty: 'easy' | 'medium' | 'hard',
  timeLimit: number, // in seconds
  category: string,
  expectedTopics?: string[]
}

Answer structure:
{
  questionId: string,
  answer: string,
  timestamp: Date,
  timeSpent: number, // in seconds
  score?: number
}

Interview structure:
{
  candidateId: string,
  questions: Question[],
  answers: Answer[],
  currentQuestionIndex: number,
  isPaused: boolean,
  startTime?: Date,
  endTime?: Date
}

Message structure:
{
  id: string,
  type: 'user' | 'ai' | 'system',
  content: string,
  timestamp: Date,
  isTyping?: boolean
}

ChatSession structure:
{
  candidateId: string,
  messages: Message[],
  isWaitingForField?: string // 'name' | 'email' | 'phone'
}

AppState structure:
{
  currentTab: 'interviewee' | 'interviewer',
  candidates: Candidate[],
  interviews: { [candidateId: string]: Interview },
  chatSessions: { [candidateId: string]: ChatSession },
  currentCandidate?: string
}

ResumeData structure:
{
  name?: string,
  email?: string,
  phone?: string,
  rawText: string
}

AIEvaluation structure:
{
  score: number, // 0-100
  feedback: string,
  strengths: string[],
  improvements: string[]
}

QuestionGenerationRequest structure:
{
  difficulty: 'easy' | 'medium' | 'hard',
  category: string,
  candidateBackground?: string
}

AIQuestion structure:
{
  text: string,
  difficulty: 'easy' | 'medium' | 'hard',
  category: string,
  expectedTopics?: string[]
}
*/
