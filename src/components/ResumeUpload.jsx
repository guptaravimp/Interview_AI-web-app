import React, { useState, useEffect } from 'react';
import { Upload, Button, Form, Input, message, Card, Typography, Space } from 'antd';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { parseResume } from '../utils/resumeParser.js';
import ProcessingModal from './ProcessingModal.jsx';

const { Title, Text } = Typography;

const ResumeUpload = ({ onResumeParsed }) => {
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [form] = Form.useForm();
  const [showParsingModal, setShowParsingModal] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);

  const handleFileUpload = async (file) => {
    setLoading(true);
    setShowParsingModal(true);
    setParsingProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setParsingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      const data = await parseResume(file);
      
      // Complete progress
      setParsingProgress(100);
      
      // Wait a moment to show completion
      setTimeout(() => {
        setParsedData(data);
        form.setFieldsValue(data);
        setShowParsingModal(false);
        setParsingProgress(0);
        message.success('Resume parsed successfully!');
      }, 1000);
      
    } catch (error) {
      setShowParsingModal(false);
      setParsingProgress(0);
      message.error(error instanceof Error ? error.message : 'Failed to parse resume');
    } finally {
      setLoading(false);
    }
    return false; // Prevent auto upload
  };

  const handleSubmit = (values) => {
    if (!parsedData) {
      message.error('Please upload a resume first');
      return;
    }
    
    const completeData = {
      ...parsedData,
      name: values.name || parsedData.name,
      email: values.email || parsedData.email,
      phone: values.phone || parsedData.phone,
    };
    
    onResumeParsed({ ...completeData, file: new File([], 'resume') });
  };

  const uploadProps = {
    beforeUpload: handleFileUpload,
    accept: '.pdf,.docx',
    showUploadList: false,
    disabled: loading
  };

  return (
    <>
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Upload Your Resume</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Upload your resume in PDF or DOCX format. We'll extract your information automatically.
        </Text>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Upload {...uploadProps}>
            <Button 
              icon={<UploadOutlined />} 
              loading={loading}
              size="large"
              style={{ width: '100%' }}
            >
              {loading ? 'Parsing Resume...' : 'Upload Resume'}
            </Button>
          </Upload>

          {parsedData && (
            <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
              <Space align="center">
                <FileTextOutlined style={{ color: '#52c41a' }} />
                <Text strong>Resume parsed successfully!</Text>
              </Space>
            </Card>
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ width: '100%' }}
          >
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: 'Please enter your full name' }]}
            >
              <Input 
                placeholder="Enter your full name" 
                disabled={loading}
              />
            </Form.Item>

            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input 
                placeholder="Enter your email address" 
                disabled={loading}
              />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[{ required: true, message: 'Please enter your phone number' }]}
            >
              <Input 
                placeholder="Enter your phone number" 
                disabled={loading}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                style={{ width: '100%' }}
                disabled={!parsedData}
              >
                Start Interview
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>

      <ProcessingModal
        visible={showParsingModal}
        type="parsing"
        progress={parsingProgress}
      />
    </>
  );
};

export default ResumeUpload;
