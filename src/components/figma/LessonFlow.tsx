import { useState } from 'react';
import imgChatGptImageFeb72026034014Pm1 from "@/assets/mascotbear.png";
import { Button } from "../ui/button";

// Types
type LessonQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

type AnswerResult = {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
};

// Sample lesson data - will be different per lesson
const lessonQuestions: LessonQuestion[] = [
  {
    id: 1,
    question: "What is a common way to introduce yourself in trading?",
    options: [
      "Talk about your trading style",
      "Share your P&L immediately",
      "Ask for stock tips",
      "Discuss your losses"
    ],
    correctAnswer: 0,
    explanation: "Traders often introduce themselves by sharing their trading style and approach."
  },
  {
    id: 2,
    question: "When discussing trading strategies, what should you focus on?",
    options: [
      "Risk management principles",
      "Guaranteed winning strategies",
      "Hot stock tips",
      "Pump and dump schemes"
    ],
    correctAnswer: 0,
    explanation: "Risk management is the foundation of successful trading."
  },
  {
    id: 3,
    question: "How do you build credibility in trading communities?",
    options: [
      "Share your process and learning",
      "Brag about wins only",
      "Hide your losses",
      "Give unprompted advice"
    ],
    correctAnswer: 0,
    explanation: "Sharing your learning process, including mistakes, builds trust and credibility."
  },
];

// Components
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/20">
      <div 
        className="h-full bg-[#f3ff00] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function MascotTopLeft() {
  return (
    <div className="absolute top-6 left-6 w-[80px] h-[120px] rounded-[40px] overflow-hidden z-10">
      <img 
        alt="LingoBear mascot" 
        className="w-full h-full object-cover" 
        src={imgChatGptImageFeb72026034014Pm1} 
      />
    </div>
  );
}

function StreakIndicator({ correctStreak, wrongStreak }: { correctStreak: number; wrongStreak: number }) {
  if (correctStreak === 0 && wrongStreak === 0) return null;

  // On Fire state for 3+ correct streak
  const isOnFire = correctStreak >= 3;

  return (
    <div className="absolute top-6 right-6 z-10">
      {isOnFire && (
        <div className="bg-[#ff1814] border-[3px] border-black rounded-[12px] px-4 py-2 shadow-[4px_4px_0px_#000000]">
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-[#f3ff00] uppercase tracking-wide">
            🔥 ON FIRE!
          </span>
        </div>
      )}

      {correctStreak > 0 && correctStreak < 3 && (
        <div className="bg-[#22c55e] border-[3px] border-black rounded-[12px] px-4 py-2 shadow-[4px_4px_0px_#000000]">
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-white uppercase tracking-wide">
            ✓ {correctStreak} in a row
          </span>
        </div>
      )}

      {wrongStreak > 0 && (
        <div className="bg-[#ef4444] border-[3px] border-black rounded-[12px] px-4 py-2 shadow-[4px_4px_0px_#000000]">
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-white uppercase tracking-wide">
            ✗ {wrongStreak} wrong
          </span>
        </div>
      )}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white border-[5px] border-black rounded-full w-[48px] h-[48px] flex items-center justify-center shadow-[8px_8px_0px_#000000] transition-all duration-150 hover:shadow-[4px_4px_0px_#000000] active:shadow-[1px_1px_0px_#000000]"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    </button>
  );
}

function QuestionScreen({ 
  question, 
  questionNumber, 
  totalQuestions, 
  onAnswer,
  onBack,
  selectedAnswer
}: { 
  question: LessonQuestion; 
  questionNumber: number; 
  totalQuestions: number;
  onAnswer: (answerIndex: number) => void;
  onBack: () => void;
  selectedAnswer: number | null;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-8 pt-8 overflow-y-auto hide-scrollbar">
      <div className="flex flex-col items-center gap-4 max-w-[700px] w-full">
        <div className="flex items-center gap-4 w-full justify-center">
          <BackButton onClick={onBack} />
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-[#f3ff00] uppercase tracking-wide">
            Question {questionNumber} of {totalQuestions}
          </p>
        </div>

        <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-white text-center uppercase tracking-wide leading-tight">
          {question.question}
        </h2>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(index)}
            disabled={selectedAnswer !== null}
            className={`w-full max-w-[520px] bg-white border-[5px] border-black rounded-[16px] px-8 py-5 font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-black capitalize tracking-wide transition-all duration-150 hover:shadow-[4px_4px_0px_#000000] active:shadow-[1px_1px_0px_#000000] shadow-[8px_8px_0px_#000000] text-left disabled:opacity-50 disabled:cursor-not-allowed
            ${selectedAnswer === index ? (index === question.correctAnswer ? 'bg-[#22c55e] text-white' : 'bg-[#ef4444] text-white') : ''}`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Show explanation after answer */}
      {selectedAnswer !== null && question.explanation && (
        <div className="max-w-[520px] w-full bg-white/10 border-[3px] border-white/30 rounded-[16px] px-6 py-4">
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-white">
            💡 {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

function CompletionScreen({ 
  onComplete, 
  correctCount, 
  totalCount,
  xpEarned,
  lessonTitle 
}: { 
  onComplete: () => void; 
  correctCount: number; 
  totalCount: number;
  xpEarned: number;
  lessonTitle: string;
}) {
  const percentage = Math.round((correctCount / totalCount) * 100);
  
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-8 py-12 overflow-y-auto hide-scrollbar">
      <div className="w-[200px] h-[300px] rounded-[100px] overflow-hidden">
        <img 
          alt="LingoBear mascot" 
          className="w-full h-full object-cover" 
          src={imgChatGptImageFeb72026034014Pm1} 
        />
      </div>

      <div className="flex flex-col items-center gap-6 max-w-[650px]">
        {/* Title */}
        <div className="bg-transparent border-[3px] border-white rounded-[20px] px-8 py-4">
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[24px] text-white text-center uppercase tracking-wide">
            Lesson Complete!
          </p>
        </div>
        
        {/* Lesson Score */}
        <div className="bg-white/10 rounded-[20px] px-8 py-6 border-[3px] border-white/20 w-full">
          <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[32px] text-[#f3ff00] text-center mb-2">
            {percentage}% Correct
          </h3>
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-white text-center">
            {correctCount} out of {totalCount} questions
          </p>
        </div>

        {/* XP Earned */}
        <div className="bg-[#f3ff00] rounded-[20px] px-8 py-6 border-[5px] border-black shadow-[8px_8px_0px_#000000] w-full">
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[40px] text-black text-center">
            +{xpEarned} XP
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={onComplete}
          className="mt-4 bg-white border-[5px] border-black rounded-[16px] px-12 py-4 shadow-[8px_8px_0px_#000000] transition-all duration-150 hover:shadow-[4px_4px_0px_#000000] active:shadow-[1px_1px_0px_#000000]"
        >
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-black uppercase tracking-wide">
            Continue
          </span>
        </button>
      </div>
    </div>
  );
}

// Main Lesson Flow Component
export default function LessonFlow({ 
  onComplete, 
  onBack,
  lessonTitle,
  xpReward,
  onXPEarned
}: { 
  onComplete: () => void; 
  onBack: () => void;
  lessonTitle: string;
  xpReward: number;
  onXPEarned: (amount: number) => void;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);

  const currentQuestion = lessonQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / lessonQuestions.length) * 100;

  const handleBack = () => {
    if (currentQuestionIndex === 0) {
      onBack();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    setSelectedAnswer(answerIndex);
    
    const result: AnswerResult = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect
    };
    
    setAnswers([...answers, result]);

    // Update streaks
    if (isCorrect) {
      setCorrectStreak(correctStreak + 1);
      setWrongStreak(0);
      // Award XP for correct answer (5 XP per correct answer)
      onXPEarned(5);
    } else {
      setWrongStreak(wrongStreak + 1);
      setCorrectStreak(0);
    }

    // Auto-advance after delay
    setTimeout(() => {
      if (currentQuestionIndex < lessonQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        // Show completion screen
        setShowCompletionScreen(true);
      }
    }, 1500);
  };

  const correctCount = answers.filter(a => a.isCorrect).length;

  if (showCompletionScreen) {
    return (
      <CompletionScreen 
        onComplete={onComplete} 
        correctCount={correctCount} 
        totalCount={lessonQuestions.length}
        xpEarned={xpReward}
        lessonTitle={lessonTitle}
      />
    );
  }

  return (
    <div className="bg-[#ff1814] h-full w-full relative">
      <ProgressBar progress={progress} />
      <MascotTopLeft />
      <StreakIndicator correctStreak={correctStreak} wrongStreak={wrongStreak} />
      
      <QuestionScreen
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={lessonQuestions.length}
        onAnswer={handleAnswer}
        onBack={handleBack}
        selectedAnswer={selectedAnswer}
      />
    </div>
  );
}
