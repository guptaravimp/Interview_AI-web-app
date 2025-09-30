import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ConfigProvider, Layout, Tabs, Space, Spin, App as AntApp } from 'antd';
import { UserOutlined, DashboardOutlined } from '@ant-design/icons';
import { store, persistor } from './store/index.js';
import { useAppDispatch, useAppSelector } from './hooks/redux.js';
import { setCurrentTab, openWelcomeBackModal } from './store/slices/appSlice.js';
import IntervieweeTab from './components/IntervieweeTab.jsx';
import InterviewerDashboard from './components/InterviewerDashboard.jsx';
import WelcomeBackModal from './components/WelcomeBackModal.jsx';
import Header from './components/Header.jsx';

const { Content } = Layout;

const AppContent = () => {
  const dispatch = useAppDispatch();
  const { currentTab, isWelcomeBackModalOpen, pendingCandidateId } = useAppSelector(state => state.app);
  const { candidates } = useAppSelector(state => state.candidates);
  const { interviews } = useAppSelector(state => state.interviews);

  // Check for incomplete interviews on app load
  useEffect(() => {
    const incompleteCandidate = candidates.find(candidate => 
      candidate.interviewStatus === 'in_progress' && 
      interviews[candidate.id] && 
      !interviews[candidate.id].endTime
    );

    if (incompleteCandidate) {
      dispatch(openWelcomeBackModal(incompleteCandidate.id));
    }
  }, [candidates, interviews, dispatch]);

  const handleTabChange = (key) => {
    dispatch(setCurrentTab(key));
  };

  const handleWelcomeBackResume = () => {
    // Resume logic would be implemented here
    dispatch(setCurrentTab('interviewee'));
  };

  const handleWelcomeBackNew = () => {
    // Start new interview logic would be implemented here
    dispatch(setCurrentTab('interviewee'));
  };

  const handleWelcomeBackClose = () => {
    // Close modal logic
  };

  const pendingCandidate = candidates.find(c => c.id === pendingCandidateId);
  const pendingInterview = pendingCandidate ? interviews[pendingCandidate.id] : undefined;

  const tabItems = [
    {
      key: 'interviewee',
      label: (
        <Space>
          <UserOutlined />
          Interviewee
        </Space>
      ),
      children: <IntervieweeTab />
    },
    {
      key: 'interviewer',
      label: (
        <Space>
          <DashboardOutlined />
          Interviewer Dashboard
        </Space>
      ),
      children: (
        <InterviewerDashboard
          candidates={candidates}
          interviews={interviews}
          onViewCandidate={(candidateId) => {
            console.log('View candidate:', candidateId);
          }}
        />
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">AI Interview Assistant</h1>
            <p className="text-blue-100 mt-1">Powered by advanced AI technology</p>
          </div>
          
          <div className="p-6">
            <Tabs
              activeKey={currentTab}
              onChange={handleTabChange}
              items={tabItems}
              size="large"
              className="professional-tabs"
              style={{ 
                backgroundColor: 'transparent',
                padding: '0',
                borderRadius: '0',
                boxShadow: 'none'
              }}
            />
          </div>
        </div>
      </main>

      {pendingCandidate && pendingInterview && (
        <WelcomeBackModal
          visible={isWelcomeBackModalOpen}
          candidate={pendingCandidate}
          interview={pendingInterview}
          onResume={handleWelcomeBackResume}
          onStartNew={handleWelcomeBackNew}
          onClose={handleWelcomeBackClose}
        />
      )}
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<Spin size="large" style={{ display: 'block', margin: '50px auto' }} />} persistor={persistor}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#1890ff',
              borderRadius: 6,
            },
          }}
        >
          <AntApp>
            <AppContent />
          </AntApp>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
