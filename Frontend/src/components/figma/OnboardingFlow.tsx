import { useState } from 'react';
import UserProfiling from './UserProfiling';
import QuizFlow from './QuizFlow';

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [showQuiz, setShowQuiz] = useState(false);

  const handleProfilingComplete = () => {
    setShowQuiz(true);
  };

  if (showQuiz) {
    return (
      <QuizFlow 
        onComplete={onComplete} 
        onBackToOnboarding={() => setShowQuiz(false)}
      />
    );
  }

  return <UserProfiling onComplete={handleProfilingComplete} />;
}
