import React, { useState, useMemo } from 'react';
import {
  Table,
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Input,
  Select,
  Modal,
  Descriptions,
  Progress,
  Row,
  Col,
  Statistic,
  Divider,
  Empty
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  UserOutlined,
  TrophyOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const InterviewerDashboard = ({
  candidates,
  interviews,
  onViewCandidate
}) => {
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(searchText.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchText.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.finalScore || 0) - (a.finalScore || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [candidates, searchText, sortBy]);

  const columns = [
    {
      title: 'Candidate',
      key: 'candidate',
      render: (record) => (
        <Space>
          <UserOutlined />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.name}</div>
            <Text type="secondary">{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'interviewStatus',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          not_started: { color: 'default', text: 'Not Started' },
          in_progress: { color: 'processing', text: 'In Progress' },
          completed: { color: 'success', text: 'Completed' }
        };
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Score',
      dataIndex: 'finalScore',
      key: 'score',
      render: (score) => (
        <Space>
          <TrophyOutlined />
          <Text strong={!!score} type={score ? (score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger') : 'secondary'}>
            {score ? `${score}/100` : 'N/A'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Interview Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          size="small"
        >
          View Details
        </Button>
      ),
    },
  ];

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailModalVisible(true);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const getOverallPerformance = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const renderCandidateDetails = () => {
    if (!selectedCandidate) return null;

    const interview = interviews[selectedCandidate.id];
    const answers = interview?.answers || [];

    return (
      <div>
        <Descriptions title="Candidate Information" bordered column={2}>
          <Descriptions.Item label="Name">{selectedCandidate.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{selectedCandidate.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{selectedCandidate.phone}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={selectedCandidate.interviewStatus === 'completed' ? 'success' : 'processing'}>
              {selectedCandidate.interviewStatus === 'completed' ? 'Completed' : 'In Progress'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Interview Date">
            {new Date(selectedCandidate.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Final Score">
            {selectedCandidate.finalScore ? (
              <Space>
                <Progress
                  type="circle"
                  size={60}
                  percent={selectedCandidate.finalScore}
                  strokeColor={getScoreColor(selectedCandidate.finalScore)}
                />
                <Text strong style={{ color: getScoreColor(selectedCandidate.finalScore) }}>
                  {selectedCandidate.finalScore}/100
                </Text>
              </Space>
            ) : (
              <Text type="secondary">Not evaluated yet</Text>
            )}
          </Descriptions.Item>
        </Descriptions>

        {selectedCandidate.summary && (
          <>
            <Divider />
            <Title level={5}>AI Summary</Title>
            <Card>
              <Text style={{ whiteSpace: 'pre-wrap' }}>{selectedCandidate.summary}</Text>
            </Card>
          </>
        )}

        {answers.length > 0 && (
          <>
            <Divider />
            <Title level={5}>Interview Responses</Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {answers.map((answer, index) => {
                const question = interview?.questions.find(q => q.id === answer.questionId);
                return (
                  <Card key={answer.questionId} size="small">
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Title level={5} style={{ margin: 0 }}>
                          Question {index + 1}
                        </Title>
                        <Space>
                          <Tag color={
                            question?.difficulty === 'easy' ? 'green' :
                            question?.difficulty === 'medium' ? 'orange' : 'red'
                          }>
                            {question?.difficulty.toUpperCase()}
                          </Tag>
                          {answer.score && (
                            <Tag color={getScoreColor(answer.score)}>
                              Score: {answer.score}/100
                            </Tag>
                          )}
                        </Space>
                      </div>
                      <Text strong>Question:</Text>
                      <Text style={{ display: 'block', marginBottom: 8 }}>
                        {question?.text}
                      </Text>
                      <Text strong>Answer:</Text>
                      <Text style={{ display: 'block', marginBottom: 8 }}>
                        {answer.answer}
                      </Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                        <Space>
                          <ClockCircleOutlined />
                          Time spent: {answer.timeSpent}s
                        </Space>
                        <Text>Answered: {new Date(answer.timestamp).toLocaleTimeString()}</Text>
                      </div>
                    </Space>
                  </Card>
                );
              })}
            </Space>
          </>
        )}

        {answers.length === 0 && (
          <Empty description="No interview responses yet" />
        )}
      </div>
    );
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Title level={4} style={{ margin: 0 }}>
              Interview Dashboard
            </Title>
            <Text type="secondary">
              {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} total
            </Text>
          </Col>
          <Col span={8}>
            <Search
              placeholder="Search candidates..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={8}>
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
            >
              <Option value="score">Sort by Score</Option>
              <Option value="name">Sort by Name</Option>
              <Option value="date">Sort by Date</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Statistic
              title="Total Candidates"
              value={candidates.length}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Completed Interviews"
              value={candidates.filter(c => c.interviewStatus === 'completed').length}
              prefix={<TrophyOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Average Score"
              value={
                candidates.length > 0
                  ? Math.round(
                      candidates
                        .filter(c => c.finalScore)
                        .reduce((sum, c) => sum + (c.finalScore || 0), 0) /
                      Math.max(candidates.filter(c => c.finalScore).length, 1)
                    )
                  : 0
              }
              suffix="/ 100"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="In Progress"
              value={candidates.filter(c => c.interviewStatus === 'in_progress').length}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredAndSortedCandidates}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} candidates`
          }}
        />
      </Card>

      <Modal
        title={`Interview Details - ${selectedCandidate?.name}`}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        {renderCandidateDetails()}
      </Modal>
    </div>
  );
};

export default InterviewerDashboard;
