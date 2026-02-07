import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import imgChatGptImageFeb72026034014Pm1 from "@/assets/mascotbear.png";
import { Button } from "../ui/button";
import OnboardingFlow from "./OnboardingFlow";

function HeroTitle() {
  return (
    <h1 className="font-['Arimo:Bold',sans-serif] font-bold text-[52px] leading-[46.8px] text-center text-white tracking-[-1.3px] uppercase">
      tradelingo
    </h1>
  );
}

function HeroText() {
  return (
    <div className="font-['Arimo:Bold',sans-serif] font-bold text-[15px] leading-[22.5px] text-[#f3ff00] text-center tracking-[0.375px] uppercase">
      <p className="mb-0">Your trades are already teaching you.</p>
      <p>We just make it obvious.</p>
    </div>
  );
}

function MascotImage() {
  return (
    <div className="w-[233px] h-[350px] rounded-[116.5px] overflow-hidden">
      <img 
        alt="Feed the Pig mascot" 
        className="w-full h-full object-cover" 
        src={imgChatGptImageFeb72026034014Pm1} 
      />
    </div>
  );
}

function JoinButton({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      variant="offset" 
      className="h-[68px] rounded-[16px] w-[480px] max-w-[480px] font-['Arimo:Bold',sans-serif] text-[24px] tracking-wide uppercase"
      onClick={onClick}
    >
      JOIN NOW
    </Button>
  );
}

function Landing({ onJoinClick }: { onJoinClick: () => void }) {
  return (
    <div className="bg-[#ff1814] flex items-center justify-center min-h-screen w-full">
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <HeroTitle />
          <HeroText />
        </div>
        
        <MascotImage />
        
        <JoinButton onClick={onJoinClick} />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'onboarding'>('landing');

  const handleComplete = () => {
    navigate('/dashboard/learn');
  };

  if (currentScreen === 'onboarding') {
    return <OnboardingFlow onComplete={handleComplete} />;
  }

  return <Landing onJoinClick={() => setCurrentScreen('onboarding')} />;
}
