import { useState, useEffect, useRef } from 'react';

export const useTimer = (initialTime, isActive = true, onExpire) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(isActive);
  const intervalRef = useRef(null);
  const lastInitialTime = useRef(initialTime);

  // Reset timer when initialTime changes
  useEffect(() => {
    if (initialTime !== lastInitialTime.current) {
      console.log('useTimer - initialTime changed from', lastInitialTime.current, 'to', initialTime);
      lastInitialTime.current = initialTime;
      setTimeRemaining(initialTime);
    }
  }, [initialTime]);

  // Start/stop timer based on isActive
  useEffect(() => {
    console.log('useTimer - isActive changed:', isActive, 'timeRemaining:', timeRemaining);
    
    if (!isActive || timeRemaining <= 0) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    setIsRunning(true);
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        console.log('Timer countdown:', newTime, 'prev:', prev);
        
        if (newTime <= 0) {
          console.log('Timer expired!');
          if (onExpire) {
            onExpire();
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, onExpire]);

  // Handle timer expiration
  useEffect(() => {
    if (timeRemaining <= 0 && isActive) {
      console.log('Timer expired! Triggering onExpire');
      if (onExpire) {
        onExpire();
      }
    }
  }, [timeRemaining, isActive, onExpire]);

  const reset = (newTime) => {
    setTimeRemaining(newTime);
  };

  const pause = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resume = () => {
    if (timeRemaining > 0) {
      setIsRunning(true);
    }
  };

  return {
    timeRemaining,
    isRunning,
    reset,
    pause,
    resume
  };
};
