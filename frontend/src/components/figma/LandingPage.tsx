import { useState } from "react";
import { useNavigate } from "react-router-dom";
import imgChatGptImageFeb72026034014Pm1 from "@/assets/mascotbear.png";
import { Button } from "../ui/button";
import OnboardingFlow from "./OnboardingFlow";

function HeroTitle() {
  return (
    <h1 className="font-bold text-[62px] leading-[58px] text-center text-white tracking-[-1.3px] uppercase mb-2">
      tradelingo
    </h1>
  );
}

function HeroText() {
  return (
    <div className="font-bold text-[18px] leading-[24px] text-brand-yellow text-center tracking-[0.375px] uppercase">
      <p className="mb-0">Your trades are already teaching you.</p>
      <p>We just make it obvious.</p>
    </div>
  );
}

function MascotImage() {
  return (
    <div className="w-[380px] h-[570px] rounded-[190px] overflow-hidden">
      <img
        alt="TradeLingo mascot bear"
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
      className="h-[56px] rounded-[16px] w-[400px] max-w-[400px] text-[20px] tracking-wide uppercase font-black"
      onClick={onClick}
    >
      JOIN NOW
    </Button>
  );
}

function Landing({ onJoinClick }: { onJoinClick: () => void }) {
  return (
    <div className="bg-brand-red flex items-center justify-center min-h-screen w-full">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <HeroTitle />
          <HeroText />
        </div>

        <MascotImage />

        <div className="mt-8">
          <JoinButton onClick={onJoinClick} />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<"landing" | "onboarding">(
    "landing",
  );

  const handleComplete = () => {
    navigate("/dashboard/learn");
  };

  if (currentScreen === "onboarding") {
    return <OnboardingFlow onComplete={handleComplete} />;
  }

  return <Landing onJoinClick={() => setCurrentScreen("onboarding")} />;
}
