import React, { useState, useRef, useEffect } from 'react';
import { 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Avatar, 
  Spin,
  Progress,
  Tag,
  Alert
} from 'antd';
import { 
  SendOutlined, 
  UserOutlined, 
  RobotOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

const ChatInterface = ({
  messages,
  onSendMessage,
  isTyping = false,
  currentQuestion,
  timeRemaining,
  isInterviewActive = false,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isInterviewActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInterviewActive]);

  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

  return (
    <Card style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {isInterviewActive ? 'Interview in Progress' : 'Chat with AI Assistant'}
        </Title>
        {currentQuestion && (
          <div style={{ marginTop: 8 }}>
            <Alert
              message={
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong>Current Question:</Text>
                  <Text>{currentQuestion.text}</Text>
                  <Space>
                    <Tag color={getDifficultyColor(currentQuestion.difficulty)}>
                      {currentQuestion.difficulty.toUpperCase()}
                    </Tag>
                    <Tag 
                      icon={<ClockCircleOutlined />} 
                      color={timeRemaining <= 10 ? 'red' : timeRemaining <= 30 ? 'orange' : 'blue'}
                    >
                      Time: {formatTime(timeRemaining || 0)}
                      {timeRemaining > 0 && isInterviewActive && (
                        <span style={{ marginLeft: 4, fontSize: '10px' }}>⏱️</span>
                      )}
                    </Tag>
                    {isInterviewActive && (
                      <Tag color="green">Active</Tag>
                    )}
                    {timeRemaining === 0 && (
                      <Tag color="red">Time's Up!</Tag>
                    )}
                  </Space>
                  {timeRemaining > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontSize: '12px', color: '#666' }}>
                          Time Remaining: {formatTime(timeRemaining)}
                        </Text>
                        <Text style={{ fontSize: '12px', color: '#666' }}>
                          {Math.round((timeRemaining / currentQuestion.timeLimit) * 100)}% left
                        </Text>
                      </div>
                      <div style={{ fontSize: '10px', color: '#999', marginBottom: 4 }}>
                        Debug: {timeRemaining}s / {currentQuestion.timeLimit}s | Active: {isInterviewActive ? 'Yes' : 'No'}
                      </div>
                      <Progress
                        percent={Math.round((timeRemaining / currentQuestion.timeLimit) * 100)}
                        strokeColor={{
                          '0%': timeRemaining <= 10 ? '#ff4d4f' : timeRemaining <= 30 ? '#faad14' : '#52c41a',
                          '100%': timeRemaining <= 10 ? '#ff4d4f' : timeRemaining <= 30 ? '#faad14' : '#52c41a',
                        }}
                        trailColor="#f0f0f0"
                        showInfo={false}
                        size="small"
                      />
                    </div>
                  )}
                </Space>
              }
              type="info"
              showIcon
            />
          </div>
        )}
      </div>

      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '16px 0',
          border: '1px solid #f0f0f0',
          borderRadius: '6px',
          backgroundColor: '#fafafa',
          marginBottom: 16
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              marginBottom: 16,
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{ maxWidth: '70%' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                {message.type !== 'user' && (
                  <Avatar 
                    icon={message.type === 'ai' ? <RobotOutlined /> : <UserOutlined />} 
                    size="small"
                  />
                )}
                <Card
                  size="small"
                  style={{
                    backgroundColor: message.type === 'user' ? '#1890ff' : '#fff',
                    color: message.type === 'user' ? '#fff' : '#000',
                    border: message.type === 'user' ? 'none' : '1px solid #d9d9d9'
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                  <Text 
                    style={{ 
                      fontSize: '12px', 
                      opacity: 0.7,
                      color: message.type === 'user' ? '#fff' : '#666'
                    }}
                  >
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Text>
                </Card>
                {message.type === 'user' && (
                  <Avatar icon={<UserOutlined />} size="small" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar icon={<RobotOutlined />} size="small" />
            <Card size="small">
              <Spin size="small" /> AI is typing...
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Interview completed" : "Type your message..."}
            disabled={disabled}
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled}
            style={{ height: 'auto' }}
          >
            Send
          </Button>
        </Space.Compact>
      </div>
    </Card>
  );
};

export default ChatInterface;
