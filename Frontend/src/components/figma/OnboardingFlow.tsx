import { useState } from "react";
import UserProfiling from "./UserProfiling";
import QuizFlow from "./QuizFlow";
import apiClient from "../../api/client";
import { getUserData, saveUserData } from "../../api/client";

export default function OnboardingFlow({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [showQuiz, setShowQuiz] = useState(false);

  const handleProfilingComplete = async (profileData?: {
    traderLevel?: string;
    preferredMarket?: string;
    learningStyle?: string;
    riskTolerance?: string;
    tradingFrequency?: string;
  }) => {
    // Save profile preferences to backend user record
    if (profileData) {
      try {
        // Map frontend values to backend field names
        const updatePayload: Record<string, string> = {};
        if (profileData.traderLevel) {
          const levelMap: Record<string, string> = {
            new: "beginner",
            occasional: "intermediate",
            experienced: "advanced",
          };
          updatePayload.trading_level =
            levelMap[profileData.traderLevel] || profileData.traderLevel;
        }
        if (profileData.preferredMarket)
          updatePayload.preferred_market = profileData.preferredMarket;
        if (profileData.learningStyle) {
          const styleMap: Record<string, string> = {
            analogies: "visual",
            numbers: "logical",
            technical: "technical",
            mixed: "mixed",
          };
          updatePayload.learning_style =
            styleMap[profileData.learningStyle] || profileData.learningStyle;
        }
        if (profileData.riskTolerance) {
          const riskMap: Record<string, string> = {
            conservative: "low",
            moderate: "medium",
            aggressive: "high",
          };
          updatePayload.risk_tolerance =
            riskMap[profileData.riskTolerance] || profileData.riskTolerance;
        }
        if (profileData.tradingFrequency)
          updatePayload.trading_frequency = profileData.tradingFrequency;

        // Update user profile on the backend
        // The backend register endpoint already set initial values;
        // We patch the user record via the auth/me-like update
        // Since there's no PATCH endpoint, store locally for now and use in education API
        const existing = getUserData() || {};
        saveUserData({ ...existing, ...updatePayload });
      } catch (error) {
        console.error("Failed to save profile preferences:", error);
      }
    }
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
