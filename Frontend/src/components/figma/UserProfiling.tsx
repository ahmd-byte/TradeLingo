import { useState, useEffect } from "react";
import imgChatGptImageFeb72026034014Pm1 from "@/assets/mascotbear.png";
import bearWaveImage from "@/assets/bearwave.png";
import derivLogo from "@/assets/d70baeb329438db450b57deadd82b6c061377d05.png";
import { Button } from "../ui/button";

// Types
type TraderLevel = "new" | "occasional" | "experienced" | null;
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
        className="h-full bg-brand-yellow transition-all duration-300 ease-out"
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
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}

function MascotTopLeft() {
  return (
    <div className="absolute top-8 left-8 w-[120px] h-[180px] rounded-[60px] overflow-hidden">
      <img
        alt="LingoBear mascot"
        className="w-full h-full object-cover"
        src={imgChatGptImageFeb72026034014Pm1}
      />
    </div>
  );
}

function OptionCard({
  text,
  onClick,
  icon,
}: {
  text: string;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full max-w-[480px] bg-white border-[5px] border-black rounded-2xl px-8 py-6 font-bold text-xl text-black capitalize tracking-wide transition-all duration-150 hover:shadow-[4px_4px_0px_#000000] active:shadow-[1px_1px_0px_#000000] shadow-[8px_8px_0px_#000000] flex items-center gap-4"
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <span className="flex-1 text-left">{text}</span>
    </button>
  );
}

function TraderLevelIcon({
  level,
}: {
  level: "new" | "occasional" | "experienced";
}) {
  const bars = {
    new: [{ height: 12, color: "#60a5fa" }],
    occasional: [
      { height: 12, color: "#60a5fa" },
      { height: 20, color: "#60a5fa" },
    ],
    experienced: [
      { height: 12, color: "#60a5fa" },
      { height: 20, color: "#60a5fa" },
      { height: 28, color: "#60a5fa" },
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
function NameEmailStep({
  onContinue,
  onBack,
}: {
  onContinue: (name: string, email: string) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "" });

  const validateAndContinue = () => {
    const newErrors = { name: "", email: "" };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Please enter your name";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Please enter your email";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      onContinue(name, email);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      <MascotTopLeft />

      <div className="flex items-center gap-4 max-w-[700px] w-full justify-center">
        <BackButton onClick={onBack} />
        <h2 className="font-bold text-[28px] text-white text-center uppercase tracking-wide">
          Let's get started!
        </h2>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-[480px]">
        <div>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border-[5px] border-black rounded-2xl px-6 py-4 font-bold text-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-0 shadow-[8px_8px_0px_#000000]"
          />
          {errors.name && (
            <p className="mt-2 text-brand-yellow font-bold text-sm uppercase ml-2">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border-[5px] border-black rounded-2xl px-6 py-4 font-bold text-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-0 shadow-[8px_8px_0px_#000000]"
          />
          {errors.email && (
            <p className="mt-2 text-brand-yellow font-bold text-sm uppercase ml-2">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <Button
        variant="offset"
        className="h-[68px] rounded-2xl w-full max-w-[480px] text-2xl tracking-wide uppercase font-black"
        onClick={validateAndContinue}
      >
        CONTINUE
      </Button>
    </div>
  );
}

// COMMENTED OUT: WelcomeStep component - Animation not ready for production
// TODO: Re-enable when typewriter animation is finalized
// function WelcomeStep({ onContinue }: { onContinue: () => void }) {
//   const [displayedText, setDisplayedText] = useState("");
//   const welcomeText = "Hi there! I'm your LingoBear!";
//
//   // Typewriter effect
//   useEffect(() => {
//     let currentIndex = 0;
//     const typingSpeed = 60; // milliseconds per character
//
//     const typingInterval = setInterval(() => {
//       if (currentIndex < welcomeText.length) {
//         setDisplayedText(welcomeText.slice(0, currentIndex + 1));
//         currentIndex++;
//       } else {
//         clearInterval(typingInterval);
//       }
//     }, typingSpeed);
//
//     return () => clearInterval(typingInterval);
//   }, []);
//
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen gap-12">
//       <div className="relative max-w-[600px] w-full px-8">
//         <div className="bg-white border-[4px] border-black rounded-[20px] px-8 py-6 shadow-[6px_6px_0px_#000000]">
//           <div className="relative">
//             {/* Invisible placeholder to prevent layout shift */}
//             <p className="font-bold text-[28px] text-black text-left uppercase tracking-wide invisible" aria-hidden="true">
//               {welcomeText}
//             </p>
//             {/* Visible typing text */}
//             <p className="font-bold text-[28px] text-black text-left uppercase tracking-wide absolute inset-0">
//               {displayedText}
//               <span className="animate-pulse">|</span>
//             </p>
//           </div>
//         </div>
//         {/* Speech bubble tail pointing down */}
//         <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2">
//           <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-black" />
//           <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-white absolute top-[-20px] left-[-12px]" />
//         </div>
//       </div>
//
//       <div className="w-[233px] h-[350px] rounded-[116.5px] overflow-hidden">
//         <img
//           alt="LingoBear mascot"
//           className="w-full h-full object-cover"
//           src={bearWaveImage}
//         />
//       </div>
//
//       <Button
//         variant="offset"
//         className="h-[68px] rounded-2xl w-full max-w-[480px] text-2xl tracking-wide uppercase font-black"
//         onClick={onContinue}
//       >
//         CONTINUE
//       </Button>
//     </div>
//   );
// }

function TraderLevelStep({
  onSelect,
  onBack,
}: {
  onSelect: (level: TraderLevel) => void;
  onBack?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      <MascotTopLeft />

      <div className="flex items-center gap-4 max-w-[700px] w-full justify-center">
        {onBack && <BackButton onClick={onBack} />}
        <h2 className="font-bold text-[28px] text-white text-center uppercase tracking-wide">
          How would you describe yourself as a trader?
        </h2>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <OptionCard
          text="New trader (never traded before)"
          onClick={() => onSelect("new")}
          icon={<TraderLevelIcon level="new" />}
        />
        <OptionCard
          text="Occasional trader"
          onClick={() => onSelect("occasional")}
          icon={<TraderLevelIcon level="occasional" />}
        />
        <OptionCard
          text="Experienced trader"
          onClick={() => onSelect("experienced")}
          icon={<TraderLevelIcon level="experienced" />}
        />
      </div>
    </div>
  );
}

function StartingPointStep({
  onSelect,
  onBack,
}: {
  onSelect: (answer: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      <MascotTopLeft />

      <div className="flex items-center gap-4 max-w-[700px] w-full justify-center">
        <BackButton onClick={onBack} />
        <h2 className="font-bold text-[28px] text-white text-center uppercase tracking-wide">
          What best describes where you're starting from?
        </h2>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <OptionCard
          text="I want to understand how trading works"
          onClick={() => onSelect("understand")}
        />
        <OptionCard
          text="I've watched/read about trading but never tried"
          onClick={() => onSelect("watched")}
        />
        <OptionCard
          text="I want guided, step-by-step learning"
          onClick={() => onSelect("guided")}
        />
      </div>
    </div>
  );
}

function PreferredMarketStep({
  onSelect,
  onBack,
}: {
  onSelect: (answer: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      <MascotTopLeft />

      <div className="flex items-center gap-4 max-w-[700px] w-full justify-center">
        <BackButton onClick={onBack} />
        <h2 className="font-bold text-[28px] text-white text-center uppercase tracking-wide">
          What's your preferred market?
        </h2>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <OptionCard text="Stocks" onClick={() => onSelect("stocks")} />
        <OptionCard text="Forex" onClick={() => onSelect("forex")} />
        <OptionCard text="Crypto" onClick={() => onSelect("crypto")} />
        <OptionCard text="Synthetics" onClick={() => onSelect("synthetics")} />
      </div>
    </div>
  );
}

function LearningStyleStep({
  onSelect,
  onBack,
}: {
  onSelect: (answer: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      <MascotTopLeft />

      <div className="flex items-center gap-4 max-w-[700px] w-full justify-center">
        <BackButton onClick={onBack} />
        <h2 className="font-bold text-[28px] text-white text-center uppercase tracking-wide">
          How do you understand things best?
        </h2>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <OptionCard
          text="Analogies and stories"
          onClick={() => onSelect("analogies")}
        />
        <OptionCard
          text="Numbers and logic"
          onClick={() => onSelect("numbers")}
        />
        <OptionCard
          text="Technical and structured"
          onClick={() => onSelect("technical")}
        />
        <OptionCard text="Mixed" onClick={() => onSelect("mixed")} />
      </div>
    </div>
  );
}

function RiskToleranceStep({
  onSelect,
  onBack,
}: {
  onSelect: (answer: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      <MascotTopLeft />

      <div className="flex items-center gap-4 max-w-[700px] w-full justify-center">
        <BackButton onClick={onBack} />
        <h2 className="font-bold text-[28px] text-white text-center uppercase tracking-wide">
          What's your risk tolerance?
        </h2>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <OptionCard
          text="Conservative - Minimize losses"
          onClick={() => onSelect("conservative")}
        />
        <OptionCard
          text="Moderate - Balanced approach"
          onClick={() => onSelect("moderate")}
        />
        <OptionCard
          text="Aggressive - Maximum growth potential"
          onClick={() => onSelect("aggressive")}
        />
      </div>
    </div>
  );
}

function TradingFrequencyStep({
  onSelect,
  onBack,
  isNewTrader,
}: {
  onSelect: (answer: string) => void;
  onBack: () => void;
  isNewTrader?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      <MascotTopLeft />

      <div className="flex items-center gap-4 max-w-[700px] w-full justify-center">
        <BackButton onClick={onBack} />
        <h2 className="font-bold text-[28px] text-white text-center uppercase tracking-wide">
          {isNewTrader
            ? "How often do you plan to trade?"
            : "How often do you trade?"}
        </h2>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <OptionCard text="Daily" onClick={() => onSelect("daily")} />
        <OptionCard text="Weekly" onClick={() => onSelect("weekly")} />
        <OptionCard text="Monthly" onClick={() => onSelect("monthly")} />
        <OptionCard
          text="Occasionally"
          onClick={() => onSelect("occasionally")}
        />
      </div>
    </div>
  );
}

function DerivConnectionStep({
  onConnect,
  onSkip,
  onBack,
}: {
  onConnect: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      <MascotTopLeft />

      <div className="flex items-center gap-4 max-w-[700px] w-full justify-center">
        <BackButton onClick={onBack} />
        <h2 className="font-bold text-[28px] text-white text-center uppercase tracking-wide">
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
          <p className="font-bold text-base text-black text-center leading-relaxed">
            Connect your Deriv account to access your complete trade history and
            get personalized insights from SuperBear!
          </p>
        </div>

        {/* Benefits */}
        <div className="w-full space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-brand-yellow border-[3px] border-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="font-bold text-base text-black">✓</span>
            </div>
            <p className="font-bold text-base text-white">
              Analyze your real trading patterns
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-brand-yellow border-[3px] border-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="font-bold text-base text-black">✓</span>
            </div>
            <p className="font-bold text-base text-white">
              Get personalized feedback and tips
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-brand-yellow border-[3px] border-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="font-bold text-base text-black">✓</span>
            </div>
            <p className="font-bold text-base text-white">
              Track progress with detailed analytics
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <Button
          variant="offset"
          className="h-[68px] rounded-2xl w-full max-w-[480px] text-2xl tracking-wide uppercase font-black"
          onClick={onConnect}
        >
          Connect to Deriv
        </Button>

        <button
          onClick={onSkip}
          className="font-bold text-lg text-white uppercase tracking-wide hover:text-brand-yellow transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// Main Flow Component
export default function UserProfiling({
  onComplete,
}: {
  onComplete: () => void;
}) {
  // Start at step 1 (Name/Email) - Welcome screen temporarily disabled
  const [currentStep, setCurrentStep] = useState(1);
  const [furthestStep, setFurthestStep] = useState(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    traderLevel: null,
  });

  const getTotalSteps = () => {
    // Note: Welcome screen temporarily disabled, so counts are reduced by 1
    if (answers.traderLevel === "new") return 8; // Name/Email + Trader Level + Starting Point + Preferred Market + Learning Style + Risk Tolerance + Trading Frequency + Deriv Connection
    if (
      answers.traderLevel === "occasional" ||
      answers.traderLevel === "experienced"
    )
      return 7; // Name/Email + Trader Level + Preferred Market + Learning Style + Risk Tolerance + Trading Frequency + Deriv Connection
    return 1; // Name/Email only
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

  const handleNameEmailSubmit = (name: string, email: string) => {
    setAnswers({ ...answers, name, email });
    goToNextStep();
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
    onComplete();
  };

  const handleDerivSkip = () => {
    setAnswers({ ...answers, derivConnected: false });
    onComplete();
  };

  const renderStep = () => {
    // COMMENTED OUT: Step 0 (Welcome) - Animation not ready
    /*
    if (currentStep === 0) {
      return <WelcomeStep onContinue={goToNextStep} />;
    }
    */

    // Step 1: Name & Email
    if (currentStep === 1) {
      return (
        <NameEmailStep onContinue={handleNameEmailSubmit} onBack={goBack} />
      );
    }

    // Step 2: Trader Level
    if (currentStep === 2) {
      return (
        <TraderLevelStep onSelect={handleTraderLevelSelect} onBack={goBack} />
      );
    }

    // Branch A: New Trader
    if (answers.traderLevel === "new") {
      if (currentStep === 3)
        return (
          <StartingPointStep
            onSelect={handleStartingPointSelect}
            onBack={goBack}
          />
        );
      if (currentStep === 4)
        return (
          <PreferredMarketStep
            onSelect={handlePreferredMarketSelect}
            onBack={goBack}
          />
        );
      if (currentStep === 5)
        return (
          <LearningStyleStep
            onSelect={handleLearningStyleSelect}
            onBack={goBack}
          />
        );
      if (currentStep === 6)
        return (
          <RiskToleranceStep
            onSelect={handleRiskToleranceSelect}
            onBack={goBack}
          />
        );
      if (currentStep === 7)
        return (
          <TradingFrequencyStep
            onSelect={handleTradingFrequencySelect}
            onBack={goBack}
            isNewTrader={true}
          />
        );
      if (currentStep === 8)
        return (
          <DerivConnectionStep
            onConnect={handleDerivConnect}
            onSkip={handleDerivSkip}
            onBack={goBack}
          />
        );
    }

    // Branch B: Occasional/Experienced Trader
    if (
      answers.traderLevel === "occasional" ||
      answers.traderLevel === "experienced"
    ) {
      if (currentStep === 3)
        return (
          <PreferredMarketStep
            onSelect={handlePreferredMarketSelect}
            onBack={goBack}
          />
        );
      if (currentStep === 4)
        return (
          <LearningStyleStep
            onSelect={handleLearningStyleSelect}
            onBack={goBack}
          />
        );
      if (currentStep === 5)
        return (
          <RiskToleranceStep
            onSelect={handleRiskToleranceSelect}
            onBack={goBack}
          />
        );
      if (currentStep === 6)
        return (
          <TradingFrequencyStep
            onSelect={handleTradingFrequencySelect}
            onBack={goBack}
            isNewTrader={false}
          />
        );
      if (currentStep === 7)
        return (
          <DerivConnectionStep
            onConnect={handleDerivConnect}
            onSkip={handleDerivSkip}
            onBack={goBack}
          />
        );
    }

    return null;
  };

  return (
    <div className="bg-[#ff1814] min-h-screen w-full relative">
      {currentStep > 0 && <ProgressBar progress={progress} />}
      {renderStep()}
    </div>
  );
}
