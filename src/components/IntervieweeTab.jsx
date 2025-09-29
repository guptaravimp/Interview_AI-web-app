import React, { useState, useEffect } from 'react';
import { Tabs, Card, Typography, Space, Alert, Spin } from 'antd';
import { 
  FileTextOutlined, 
  MessageOutlined, 
  PlayCircleOutlined 
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/redux.js';
import { useTimer } from '../hooks/useTimer.js';
import { 
  addCandidate, 
  updateCandidate, 
  setCurrentCandidate 
} from '../store/slices/candidateSlice.js';
import {
  startInterview,
  updateInterview,
  addAnswer,
  updateAnswer,
  pauseInterview,
  resumeInterview,
  completeInterview
} from '../store/slices/interviewSlice.js';
import {
  initializeChat,
  addMessage,
  setWaitingForField
} from '../store/slices/chatSlice.js';
import { generateQuestions, evaluateAnswer, generateInterviewSummary } from '../utils/aiService.js';
import ResumeUpload from './ResumeUpload.jsx';
import ChatInterface from './ChatInterface.jsx';
import InterviewFlow from './InterviewFlow.jsx';
import ProcessingModal from './ProcessingModal.jsx';

const { Title, Text } = Typography;

const IntervieweeTab = () => {
  const dispatch = useAppDispatch();
  const { candidates, currentCandidateId } = useAppSelector(state => state.candidates);
  const { interviews } = useAppSelector(state => state.interviews);
  const { chatSessions } = useAppSelector(state => state.chat);
  
  const [activeTab, setActiveTab] = useState('upload');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewProgress, setInterviewProgress] = useState(0);

  const currentCandidate = candidates.find(c => c.id === currentCandidateId);
  const currentInterview = currentCandidate ? interviews[currentCandidate.id] : undefined;
  const currentChatSession = currentCandidate ? chatSessions[currentCandidate.id] : undefined;

  const generateInterviewQuestions = async (candidate) => {
    // Generate 6 questions using Gemini API
    const aiQuestions = await generateQuestions('React/Node');
    
    // Add IDs and time limits to the questions
    const questions = aiQuestions.map((aiQuestion, index) => ({
      id: `q${index + 1}`,
      text: aiQuestion.text,
      difficulty: aiQuestion.difficulty,
      timeLimit: aiQuestion.difficulty === 'easy' ? 20 : aiQuestion.difficulty === 'medium' ? 60 : 120,
      category: aiQuestion.category,
      expectedTopics: aiQuestion.expectedTopics
    }));
    
    return questions;
  };

  const handleResumeParsed = async (data) => {
    setIsGeneratingQuestions(true);
    setShowInterviewModal(true);
    setInterviewProgress(0);
    
    try {
      // Create candidate
      const candidate = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        resumeUrl: data.rawText,
        interviewStatus: 'not_started',
        currentQuestionIndex: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dispatch(addCandidate(candidate));
      dispatch(setCurrentCandidate(candidate.id));
      dispatch(initializeChat(candidate.id));

      // Simulate progress updates for question generation
      const progressInterval = setInterval(() => {
        setInterviewProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 300);

      // Generate questions
      const questions = await generateInterviewQuestions(candidate);

      // Complete progress
      setInterviewProgress(100);

      // Start interview
      const interview = {
        candidateId: candidate.id,
        questions,
        answers: [],
        currentQuestionIndex: 0,
        isPaused: false,
        startTime: new Date().toISOString()
      };

      dispatch(startInterview(interview));

      // Add welcome message
      dispatch(addMessage({
        candidateId: candidate.id,
        message: {
          id: 'welcome',
          type: 'ai',
          content: `Hello ${candidate.name}! Welcome to your AI-powered interview. I've prepared 6 questions for you covering various aspects of full-stack development. Let's begin!`,
          timestamp: new Date().toISOString()
        }
      }));

      // Wait a moment to show completion
      setTimeout(() => {
        setShowInterviewModal(false);
        setInterviewProgress(0);
        setActiveTab('interview');
      }, 1500);
      
    } catch (error) {
      console.error('Error starting interview:', error);
      setShowInterviewModal(false);
      setInterviewProgress(0);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAnswerSubmit = async (answer, timeSpent) => {
    if (!currentCandidate || !currentInterview) return;

    setIsEvaluating(true);
    
    try {
      const currentQuestion = currentInterview.questions[currentInterview.currentQuestionIndex];
      
      // Add answer
      const answerObj = {
        questionId: currentQuestion.id,
        answer,
        timestamp: new Date().toISOString(),
        timeSpent
      };

      dispatch(addAnswer({
        candidateId: currentCandidate.id,
        answer: answerObj
      }));

      // Evaluate answer
      const evaluation = await evaluateAnswer(currentQuestion, answer, currentCandidate.resumeUrl);
      
      // Update answer with score
      dispatch(updateAnswer({
        candidateId: currentCandidate.id,
        questionId: currentQuestion.id,
        score: evaluation.score
      }));

      // Move to next question or complete interview
      const nextIndex = currentInterview.currentQuestionIndex + 1;
      if (nextIndex < currentInterview.questions.length) {
        dispatch(updateInterview({
          candidateId: currentCandidate.id,
          currentQuestionIndex: nextIndex
        }));
      } else {
        // Complete interview
        const summary = await generateInterviewSummary(
          { name: currentCandidate.name, email: currentCandidate.email, background: currentCandidate.resumeUrl },
          currentInterview.questions,
          [...currentInterview.answers, { ...answerObj, score: evaluation.score }]
        );

        dispatch(completeInterview(currentCandidate.id));
        dispatch(updateCandidate({
          id: currentCandidate.id,
          interviewStatus: 'completed',
          finalScore: summary.overallScore,
          summary: summary.summary
        }));
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleInterviewComplete = () => {
    if (currentCandidate) {
      dispatch(addMessage({
        candidateId: currentCandidate.id,
        message: {
          id: 'complete',
          type: 'ai',
          content: `Congratulations! You've completed the interview. Your responses have been evaluated and a summary has been generated. Thank you for your time!`,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const handlePause = () => {
    if (currentCandidate) {
      dispatch(pauseInterview(currentCandidate.id));
    }
  };

  const handleResume = () => {
    if (currentCandidate) {
      dispatch(resumeInterview(currentCandidate.id));
    }
  };

  const getCurrentQuestion = () => {
    if (!currentInterview) return undefined;
    return currentInterview.questions[currentInterview.currentQuestionIndex];
  };

  const getTimeRemaining = () => {
    // This would be calculated based on the timer state
    // For now, return the time limit of current question
    const question = getCurrentQuestion();
    return question?.timeLimit || 0;
  };

  // Auto-advance and auto-submit functionality
  const handleTimerExpired = async () => {
    if (!currentInterview || !currentCandidate) return;

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const isLastQuestion = currentInterview.currentQuestionIndex === currentInterview.questions.length - 1;

    if (isLastQuestion) {
      // Auto-submit on last question
      await handleAnswerSubmit('Time expired - no answer provided', currentQuestion.timeLimit);
    } else {
      // Auto-advance to next question
      const nextIndex = currentInterview.currentQuestionIndex + 1;
      dispatch(updateInterview({
        candidateId: currentCandidate.id,
        currentQuestionIndex: nextIndex
      }));
    }
  };

  // Get current question for timer
  const currentQuestion = getCurrentQuestion();
  const isInterviewActive = currentInterview && !currentInterview.isPaused;
  
  // Use timer hook
  const { timeRemaining, isRunning } = useTimer(
    currentQuestion?.timeLimit || 0,
    isInterviewActive,
    handleTimerExpired
  );

  const tabItems = [
    {
      key: 'upload',
      label: (
        <Space>
          <FileTextOutlined />
          Resume Upload
        </Space>
      ),
      children: (
        <ResumeUpload onResumeParsed={handleResumeParsed} />
      )
    },
    {
      key: 'chat',
      label: (
        <Space>
          <MessageOutlined />
          Chat
        </Space>
      ),
      children: (
        <ChatInterface
          messages={currentChatSession?.messages || []}
          onSendMessage={(content) => {
            // Handle chat messages
          }}
          disabled={!currentChatSession}
          currentQuestion={currentQuestion}
          timeRemaining={timeRemaining}
          isInterviewActive={isInterviewActive}
        />
      ),
      disabled: !currentCandidate
    },
    {
      key: 'interview',
      label: (
        <Space>
          <PlayCircleOutlined />
          Interview
        </Space>
      ),
      children: currentInterview ? (
        <InterviewFlow
          candidateId={currentCandidate?.id || ''}
          questions={currentInterview.questions}
          currentQuestionIndex={currentInterview.currentQuestionIndex}
          answers={currentInterview.answers}
          isPaused={currentInterview.isPaused}
          onAnswerSubmit={handleAnswerSubmit}
          onInterviewComplete={handleInterviewComplete}
          onPause={handlePause}
          onResume={handleResume}
        />
      ) : (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
            <Title level={4}>No Interview Started</Title>
            <Text type="secondary">Please upload your resume first to begin the interview.</Text>
          </Space>
        </Card>
      ),
      disabled: !currentInterview
    }
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Title level={3}>Interviewee Portal</Title>
        <Text type="secondary">
          Upload your resume and take the AI-powered interview
        </Text>
      </Card>

      {(isGeneratingQuestions || isEvaluating) && (
        <Alert
          message={
            <Space>
              <Spin size="small" />
              {isGeneratingQuestions ? 'Generating interview questions...' : 'Evaluating your answer...'}
            </Space>
          }
          type="info"
          style={{ marginBottom: 16 }}
        />
      )}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />

      <ProcessingModal
        visible={showInterviewModal}
        type="generating"
        progress={interviewProgress}
      />
    </div>
  );
};

export default IntervieweeTab;
