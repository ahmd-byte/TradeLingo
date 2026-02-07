import { useState } from 'react';
import imgChatGptImageFeb72026034014Pm1 from "@/assets/mascotbear.png";
import waveBearImage from "@/assets/bearwave.png";
import chartImage from "@/assets/stockmarketsnip.png";
import { Button } from "../ui/button";

// Types
type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct answer
  image?: string; // Optional image for image-based questions
};

type AnswerResult = {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
};

type TradingBehavior = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  traits: string[];
};

// Trading Behavior Types
const tradingBehaviors: TradingBehavior[] = [
  {
    id: 'day-trading',
    name: 'Day Trading / Intraday',
    emoji: '⚡',
    description: 'You open and close trades within the same day. No overnight positions. You thrive on short timeframes and react to price movement and momentum.',
    traits: ['High screen time', 'Fast decisions', 'Timing is everything']
  },
  {
    id: 'technical-trading',
    name: 'Technical Trading',
    emoji: '📊',
    description: 'You trade based on charts, indicators, and patterns. Support/resistance, RSI, and moving averages are your tools.',
    traits: ['Rule-driven', 'Likes confirmations', 'Structure and patterns']
  },
  {
    id: 'fundamental-trading',
    name: 'Fundamental Trading',
    emoji: '📰',
    description: 'You trade based on news, macro events, and economic data. Interest rates, CPI, earnings—you look for the reasons behind price moves.',
    traits: ['Patient approach', 'Less frequent trades', 'Context-driven']
  },
  {
    id: 'swing-trading',
    name: 'Swing Trading',
    emoji: '📈',
    description: 'You hold trades for days to weeks, mixing technical analysis with some fundamentals. You focus on the bigger move and trend direction.',
    traits: ['Lower screen time', 'Selective entries', 'Discipline to hold']
  }
];

// Sample Quiz Data
const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "If a trade is held for a few minutes to capture a small move, this is most commonly called:",
    options: [
      "Day trading / intraday",
      "Swing trading",
      "Fundamental investing",
      "Not sure"
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    question: "Which trader relies most on chart patterns and indicators?",
    options: [
      "Technical trader",
      "Fundamental trader",
      "Long-term investor",
      "Not sure"
    ],
    correctAnswer: 0
  },
  {
    id: 3,
    question: "Which factor is most important when holding a trade for weeks?",
    options: [
      "Trend direction",
      "Entry speed",
      "Spread size",
      "Random price movement"
    ],
    correctAnswer: 0
  },
  {
    id: 4,
    question: "Why can a high win rate still result in losses?",
    options: [
      "Losses are larger than wins",
      "Too few indicators",
      "Markets are unfair",
      "Not sure"
    ],
    correctAnswer: 0
  },
  {
    id: 5,
    question: "Looking at this chart, what would you focus on first before taking a trade?",
    options: [
      "Overall trend direction",
      "Recent support and resistance",
      "Short-term volatility and momentum",
      "I'm not sure yet"
    ],
    correctAnswer: 0,
    image: chartImage
  }
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
    <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
      {correctStreak > 0 && (
        <div 
          key={`streak-${correctStreak}`}
          className={`border-[3px] border-black rounded-[12px] px-4 py-2 flex items-center gap-2 shadow-[4px_4px_0px_#000000] transition-all duration-300
            ${isOnFire 
              ? 'bg-gradient-to-r from-[#ff8c00] to-[#ff6b00] animate-pulse-3x scale-110' 
              : correctStreak === 2 
                ? 'bg-[#22c55e] scale-105' 
                : 'bg-[#22c55e]'
            }`}
        >
          {isOnFire ? (
            <>
              <span className="text-[24px]">🔥</span>
              <span className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-white uppercase">
                x{correctStreak}
              </span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-white uppercase">
                +{correctStreak}
              </span>
            </>
          )}
        </div>
      )}
      {wrongStreak > 0 && (
        <div className="bg-[#ef4444] border-[3px] border-black rounded-[12px] px-4 py-2 flex items-center gap-2 shadow-[4px_4px_0px_#000000]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-white uppercase">
            {wrongStreak}
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
  question: QuizQuestion; 
  questionNumber: number; 
  totalQuestions: number;
  onAnswer: (answerIndex: number) => void;
  onBack: () => void;
  selectedAnswer: number | null;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8 pt-8">
      <div className="flex flex-col items-center gap-4 max-w-[700px] w-full">
        <div className="flex items-center gap-4 w-full justify-center">
          <BackButton onClick={onBack} />
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-[#f3ff00] uppercase tracking-wide">
            Question {questionNumber} of {totalQuestions}
          </p>
        </div>

        {/* Chart Image - Show if question has an image */}
        {question.image && (
          <div className="w-full max-w-[600px] border-[5px] border-black rounded-[16px] overflow-hidden bg-white">
            <img 
              src={question.image} 
              alt="Trading chart" 
              className="w-full h-auto"
            />
          </div>
        )}

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
    </div>
  );
}

function EndScreen({ onComplete, correctCount, totalCount }: { onComplete: () => void; correctCount: number; totalCount: number }) {
  // For now, randomly select a trading behavior (later will be based on quiz answers)
  const randomBehavior = tradingBehaviors[Math.floor(Math.random() * tradingBehaviors.length)];
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8 py-12">
      {/* Title */}
      <div className="bg-transparent border-[4px] border-white rounded-[24px] px-12 py-4">
        <p className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-white text-center uppercase tracking-wide">
          Your Trading Behavior
        </p>
      </div>

      {/* Trading Type Reveal Card */}
      <div className="bg-white border-[5px] border-black rounded-[24px] p-10 shadow-[12px_12px_0px_#000000] max-w-[700px] w-full">
        <div className="flex flex-col items-center gap-5">
          {/* Emoji Icon */}
          <div className="text-[80px] leading-none">
            {randomBehavior.emoji}
          </div>
          
          {/* Type Name */}
          <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[36px] text-black text-center uppercase tracking-wide leading-tight">
            {randomBehavior.name}
          </h2>
          
          {/* Description */}
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-black text-center leading-relaxed max-w-[600px]">
            {randomBehavior.description}
          </p>
          
          {/* Traits */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {randomBehavior.traits.map((trait, index) => (
              <div 
                key={index}
                className="bg-[#f3ff00] border-[3px] border-black rounded-[16px] px-5 py-3"
              >
                <span className="font-['Arimo:Bold',sans-serif] font-bold text-[15px] text-black uppercase tracking-wide">
                  {trait}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Quiz Score */}
      <p className="font-['Arimo:Bold',sans-serif] font-bold text-[24px] text-[#f3ff00] uppercase tracking-wide">
        Quiz Score: {correctCount}/{totalCount} correct
      </p>

      {/* Start Button */}
      <button
        onClick={onComplete}
        className="bg-white border-[5px] border-black rounded-[24px] px-16 py-6 shadow-[8px_8px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] active:shadow-[1px_1px_0px_#000000] transition-all duration-150 max-w-[600px] w-full"
      >
        <span className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-black uppercase tracking-wide">
          Start My Learning Path
        </span>
      </button>
    </div>
  );
}

// Quiz Intro Screen Component
function QuizIntroScreen({ onStart, onBack }: { onStart: () => void; onBack?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-12 px-8">
      {/* Title */}
      <h1 className="font-['Arimo:Bold',sans-serif] font-bold text-[72px] text-white text-center uppercase tracking-wide">
        Quiz Time!
      </h1>

      {/* Subtitle */}
      <p className="font-['Arimo:Bold',sans-serif] font-bold text-[24px] text-[#f3ff00] text-center uppercase tracking-wide max-w-[700px] leading-relaxed">
        Let's test your trading knowledge.<br />
        We'll craft your personalized lesson plan.
      </p>

      {/* Waving Bear */}
      <div className="w-[300px] h-[300px] flex items-center justify-center">
        <img 
          src={waveBearImage} 
          alt="Waving Bear" 
          className="w-full h-full object-contain"
        />
      </div>

      {/* Button */}
      <button
        onClick={onStart}
        className="bg-white border-[5px] border-black rounded-[24px] px-24 py-6 shadow-[8px_8px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] active:shadow-[1px_1px_0px_#000000] transition-all duration-150"
      >
        <span className="font-['Arimo:Bold',sans-serif] font-bold text-[32px] text-black uppercase tracking-wide">
          Let's Go!
        </span>
      </button>

      {/* Back Link */}
      {onBack && (
        <button
          onClick={onBack}
          className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-white uppercase tracking-wide hover:text-[#f3ff00] transition-colors"
        >
          Back
        </button>
      )}
    </div>
  );
}

// Main Quiz Flow Component
export default function QuizFlow({ onComplete, onBackToOnboarding }: { onComplete: () => void; onBackToOnboarding?: () => void }) {
  const [showIntro, setShowIntro] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [showEndScreen, setShowEndScreen] = useState(false);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      // Go back to previous question
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      // Remove last answer from array
      setAnswers(answers.slice(0, -1));
      // Recalculate streaks based on remaining answers
      recalculateStreaks(answers.slice(0, -1));
    } else if (onBackToOnboarding) {
      // Go back to onboarding flow
      onBackToOnboarding();
    }
  };

  const recalculateStreaks = (answerHistory: AnswerResult[]) => {
    if (answerHistory.length === 0) {
      setCorrectStreak(0);
      setWrongStreak(0);
      return;
    }

    let correct = 0;
    let wrong = 0;
    
    // Count from the end backwards
    for (let i = answerHistory.length - 1; i >= 0; i--) {
      if (answerHistory[i].isCorrect) {
        if (wrong > 0) break;
        correct++;
      } else {
        if (correct > 0) break;
        wrong++;
      }
    }

    setCorrectStreak(correct);
    setWrongStreak(wrong);
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    // Update streaks
    if (isCorrect) {
      setCorrectStreak(correctStreak + 1);
      setWrongStreak(0);
    } else {
      setWrongStreak(wrongStreak + 1);
      setCorrectStreak(0);
    }

    // Record answer
    const newAnswer: AnswerResult = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect
    };
    setAnswers([...answers, newAnswer]);
    setSelectedAnswer(answerIndex);

    // Auto-advance after delay
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        setShowEndScreen(true);
      }
    }, 1200);
  };

  const correctCount = answers.filter(a => a.isCorrect).length;

  // Show intro screen first
  if (showIntro) {
    return (
      <div className="bg-[#ff1814] min-h-screen w-full relative">
        <QuizIntroScreen 
          onStart={() => setShowIntro(false)} 
          onBack={onBackToOnboarding}
        />
      </div>
    );
  }

  // Show end screen when quiz is complete
  if (showEndScreen) {
    return (
      <div className="bg-[#ff1814] min-h-screen w-full relative">
        <EndScreen onComplete={onComplete} correctCount={correctCount} totalCount={quizQuestions.length} />
      </div>
    );
  }

  // Show quiz questions
  return (
    <div className="bg-[#ff1814] min-h-screen w-full relative">
      <ProgressBar progress={progress} />
      <MascotTopLeft />
      <StreakIndicator correctStreak={correctStreak} wrongStreak={wrongStreak} />
      
      <QuestionScreen
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={quizQuestions.length}
        onAnswer={handleAnswer}
        onBack={handleBack}
        selectedAnswer={selectedAnswer}
      />
    </div>
  );
}
