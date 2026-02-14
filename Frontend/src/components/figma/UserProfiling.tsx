import { useState, useEffect } from 'react';
import imgChatGptImageFeb72026034014Pm1 from "figma:asset/c47576d9fb019c19ae2380c4945c7cde9e97a55b.png";
import derivLogo from "figma:asset/d70baeb329438db450b57deadd82b6c061377d05.png";
import { Button } from "../ui/button";

// Types
type TraderLevel = 'new' | 'occasional' | 'experienced' | null;
type OnboardingAnswers = {
  name?: string;
  email?: string;
  traderLevel: TraderLevel;
  startingPoint?: string;
  preferredMarket?: string;
  learningStyle?: string;
  riskTolerance?: string;
  tradingFrequency?: string;
  derivConnected?: boolean;
};

// Components
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="absolute top-4 left-0 right-0 h-2 bg-black/20">
      <div 
        className="h-full bg-[#f3ff00] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 flex items-center justify-center text-white hover:opacity-70 transition-opacity flex-shrink-0"
      aria-label="Go back"
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>
  );
}

function MascotTopLeft() {
  return (
    <div className="absolute top-8 left-8 w-[120px] h-[180px] rounded-[60px] overflow-hidden">
      <img 
        alt="SuperBear mascot" 
        className="w-full h-full object-cover" 
        src={imgChatGptImageFeb72026034014Pm1} 
      />
    </div>
  );
}

function OptionCard({ text, onClick, icon }: { text: string; onClick: () => void; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full max-w-[480px] bg-white border-[5px] border-black rounded-[16px] px-8 py-6 font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-black capitalize tracking-wide transition-all duration-150 hover:shadow-[4px_4px_0px_#000000] active:shadow-[1px_1px_0px_#000000] shadow-[8px_8px_0px_#000000] flex items-center gap-4"
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <span className="flex-1 text-left">{text}</span>
    </button>
  );
}

function TraderLevelIcon({ level }: { level: 'new' | 'occasional' | 'experienced' }) {
  const bars = {
    new: [
      { height: 12, color: '#60a5fa' },
    ],
    occasional: [
      { height: 12, color: '#60a5fa' },
      { height: 20, color: '#60a5fa' },
    ],
    experienced: [
      { height: 12, color: '#60a5fa' },
      { height: 20, color: '#60a5fa' },
      { height: 28, color: '#60a5fa' },
    ],
  };

  return (
    <div className="w-14 h-10 border-2 border-[#4a7a9a] rounded-lg bg-[#1a2f3f] flex items-end justify-center gap-1.5 px-2 py-2">
      {bars[level].map((bar, index) => (
        <div
          key={index}
          className="w-2.5 rounded-sm"
          style={{ height: `${bar.height}px`, backgroundColor: bar.color }}
        />
      ))}
    </div>
  );
}

// Step Components
function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-12">
      <div className="relative max-w-[600px] w-full px-8">
        <div className="bg-white border-[4px] border-black rounded-[20px] px-8 py-6 shadow-[6px_6px_0px_#000000]">
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-black text-center uppercase tracking-wide">
            Hi there! I'm your SuperBear!
          </p>
        </div>
        {/* Speech bubble tail pointing down */}
        <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-black" />
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-white absolute top-[-20px] left-[-12px]" />
        </div>
      </div>

      <div className="w-[280px] h-[420px] rounded-[140px] overflow-hidden">
        <img 
          alt="SuperBear mascot" 
          className="w-full h-full object-cover" 
          src={imgChatGptImageFeb72026034014Pm1} 
        />
      </div>

      <Button 
        variant="offset" 
        className="h-[68px] rounded-[16px] w-[480px] max-w-[480px] font-['Arimo:Bold',sans-serif] text-[24px] tracking-wide uppercase"
        onClick={onContinue}
      >
        CONTINUE
      </Button>
    </div>
  );
}

function TraderLevelStep({ onSelect, onBack }: { onSelect: (level: TraderLevel) => void; onBack?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      <MascotTopLeft />
      
      <div className="flex items-center gap-4 max-w-[700px] w-full justify-center">
        {onBack && <BackButton onClick={onBack} />}
        <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-white text-center uppercase tracking-wide">
          How would you describe yourself as a trader?
        </h2>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <OptionCard 
          text="New trader (never traded before)" 
          onClick={() => onSelect('new')} 
          icon={<TraderLevelIcon level="new" />}
        />
        <OptionCard 
          text="Occasional trader" 
          onClick={() => onSelect('occasional')} 
          icon={<TraderLevelIcon level="occasional" />}
        />
        <OptionCard 
          text="Experienced trader" 
          onClick={() => onSelect('experienced')} 
          icon={<TraderLevelIcon level="experienced" />}
        />
      </div>
    </div>
  );
}

function StartingPointStep({ onSelect, onBack }: { onSelect: (answer: string) => void; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      <MascotTopLeft />
      
      <div className="flex items-center gap-4 max-w-[700px] w-full justify-center">
        <BackButton onClick={onBack} />
        <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-white text-center uppercase tracking-wide">
          What best describes where you're starting from?
        </h2>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <OptionCard text="I want to understand how trading works" onClick={() => onSelect('understand')} />
        <OptionCard text="I've watched/read about trading but never tried" onClick={() => onSelect('watched')} />
        <OptionCard text="I want guided, step-by-step learning" onClick={() => onSelect('guided')} />
      </div>
    </div>
  );
}

function PreferredMarketStep({ onSelect, onBack }: { onSelect: (answer: string) => void; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      <MascotTopLeft />
      
      <div className="flex items-center gap-4 max-w-[700px] w-full justify-center">
        <BackButton onClick={onBack} />
        <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-white text-center uppercase tracking-wide">
          What's your preferred market?
        </h2>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <OptionCard text="Stocks" onClick={() => onSelect('stocks')} />
        <OptionCard text="Forex" onClick={() => onSelect('forex')} />
        <OptionCard text="Crypto" onClick={() => onSelect('crypto')} />
        <OptionCard text="Synthetics" onClick={() => onSelect('synthetics')} />
      </div>
    </div>
  );
}

function LearningStyleStep({ onSelect, onBack }: { onSelect: (answer: string) => void; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      <MascotTopLeft />
      
      <div className="flex items-center gap-4 max-w-[700px] w-full justify-center">
        <BackButton onClick={onBack} />
        <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-white text-center uppercase tracking-wide">
          How do you understand things best?
        </h2>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <OptionCard text="Analogies and stories" onClick={() => onSelect('analogies')} />
        <OptionCard text="Numbers and logic" onClick={() => onSelect('numbers')} />
        <OptionCard text="Technical and structured" onClick={() => onSelect('technical')} />
        <OptionCard text="Mixed" onClick={() => onSelect('mixed')} />
      </div>
    </div>
  );
}

function RiskToleranceStep({ onSelect, onBack }: { onSelect: (answer: string) => void; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      <MascotTopLeft />
      
      <div className="flex items-center gap-4 max-w-[700px] w-full justify-center">
        <BackButton onClick={onBack} />
        <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-white text-center uppercase tracking-wide">
          What's your risk tolerance?
        </h2>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <OptionCard text="Conservative - Minimize losses" onClick={() => onSelect('conservative')} />
        <OptionCard text="Moderate - Balanced approach" onClick={() => onSelect('moderate')} />
        <OptionCard text="Aggressive - Maximum growth potential" onClick={() => onSelect('aggressive')} />
      </div>
    </div>
  );
}

function TradingFrequencyStep({ onSelect, onBack, isNewTrader }: { onSelect: (answer: string) => void; onBack: () => void; isNewTrader?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      <MascotTopLeft />
      
      <div className="flex items-center gap-4 max-w-[700px] w-full justify-center">
        <BackButton onClick={onBack} />
        <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-white text-center uppercase tracking-wide">
          {isNewTrader ? "How often do you plan to trade?" : "How often do you trade?"}
        </h2>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <OptionCard text="Daily" onClick={() => onSelect('daily')} />
        <OptionCard text="Weekly" onClick={() => onSelect('weekly')} />
        <OptionCard text="Monthly" onClick={() => onSelect('monthly')} />
        <OptionCard text="Occasionally" onClick={() => onSelect('occasionally')} />
      </div>
    </div>
  );
}

function DerivConnectionStep({ onConnect, onSkip, onBack }: { onConnect: () => void; onSkip: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      <MascotTopLeft />
      
      <div className="flex items-center gap-4 max-w-[700px] w-full justify-center">
        <BackButton onClick={onBack} />
        <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-white text-center uppercase tracking-wide">
          Connect your Deriv account
        </h2>
      </div>

      <div className="flex flex-col items-center gap-6 max-w-[500px]">
        {/* Deriv Logo */}
        <div className="w-[120px] h-[120px] bg-white rounded-[24px] border-[5px] border-black shadow-[8px_8px_0px_#000000] flex items-center justify-center p-4">
          <img 
            src={derivLogo} 
            alt="Deriv" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Description */}
        <div className="bg-white border-[4px] border-black rounded-[20px] px-6 py-5 shadow-[6px_6px_0px_#000000]">
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-black text-center leading-relaxed">
            Connect your Deriv account to access your complete trade history and get personalized insights from SuperBear!
          </p>
        </div>

        {/* Benefits */}
        <div className="w-full space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#f3ff00] border-[3px] border-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-black">✓</span>
            </div>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-white">
              Analyze your real trading patterns
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#f3ff00] border-[3px] border-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-black">✓</span>
            </div>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-white">
              Get personalized feedback and tips
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#f3ff00] border-[3px] border-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-black">✓</span>
            </div>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-white">
              Track progress with detailed analytics
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <Button 
          variant="offset" 
          className="h-[68px] rounded-[16px] w-[480px] max-w-[480px] font-['Arimo:Bold',sans-serif] text-[24px] tracking-wide uppercase"
          onClick={onConnect}
        >
          Connect to Deriv
        </Button>
        
        <button
          onClick={onSkip}
          className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-white uppercase tracking-wide hover:text-[#f3ff00] transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

function TraderTypeRevealStep({ onContinue, derivConnected }: { onContinue: () => void; derivConnected: boolean }) {
  const [animationStage, setAnimationStage] = useState<'loading' | 'scanning' | 'analyzing' | 'reveal'>('loading');
  const [scanText, setScanText] = useState('Found 127 trades...');
  const [tradesCount, setTradesCount] = useState(0);
  
  // TODO: Replace with backend API call to get trader type from Deriv analysis
  // For now, using placeholder data
  // Four trader types: Scalper, Day Trading, Swing Trading, Investment Trading
  const traderType = {
    id: 'swing-trading',
    name: 'Swing Trading',
    emoji: '📈',
    description: 'You hold trades for days to weeks, mixing technical analysis with some fundamentals. You focus on the bigger move and trend direction.',
    traits: ['Lower screen time', 'Selective entries', 'Discipline to hold']
  };

  // Animation progression - only runs if connected to Deriv
  useEffect(() => {
    if (!derivConnected) {
      // If not connected, skip animation and go straight to reveal
      setAnimationStage('reveal');
      return;
    }

    // Stage 1: Loading (1 second)
    const timer1 = setTimeout(() => {
      setAnimationStage('scanning');
    }, 1000);

    // Counting animation for trades
    const countInterval = setInterval(() => {
      setTradesCount(prev => {
        if (prev >= 127) {
          clearInterval(countInterval);
          return 127;
        }
        return prev + 7;
      });
    }, 50);

    // Stage 2: Scanning - cycling funny text (2.5 seconds)
    const timer2 = setTimeout(() => {
      setScanText('Oops, spotted some losses 👀');
    }, 2000);

    const timer3 = setTimeout(() => {
      setScanText('No judging... we promise 😅');
    }, 2800);

    // Stage 3: Analyzing (1 second)
    const timer4 = setTimeout(() => {
      setAnimationStage('analyzing');
      setScanText('Crunching the numbers...');
    }, 3500);

    // Stage 4: Reveal (0.5 seconds after analyzing)
    const timer5 = setTimeout(() => {
      setAnimationStage('reveal');
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearInterval(countInterval);
    };
  }, [derivConnected]);

  // Calculate progress segments (out of 4)
  const getProgressSegments = () => {
    if (animationStage === 'loading') return 0;
    if (animationStage === 'scanning') return 2;
    if (animationStage === 'analyzing') return 3;
    return 4;
  };

  // Show loading/scanning/analyzing animation if connected
  if (derivConnected && animationStage !== 'reveal') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-10 px-8 py-12 relative overflow-hidden">
        <div className="flex flex-col items-center gap-8 w-full max-w-[700px] z-10">
          {/* Stage 1: Loading - Deriv Logo */}
          {animationStage === 'loading' && (
            <div className="flex flex-col items-center gap-6 animate-fade-in">
              <div className="w-[140px] h-[140px] bg-white rounded-[28px] border-[5px] border-black shadow-[12px_12px_0px_#000000] flex items-center justify-center p-5">
                <img 
                  src={derivLogo} 
                  alt="Deriv" 
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-white text-center uppercase tracking-wide">
                Connecting to Deriv...
              </p>
            </div>
          )}

          {/* Stage 2 & 3: Scanning & Analyzing - Documents */}
          {(animationStage === 'scanning' || animationStage === 'analyzing') && (
            <>
              {/* Document stack shuffling */}
              <div className="relative w-[200px] h-[200px] flex items-center justify-center">
                {/* Document layers */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-[160px] h-[200px] bg-white border-[5px] border-black rounded-[12px] shadow-[6px_6px_0px_#000000]"
                    style={{
                      animation: `document-shuffle 1.5s ease-in-out infinite`,
                      animationDelay: `${i * 0.15}s`,
                      zIndex: 5 - i
                    }}
                  >
                    {/* Document lines */}
                    <div className="p-4 space-y-2">
                      <div className="h-2 bg-black rounded-full w-3/4" />
                      <div className="h-2 bg-black rounded-full w-full" />
                      <div className="h-2 bg-black rounded-full w-2/3" />
                      <div className="h-2 bg-black rounded-full w-5/6" />
                    </div>
                    {/* Trade count in center */}
                    {i === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-['Arimo:Bold',sans-serif] font-bold text-[48px] text-[#3bd6ff]">
                          {tradesCount}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bold Chunky Progress Bar */}
              <div className="w-full max-w-[500px]">
                <div className="flex gap-3 justify-center">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-4 border-[3px] border-black rounded-[8px] transition-all duration-300 ${
                        i < getProgressSegments() 
                          ? 'bg-[#f3ff00] shadow-[4px_4px_0px_#000000]' 
                          : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Funny scanning text */}
              <div className="bg-white/5 border-[3px] border-white/20 rounded-[20px] px-8 py-6 min-h-[90px] flex items-center justify-center">
                <p className="font-['Arimo:Bold',sans-serif] font-bold text-[24px] text-white text-center uppercase tracking-wide">
                  {scanText}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Stage 4: Reveal trader type
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8 py-12">
      {/* Title */}
      <div className="bg-transparent border-[4px] border-white rounded-[24px] px-12 py-4 animate-slide-down">
        <p className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-white text-center uppercase tracking-wide">
          {derivConnected ? 'Your Trading Style Detected!' : 'Your Trading Profile'}
        </p>
      </div>

      {/* Trader Type Reveal Card */}
      <div className="bg-white border-[5px] border-black rounded-[24px] p-10 shadow-[12px_12px_0px_#000000] max-w-[700px] w-full animate-slide-up-reveal">
        <div className="flex flex-col items-center gap-5">
          {/* Emoji Icon */}
          <div className="text-[80px] leading-none animate-pop-in">
            {traderType.emoji}
          </div>
          
          {/* Type Name */}
          <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[36px] text-black text-center uppercase tracking-wide leading-tight">
            {traderType.name}
          </h2>
          
          {/* Description */}
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-black text-center leading-relaxed max-w-[600px]">
            {traderType.description}
          </p>
          
          {/* Traits */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {traderType.traits.map((trait, index) => (
              <div 
                key={index}
                className="bg-[#f3ff00] border-[3px] border-black rounded-[16px] px-5 py-3 animate-pop-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="font-['Arimo:Bold',sans-serif] font-bold text-[15px] text-black uppercase tracking-wide">
                  {trait}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Info Text */}
      {derivConnected && (
        <p className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-[#f3ff00] text-center uppercase tracking-wide max-w-[600px] animate-fade-in-up">
          Based on your Deriv trading history
        </p>
      )}

      {/* Continue Button */}
      <button
        onClick={onContinue}
        className="bg-white border-[5px] border-black rounded-[24px] px-16 py-6 shadow-[8px_8px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] active:shadow-[1px_1px_0px_#000000] transition-all duration-150 max-w-[600px] w-full animate-slide-up-reveal"
        style={{ animationDelay: '0.3s' }}
      >
        <span className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-black uppercase tracking-wide">
          Continue
        </span>
      </button>
    </div>
  );
}

// Main Flow Component
export default function UserProfiling({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    traderLevel: null,
  });

  const getTotalSteps = () => {
    if (answers.traderLevel === 'new') return 9; // Welcome + Trader Level + Starting Point + Preferred Market + Learning Style + Risk Tolerance + Trading Frequency + Deriv Connection + Trader Type Reveal
    if (answers.traderLevel === 'occasional' || answers.traderLevel === 'experienced') return 8; // Welcome + Trader Level + Preferred Market + Learning Style + Risk Tolerance + Trading Frequency + Deriv Connection + Trader Type Reveal
    return 1; // Welcome only
  };

  const progress = (furthestStep / getTotalSteps()) * 100;

  const goToNextStep = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    if (nextStep > furthestStep) {
      setFurthestStep(nextStep);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTraderLevelSelect = (level: TraderLevel) => {
    setAnswers({ ...answers, traderLevel: level });
    goToNextStep();
  };

  const handleStartingPointSelect = (answer: string) => {
    setAnswers({ ...answers, startingPoint: answer });
    goToNextStep();
  };

  const handlePreferredMarketSelect = (answer: string) => {
    setAnswers({ ...answers, preferredMarket: answer });
    goToNextStep();
  };

  const handleLearningStyleSelect = (answer: string) => {
    setAnswers({ ...answers, learningStyle: answer });
    goToNextStep();
  };

  const handleRiskToleranceSelect = (answer: string) => {
    setAnswers({ ...answers, riskTolerance: answer });
    goToNextStep();
  };

  const handleTradingFrequencySelect = (answer: string) => {
    setAnswers({ ...answers, tradingFrequency: answer });
    goToNextStep();
  };

  const handleDerivConnect = () => {
    setAnswers({ ...answers, derivConnected: true });
    goToNextStep(); // Go to Trader Type Reveal instead of completing
  };

  const handleDerivSkip = () => {
    setAnswers({ ...answers, derivConnected: false });
    goToNextStep(); // Go to Trader Type Reveal instead of completing
  };

  const renderStep = () => {
    // Step 0: Welcome
    if (currentStep === 0) {
      return <WelcomeStep onContinue={goToNextStep} />;
    }

    // Step 1: Trader Level (was Step 2, now Step 1 - skip Name/Email since we have it from signup)
    if (currentStep === 1) {
      return <TraderLevelStep onSelect={handleTraderLevelSelect} onBack={goBack} />;
    }

    // Branch A: New Trader
    if (answers.traderLevel === 'new') {
      if (currentStep === 2) return <StartingPointStep onSelect={handleStartingPointSelect} onBack={goBack} />;
      if (currentStep === 3) return <PreferredMarketStep onSelect={handlePreferredMarketSelect} onBack={goBack} />;
      if (currentStep === 4) return <LearningStyleStep onSelect={handleLearningStyleSelect} onBack={goBack} />;
      if (currentStep === 5) return <RiskToleranceStep onSelect={handleRiskToleranceSelect} onBack={goBack} />;
      if (currentStep === 6) return <TradingFrequencyStep onSelect={handleTradingFrequencySelect} onBack={goBack} isNewTrader={true} />;
      if (currentStep === 7) return <DerivConnectionStep onConnect={handleDerivConnect} onSkip={handleDerivSkip} onBack={goBack} />;
      if (currentStep === 8) return <TraderTypeRevealStep onContinue={onComplete} derivConnected={answers.derivConnected || false} />;
    }

    // Branch B: Occasional/Experienced Trader
    if (answers.traderLevel === 'occasional' || answers.traderLevel === 'experienced') {
      if (currentStep === 2) return <PreferredMarketStep onSelect={handlePreferredMarketSelect} onBack={goBack} />;
      if (currentStep === 3) return <LearningStyleStep onSelect={handleLearningStyleSelect} onBack={goBack} />;
      if (currentStep === 4) return <RiskToleranceStep onSelect={handleRiskToleranceSelect} onBack={goBack} />;
      if (currentStep === 5) return <TradingFrequencyStep onSelect={handleTradingFrequencySelect} onBack={goBack} isNewTrader={false} />;
      if (currentStep === 6) return <DerivConnectionStep onConnect={handleDerivConnect} onSkip={handleDerivSkip} onBack={goBack} />;
      if (currentStep === 7) return <TraderTypeRevealStep onContinue={onComplete} derivConnected={answers.derivConnected || false} />;
    }

    return null;
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen w-full relative">
      {currentStep > 0 && <ProgressBar progress={progress} />}
      {renderStep()}
    </div>
  );
}