import React from 'react';
import { Modal, Typography, Space, Button, Card, Tag } from 'antd';
import { 
  ClockCircleOutlined, 
  PlayCircleOutlined, 
  UserOutlined,
  TrophyOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const WelcomeBackModal = ({
  visible,
  candidate,
  interview,
  onResume,
  onStartNew,
  onClose
}) => {
  const progress = interview ? (interview.currentQuestionIndex / interview.questions.length) * 100 : 0;
  const questionsAnswered = interview?.answers.length || 0;
  const totalQuestions = interview?.questions.length || 0;

  return (
    <Modal
      title="Welcome Back!"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <UserOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <Title level={3} style={{ marginTop: 16 }}>
            Hello, {candidate.name}!
          </Title>
          <Text type="secondary">
            We found your previous interview session. You can resume where you left off or start fresh.
          </Text>
        </div>

        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={5} style={{ margin: 0 }}>Interview Progress</Title>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Progress</Text>
                <Text strong>{Math.round(progress)}%</Text>
              </div>
              <div style={{ 
                width: '100%', 
                height: 8, 
                backgroundColor: '#f0f0f0', 
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#1890ff',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Space>
                <TrophyOutlined />
                <Text>Questions Answered: {questionsAnswered}/{totalQuestions}</Text>
              </Space>
              <Tag color={interview?.isPaused ? 'orange' : 'blue'}>
                {interview?.isPaused ? 'Paused' : 'In Progress'}
              </Tag>
            </div>

            {interview?.startTime && (
              <div>
                <Space>
                  <ClockCircleOutlined />
                  <Text type="secondary">
                    Started: {new Date(interview.startTime).toLocaleString()}
                  </Text>
                </Space>
              </div>
            )}
          </Space>
        </Card>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={onResume}
            size="large"
            style={{ minWidth: 120 }}
          >
            Resume Interview
          </Button>
          <Button
            onClick={onStartNew}
            size="large"
            style={{ minWidth: 120 }}
          >
            Start New
          </Button>
          <Button
            onClick={onClose}
            size="large"
            style={{ minWidth: 120 }}
          >
            Close
          </Button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Your progress is automatically saved. You can safely close and reopen the application.
          </Text>
        </div>
      </Space>
    </Modal>
  );
};

export default WelcomeBackModal;
