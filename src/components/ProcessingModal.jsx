import React from 'react';
import { Modal, Spin, Typography, Space, Progress } from 'antd';
import { 
  FileTextOutlined, 
  RobotOutlined, 
  CheckCircleOutlined,
  LoadingOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

const ProcessingModal = ({ 
  visible, 
  type = 'parsing', // 'parsing' or 'generating'
  progress = 0,
  onComplete 
}) => {
  const getModalContent = () => {
    if (type === 'parsing') {
      return {
        title: 'Parsing Your Resume',
        icon: <FileTextOutlined className="text-blue-500 text-4xl" />,
        description: 'Our AI is analyzing your resume and extracting key information...',
        steps: [
          'Reading document content',
          'Extracting personal information',
          'Identifying skills and experience',
          'Analyzing work history',
          'Finalizing profile data'
        ],
        progressColor: '#3b82f6'
      };
    } else {
      return {
        title: 'Generating Interview Questions',
        icon: <RobotOutlined className="text-purple-500 text-4xl" />,
        description: 'Our AI is creating personalized interview questions based on your profile...',
        steps: [
          'Analyzing your background',
          'Identifying key competencies',
          'Generating technical questions',
          'Creating behavioral scenarios',
          'Finalizing question set'
        ],
        progressColor: '#8b5cf6'
      };
    }
  };

  const content = getModalContent();
  const currentStep = Math.floor((progress / 100) * content.steps.length);
  const currentStepIndex = Math.min(currentStep, content.steps.length - 1);

  return (
    <Modal
      open={visible}
      closable={false}
      footer={null}
      centered
      width={500}
      className="processing-modal"
      styles={{
        body: {
          padding: '40px 32px',
          textAlign: 'center'
        }
      }}
    >
      <div className="space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative modal-icon">
            {content.icon}
            <div className="absolute -top-2 -right-2">
              <Spin 
                indicator={<LoadingOutlined style={{ fontSize: 16, color: content.progressColor }} spin />} 
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <Title level={3} className="text-gray-800 mb-2">
            {content.title}
          </Title>
          <Text className="text-gray-600 text-base">
            {content.description}
          </Text>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Text className="text-sm font-medium text-gray-700">Progress</Text>
            <Text className="text-sm font-semibold" style={{ color: content.progressColor }}>
              {Math.round(progress)}%
            </Text>
          </div>
          <Progress
            percent={progress}
            strokeColor={{
              '0%': content.progressColor,
              '100%': content.progressColor,
            }}
            trailColor="#e5e7eb"
            strokeWidth={8}
            showInfo={false}
            className="rounded-full"
          />
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {content.steps.map((step, index) => (
            <div 
              key={index}
              className={`step-item flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                index <= currentStepIndex 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                index < currentStepIndex 
                  ? 'bg-green-500' 
                  : index === currentStepIndex 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300'
              }`}>
                {index < currentStepIndex ? (
                  <CheckCircleOutlined className="text-white text-xs" />
                ) : index === currentStepIndex ? (
                  <Spin size="small" />
                ) : (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <Text className={`text-sm font-medium transition-colors duration-300 ${
                index <= currentStepIndex ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {step}
              </Text>
            </div>
          ))}
        </div>

        {/* Status Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Text className="text-blue-800 text-sm">
            {type === 'parsing' 
              ? 'Please wait while we process your resume. This usually takes 10-15 seconds.'
              : 'Creating personalized questions for your interview. This may take 20-30 seconds.'
            }
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default ProcessingModal;