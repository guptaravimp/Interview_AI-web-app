import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Progress, 
  Space, 
  Tag, 
  Alert,
  Modal,
  Statistic,
  Row,
  Col
} from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useTimer } from '../hooks/useTimer.js';

const { Title, Text } = Typography;

const InterviewFlow = ({
  candidateId,
  questions,
  currentQuestionIndex,
  answers,
  isPaused,
  onAnswerSubmit,
  onInterviewComplete,
  onPause,
  onResume
}) => {
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleSubmit = async () => {
    if (!currentAnswer.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAnswerSubmit(currentAnswer, timeSpent);
      setCurrentAnswer('');
      
      if (isLastQuestion) {
        setShowSummary(true);
        onInterviewComplete();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = useCallback(async () => {
    if (currentAnswer.trim()) {
      await handleSubmit();
    } else {
      await onAnswerSubmit('No answer provided', timeSpent);
      setCurrentAnswer('');
      
      if (isLastQuestion) {
        setShowSummary(true);
        onInterviewComplete();
      }
    }
  }, [currentAnswer, timeSpent, isLastQuestion, onAnswerSubmit, onInterviewComplete]);

  // Use timer hook with key to ensure proper reset
  const { timeRemaining, isRunning } = useTimer(
    currentQuestion?.timeLimit || 0,
    !isPaused,
    handleAutoSubmit
  );

  console.log('InterviewFlow render - currentQuestion:', currentQuestion?.timeLimit, 'timeRemaining:', timeRemaining);

  // Debug timer updates
  useEffect(() => {
    console.log('InterviewFlow - timeRemaining updated:', timeRemaining);
  }, [timeRemaining]);

  // Track time spent
  useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused, timeRemaining]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'blue';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 10) return '#ff4d4f';
    if (timeRemaining <= 30) return '#faad14';
    return '#52c41a';
  };

  if (showSummary) {
    return (
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
          <Title level={2}>Interview Completed!</Title>
          <Text>Thank you for completing the interview. Your responses have been recorded and evaluated.</Text>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic title="Questions Answered" value={answers.length} suffix={`/ ${questions.length}`} />
            </Col>
            <Col span={8}>
              <Statistic 
                title="Average Score" 
                value={answers.length > 0 ? Math.round(answers.reduce((sum, a) => sum + (a.score || 0), 0) / answers.length) : 0} 
                suffix="/ 100" 
              />
            </Col>
            <Col span={8}>
              <Statistic title="Time Taken" value={answers.reduce((sum, a) => sum + a.timeSpent, 0)} suffix="seconds" />
            </Col>
          </Row>
        </Space>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <ExclamationCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />
          <Title level={3}>No Question Available</Title>
          <Text>There seems to be an issue with the interview setup. Please refresh the page.</Text>
        </Space>
      </Card>
    );
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Title>
            <Space>
              {isPaused ? (
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />} 
                  onClick={onResume}
                >
                  Resume
                </Button>
              ) : (
                <Button 
                  icon={<PauseCircleOutlined />} 
                  onClick={onPause}
                >
                  Pause
                </Button>
              )}
            </Space>
          </div>

          <Progress 
            percent={progress} 
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            showInfo={false}
          />

          <Alert
            message={
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <Tag color={getDifficultyColor(currentQuestion.difficulty)}>
                      {currentQuestion.difficulty.toUpperCase()}
                    </Tag>
                    <Tag color="blue">{currentQuestion.category}</Tag>
                  </Space>
                  <Space>
                    <ClockCircleOutlined />
                    <Text strong style={{ color: getTimeColor() }}>
                      {formatTime(timeRemaining)}
                    </Text>
                    <Text style={{ fontSize: '10px', color: '#999' }}>
                      (Debug: {timeRemaining}s)
                    </Text>
                  </Space>
                </div>
              </Space>
            }
            type="info"
            showIcon={false}
            style={{ backgroundColor: '#f6ffed' }}
          />

          <Card style={{ backgroundColor: '#fafafa' }}>
            <Title level={5}>Question:</Title>
            <Text>{currentQuestion.text}</Text>
          </Card>
        </Space>
      </Card>

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={5}>Your Answer:</Title>
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            style={{
              width: '100%',
              minHeight: '150px',
              padding: '12px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            disabled={isPaused || isSubmitting}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">
              {isPaused ? 'Interview paused' : `${timeRemaining > 0 ? `${formatTime(timeRemaining)} remaining` : 'Time\'s up!'}`}
            </Text>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!currentAnswer.trim() || isPaused}
            >
              {isLastQuestion ? 'Submit & Complete' : 'Submit Answer'}
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default InterviewFlow;
