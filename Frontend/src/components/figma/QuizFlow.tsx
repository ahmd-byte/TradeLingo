import { useState, useEffect } from "react";
import imgChatGptImageFeb72026034014Pm1 from "figma:asset/c47576d9fb019c19ae2380c4945c7cde9e97a55b.png";
import waveBearImage from "figma:asset/7ed597cb08cb24aaa452f4146ff3f118bd3b20b8.png";
import chartImage from "figma:asset/0190d5064779e34c50ff7ec67d9155ba71a49748.png";
import { Button } from "../ui/button";
import { startEducation, submitQuiz } from "../../api/education";
import type { QuizQuestion as BackendQuizQuestion } from "../../api/types";

// Types
type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct answer
  concept_tested?: string; // from backend
  image?: string; // Optional image for image-based questions
};

type AnswerResult = {
  questionId: number;
  selectedAnswer: number;
  selectedText: string; // the text of the selected answer
  isCorrect: boolean;
};

type TradingBehavior = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  traits: string[];
};

// Trading Behavior Types - Four types: Scalper, Day Trading, Swing Trading, Investment Trading
const tradingBehaviors: TradingBehavior[] = [
  {
    id: "scalper",
    name: "Scalper",
    emoji: "⚡",
    description:
      "You execute multiple quick trades throughout the day, holding positions for seconds to minutes. You thrive on fast execution and small, frequent profits.",
    traits: [
      "Very high screen time",
      "Lightning-fast decisions",
      "Rapid fire trades",
    ],
  },
  {
    id: "day-trading",
    name: "Day Trading",
    emoji: "📊",
    description:
      "You open and close trades within the same day. No overnight positions. You focus on intraday price movements and momentum.",
    traits: ["High screen time", "Fast decisions", "Timing is everything"],
  },
  {
    id: "swing-trading",
    name: "Swing Trading",
    emoji: "📈",
    description:
      "You hold trades for days to weeks, mixing technical analysis with some fundamentals. You focus on the bigger move and trend direction.",
    traits: ["Lower screen time", "Selective entries", "Discipline to hold"],
  },
  {
    id: "investment-trading",
    name: "Investment Trading",
    emoji: "💎",
    description:
      "You hold positions for weeks to months or longer. You focus on fundamental analysis, macro trends, and long-term value.",
    traits: ["Minimal screen time", "Patient approach", "Big picture focus"],
  },
];

// Sample Quiz Data
const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question:
      "If a trade is held for a few minutes to capture a small move, this is most commonly called:",
    options: [
      "Day trading / intraday",
      "Swing trading",
      "Fundamental investing",
      "Not sure",
    ],
    correctAnswer: 0,
  },
  {
    id: 2,
    question: "Which trader relies most on chart patterns and indicators?",
    options: [
      "Technical trader",
      "Fundamental trader",
      "Long-term investor",
      "Not sure",
    ],
    correctAnswer: 0,
  },
  {
    id: 3,
    question: "Which factor is most important when holding a trade for weeks?",
    options: [
      "Trend direction",
      "Entry speed",
      "Spread size",
      "Random price movement",
    ],
    correctAnswer: 0,
  },
  {
    id: 4,
    question: "Why can a high win rate still result in losses?",
    options: [
      "Losses are larger than wins",
      "Too few indicators",
      "Markets are unfair",
      "Not sure",
    ],
    correctAnswer: 0,
  },
  {
    id: 5,
    question:
      "Looking at this chart, what would you focus on first before taking a trade?",
    options: [
      "Overall trend direction",
      "Recent support and resistance",
      "Short-term volatility and momentum",
      "I'm not sure yet",
    ],
    correctAnswer: 0,
    image: chartImage,
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
        alt="SuperBear mascot"
        className="w-full h-full object-cover"
        src={imgChatGptImageFeb72026034014Pm1}
      />
    </div>
  );
}

function StreakIndicator({
  correctStreak,
  wrongStreak,
}: {
  correctStreak: number;
  wrongStreak: number;
}) {
  if (correctStreak === 0 && wrongStreak === 0) return null;

  // On Fire state for 3+ correct streak
  const isOnFire = correctStreak >= 3;

  return (
    <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
      {correctStreak > 0 && (
        <div
          key={`streak-${correctStreak}`}
          className={`border-[3px] border-black rounded-[12px] px-4 py-2 flex items-center gap-2 shadow-[4px_4px_0px_#000000] transition-all duration-300
            ${
              isOnFire
                ? "bg-gradient-to-r from-[#ff8c00] to-[#ff6b00] animate-pulse-3x scale-110"
                : correctStreak === 2
                  ? "bg-[#22c55e] scale-105"
                  : "bg-[#22c55e]"
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
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="black"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
  selectedAnswer,
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
            ${selectedAnswer === index ? (index === question.correctAnswer ? "bg-[#22c55e] text-white" : "bg-[#ef4444] text-white") : ""}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function EndScreen({
  onComplete,
  correctCount,
  totalCount,
}: {
  onComplete: () => void;
  correctCount: number;
  totalCount: number;
}) {
  const [animationStage, setAnimationStage] = useState<
    "analyzing" | "cooking" | "finalizing" | "complete" | "ready"
  >("analyzing");
  const [progress, setProgress] = useState(0);
  const [cookingText, setCookingText] = useState(
    "Identifying knowledge gaps...",
  );

  const percentage = Math.round((correctCount / totalCount) * 100);

  // Animation progression
  useEffect(() => {
    // Stage 1: Analyzing (2 seconds)
    const timer1 = setTimeout(() => {
      setAnimationStage("cooking");
      setProgress(25);
    }, 2000);

    // Stage 2: Cooking - cycling text and progress (4 seconds total)
    const timer2 = setTimeout(() => {
      setCookingText("Selecting perfect lessons...");
      setProgress(50);
    }, 3000);

    const timer3 = setTimeout(() => {
      setCookingText("Crafting your learning path...");
      setProgress(75);
    }, 4500);

    // Stage 3: Finalizing (2 seconds)
    const timer4 = setTimeout(() => {
      setAnimationStage("finalizing");
      setCookingText("Adding final touches...");
      setProgress(90);
    }, 6000);

    // Stage 4: Complete (1 second)
    const timer5 = setTimeout(() => {
      setAnimationStage("complete");
      setProgress(100);
    }, 8000);

    // Stage 5: Ready - show button (0.5 seconds after complete)
    const timer6 = setTimeout(() => {
      setAnimationStage("ready");
    }, 8500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, []);

  // Calculate how many segments should be filled (out of 10)
  const filledSegments = Math.floor((progress / 100) * 10);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8 py-12 relative overflow-hidden">
      {/* Confetti effect when complete */}
      {animationStage === "complete" && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10%",
                backgroundColor: ["#f3ff00", "#ff1814", "#3bd6ff", "#22c55e"][
                  Math.floor(Math.random() * 4)
                ],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Stage 1: Analyzing - Score reveal */}
      {animationStage === "analyzing" && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          {/* Bear thinking */}
          <div className="text-[100px] animate-bounce-slow">🤔</div>

          {/* Quiz Score */}
          <div className="bg-white/10 rounded-[20px] px-8 py-6 border-[3px] border-white/20 max-w-[600px] w-full animate-slide-up">
            <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[32px] text-[#f3ff00] text-center mb-2">
              {percentage}% Correct
            </h3>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-white text-center">
              {correctCount} out of {totalCount} questions
            </p>
          </div>

          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[24px] text-white text-center uppercase tracking-wide animate-pulse">
            Analyzing your answers...
          </p>
        </div>
      )}

      {/* Stage 2 & 3: Cooking/Generating */}
      {(animationStage === "cooking" || animationStage === "finalizing") && (
        <div className="flex flex-col items-center gap-8 w-full max-w-[700px]">
          {/* Cooking pot with bear */}
          <div className="relative">
            <div className="text-[120px] animate-cooking">🍳</div>
            {/* Ingredients flying in */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="text-[40px] absolute top-0 left-[-20px] animate-ingredient-1">
                📊
              </div>
              <div className="text-[40px] absolute top-0 right-[-20px] animate-ingredient-2">
                📈
              </div>
              <div className="text-[40px] absolute bottom-0 left-[10px] animate-ingredient-3">
                💡
              </div>
            </div>
          </div>

          {/* Bold Chunky Progress Bar */}
          <div className="w-full">
            <div className="flex gap-2 justify-center">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-3 border-[3px] border-black rounded-[6px] transition-all duration-300 ${
                    i < filledSegments
                      ? "bg-[#f3ff00] shadow-[3px_3px_0px_#000000]"
                      : "bg-white/20"
                  }`}
                />
              ))}
            </div>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-[#f3ff00] text-center mt-3 uppercase tracking-wide">
              {progress}%
            </p>
          </div>

          {/* Dynamic text */}
          <div className="bg-white/5 border-[3px] border-white/20 rounded-[20px] px-8 py-6 min-h-[100px] flex items-center justify-center">
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[24px] text-white text-center uppercase tracking-wide">
              {cookingText}
              {animationStage === "finalizing" && (
                <span className="inline-block animate-sparkle ml-2">✨</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Stage 4 & 5: Complete + Ready */}
      {(animationStage === "complete" || animationStage === "ready") && (
        <div className="flex flex-col items-center gap-8 w-full max-w-[700px]">
          {/* Success checkmark */}
          <div className="text-[120px] animate-success-bounce">✓</div>

          {/* Success message */}
          <div className="bg-transparent border-[4px] border-white rounded-[24px] px-12 py-4 animate-scale-in">
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[32px] text-white text-center uppercase tracking-wide">
              Lesson Plan Ready!
            </p>
          </div>

          {/* Generated card */}
          <div className="bg-white border-[5px] border-black rounded-[24px] p-8 shadow-[12px_12px_0px_#000000] w-full animate-scale-in-delayed">
            <div className="flex flex-col items-center gap-4">
              <div className="text-[60px] leading-none">🐻✨</div>
              <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-black text-center uppercase tracking-wide leading-tight">
                Your Personalized Path is Ready!
              </h2>
              <p className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-black text-center leading-relaxed">
                SuperBear has crafted a custom learning journey based on your
                knowledge level and goals.
              </p>
            </div>
          </div>

          {/* Shaking CTA Button */}
          {animationStage === "ready" && (
            <button
              onClick={onComplete}
              className="bg-[#22c55e] border-[5px] border-black rounded-[24px] px-16 py-6 shadow-[8px_8px_0px_#000000] hover:shadow-[12px_12px_0px_#000000] active:shadow-[4px_4px_0px_#000000] transition-all duration-150 max-w-[600px] w-full animate-shake-attention"
            >
              <span className="font-['Arimo:Bold',sans-serif] font-bold text-[32px] text-white uppercase tracking-wide">
                Check It Out! 🚀
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Quiz Intro Screen Component
function QuizIntroScreen({
  onStart,
  onBack,
}: {
  onStart: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-12 px-8">
      {/* Title */}
      <h1 className="font-['Arimo:Bold',sans-serif] font-bold text-[72px] text-white text-center uppercase tracking-wide">
        Diagnostic Quiz
      </h1>

      {/* Subtitle */}
      <p className="font-['Arimo:Bold',sans-serif] font-bold text-[24px] text-[#f3ff00] text-center uppercase tracking-wide max-w-[700px] leading-relaxed">
        Let's assess what you know.
        <br />
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
export default function QuizFlow({
  onComplete,
  onBackToOnboarding,
}: {
  onComplete: () => void;
  onBackToOnboarding?: () => void;
}) {
  const [showIntro, setShowIntro] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [backendQuestions, setBackendQuestions] = useState<
    BackendQuizQuestion[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use backend questions if available, otherwise fallback to hardcoded
  const activeQuestions: QuizQuestion[] =
    backendQuestions.length > 0
      ? backendQuestions.map((q, i) => ({
          id: i + 1,
          question: q.question,
          concept_tested: q.concept_tested,
          // Backend returns open-ended questions, provide generic options
          options: [
            "Yes, I understand this well",
            "I have some knowledge",
            "I'm not sure about this",
            "I don't know this at all",
          ],
          correctAnswer: 0, // First option is "correct" for scoring
        }))
      : quizQuestions;

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const progress =
    activeQuestions.length > 0
      ? ((currentQuestionIndex + 1) / activeQuestions.length) * 100
      : 0;

  // Fetch questions from backend when quiz starts
  const handleStartQuiz = async () => {
    setShowIntro(false);
    setIsLoadingQuestions(true);
    setLoadError(null);

    try {
      const response = await startEducation();
      console.log(
        "[QuizFlow] startEducation response:",
        JSON.stringify(response, null, 2),
      );
      if (response.quiz_questions && response.quiz_questions.length > 0) {
        setBackendQuestions(response.quiz_questions);
      }
      // If no questions returned, fall back to hardcoded questions
    } catch (error) {
      console.error("Failed to load quiz questions from backend:", error);
      // Fall back to hardcoded questions silently
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      setAnswers(answers.slice(0, -1));
      recalculateStreaks(answers.slice(0, -1));
    } else if (onBackToOnboarding) {
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
    if (selectedAnswer !== null) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      setCorrectStreak(correctStreak + 1);
      setWrongStreak(0);
    } else {
      setWrongStreak(wrongStreak + 1);
      setCorrectStreak(0);
    }

    const newAnswer: AnswerResult = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      selectedText: currentQuestion.options[answerIndex],
      isCorrect,
    };
    setAnswers([...answers, newAnswer]);
    setSelectedAnswer(answerIndex);

    setTimeout(() => {
      if (currentQuestionIndex < activeQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        // Quiz complete — submit to backend
        handleQuizComplete([...answers, newAnswer]);
      }
    }, 1200);
  };

  const handleQuizComplete = async (finalAnswers: AnswerResult[]) => {
    setShowEndScreen(true);

    // Submit answers to backend if we used backend questions
    if (backendQuestions.length > 0) {
      setIsSubmitting(true);
      try {
        const submitResult = await submitQuiz({
          quiz_questions: backendQuestions,
          quiz_answers: finalAnswers.map((a) => a.selectedText),
        });
        console.log(
          "[QuizFlow] submitQuiz response:",
          JSON.stringify(submitResult, null, 2),
        );
      } catch (error) {
        console.error("Failed to submit quiz to backend:", error);
        // Continue anyway — the end screen will still show
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const correctCount = answers.filter((a) => a.isCorrect).length;

  // Show intro screen first
  if (showIntro) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen w-full relative">
        <QuizIntroScreen
          onStart={handleStartQuiz}
          onBack={onBackToOnboarding}
        />
      </div>
    );
  }

  // Show loading state while fetching questions
  if (isLoadingQuestions) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen w-full relative flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="text-[80px] animate-bounce-slow">🐻</div>
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[24px] text-white uppercase tracking-wide animate-pulse">
            Preparing your quiz...
          </p>
        </div>
      </div>
    );
  }

  // Show end screen when quiz is complete
  if (showEndScreen) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen w-full relative">
        <EndScreen
          onComplete={onComplete}
          correctCount={correctCount}
          totalCount={activeQuestions.length}
        />
      </div>
    );
  }

  // Show quiz questions
  return (
    <div className="bg-[var(--bg-primary)] min-h-screen w-full relative">
      <ProgressBar progress={progress} />
      <MascotTopLeft />
      <StreakIndicator
        correctStreak={correctStreak}
        wrongStreak={wrongStreak}
      />

      <QuestionScreen
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={activeQuestions.length}
        onAnswer={handleAnswer}
        onBack={handleBack}
        selectedAnswer={selectedAnswer}
      />
    </div>
  );
}
