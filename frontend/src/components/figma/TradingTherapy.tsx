import { useState, useEffect, useRef } from 'react';
import bearOnCouchImage from "@/assets/therapybear.png";

// Initial greeting text
const greetingText = "Let's talk about your recent trades. How are you feeling?";

// Agent response type from backend
interface TherapyResponse {
  acknowledgment: string;
  emotional_insight: string;
  therapeutic_question: string;
  coping_strategy: string;
  encouragement: string;
  emotional_pattern: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  therapyResponse?: TherapyResponse;
}

export default function TradingTherapy() {
  const [speechBubbleVisible, setSpeechBubbleVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [hasStartedSession, setHasStartedSession] = useState(false);
  const [bearVisible, setBearVisible] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Show bear first when component mounts
  useEffect(() => {
    const bearTimer = setTimeout(() => {
      setBearVisible(true);
    }, 100);
    return () => clearTimeout(bearTimer);
  }, []);

  // Show speech bubble after bear
  useEffect(() => {
    if (!bearVisible) return;
    const cloudTimer = setTimeout(() => {
      setSpeechBubbleVisible(true);
    }, 600);
    return () => clearTimeout(cloudTimer);
  }, [bearVisible]);

  // Typewriter effect for initial greeting
  useEffect(() => {
    if (!speechBubbleVisible || hasStartedSession) return;

    let currentIndex = 0;
    const typingSpeed = 50;

    const typingInterval = setInterval(() => {
      if (currentIndex < greetingText.length) {
        setDisplayedText(greetingText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [speechBubbleVisible, hasStartedSession]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isLoading]);

  const handleStartSession = () => {
    setHasStartedSession(true);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const message = userInput.trim();
    setUserInput('');

    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);

    // Start loading
    setIsLoading(true);
    setHasStartedSession(true);

    try {
      const res = await fetch('/api/therapy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          session_id: 'therapy-session',
          user_profile: {
            name: 'User',
            tradingLevel: 'beginner',
            learningStyle: 'visual',
            riskTolerance: 'medium',
            preferredMarkets: 'Stocks',
            tradingFrequency: 'weekly',
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const therapyResponse: TherapyResponse = await res.json();

      // Build display text from therapy response
      const parts: string[] = [];
      if (therapyResponse.acknowledgment) parts.push(therapyResponse.acknowledgment);
      if (therapyResponse.emotional_insight) parts.push(therapyResponse.emotional_insight);
      if (therapyResponse.therapeutic_question) parts.push(therapyResponse.therapeutic_question);
      if (therapyResponse.coping_strategy) parts.push(`💡 ${therapyResponse.coping_strategy}`);
      if (therapyResponse.encouragement) parts.push(therapyResponse.encouragement);

      const aiText = parts.join('\n\n') || "I'm here for you. Tell me more about how you're feeling.";

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: aiText,
        therapyResponse,
      }]);
    } catch (err) {
      console.error('Therapy chat error:', err);
      const errorMsg = "Sorry, I couldn't connect to the server. Make sure the backend is running.";
      setChatMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File uploaded:', file.name);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#1a1a1a]">
      {/* Header Section */}
      <div className="pt-12 pb-6 px-8 flex flex-col items-center gap-2">
        <h1 className="font-['Arimo:Bold',sans-serif] font-bold text-[32px] text-white uppercase tracking-wide">
          Trading Therapy
        </h1>
      </div>

      {/* Bear Hero Section / Chat Area */}
      <div ref={chatContainerRef} className="pb-[220px] px-8 flex flex-col items-center gap-6">
        {/* Speech Bubble - only show before session starts */}
        {speechBubbleVisible && !hasStartedSession && (
          <div className="relative animate-fade-in max-w-[500px] w-full">
            <div className="bg-white border-[4px] border-black rounded-[20px] px-6 py-4 shadow-[6px_6px_0px_#000000]">
              <p className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-black leading-relaxed">
                {displayedText}
              </p>
            </div>
            {/* Speech bubble tail pointing down */}
            <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-black" />
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-white absolute top-[-20px] left-[-12px]" />
            </div>
          </div>
        )}

        {/* Bear on Couch Image */}
        <div className={`relative flex flex-col items-center transition-opacity duration-500 ${bearVisible ? 'opacity-100' : 'opacity-0'}`}>
          <img
            src={bearOnCouchImage}
            alt="Bear on therapy couch"
            className="w-[320px] h-auto object-contain"
          />
        </div>

        {/* Chat Messages */}
        {chatMessages.length > 0 && (
          <div className="max-w-[600px] w-full space-y-4 mt-4">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-[16px] px-5 py-3 border-[3px] border-black shadow-[4px_4px_0px_#000000] ${
                  msg.role === 'user'
                    ? 'bg-[#8b5cf6] text-white'
                    : 'bg-white text-black'
                }`}>
                  <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  {msg.therapyResponse?.emotional_pattern && msg.therapyResponse.emotional_pattern !== 'exploring' && msg.therapyResponse.emotional_pattern !== 'healthy' && (
                    <div className="mt-2 pt-2 border-t-2 border-black/20">
                      <span className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-[#f59e0b] uppercase">
                        🧠 {msg.therapyResponse.emotional_pattern.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                  {msg.therapyResponse?.emotional_pattern === 'healthy' && (
                    <div className="mt-2 pt-2 border-t-2 border-black/20">
                      <span className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-[#22c55e] uppercase">
                        💚 Healthy mindset
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 border-[3px] border-white/20 rounded-[16px] px-5 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky CTA Button / Input */}
      <div className="fixed bottom-0 left-[200px] right-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a] to-transparent pt-8 pb-6 px-8 flex justify-center">
        {!hasStartedSession ? (
          <button
            onClick={handleStartSession}
            className="bg-white border-[5px] border-black rounded-[16px] px-8 py-6 shadow-[8px_8px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] active:shadow-[2px_2px_0px_#000000] transition-all hover:scale-105 active:scale-95 max-w-[700px] w-full"
          >
            <span className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-black uppercase tracking-wide">
              Talk with Bear
            </span>
          </button>
        ) : (
          <div className="max-w-[700px] w-full flex gap-3 items-end">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white border-[5px] border-black rounded-[16px] px-6 shadow-[6px_6px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] active:shadow-[2px_2px_0px_#000000] transition-all hover:scale-105 active:scale-95 flex-shrink-0 h-[56px] flex items-center justify-center"
            >
              <span className="font-['Arimo:Bold',sans-serif] font-bold text-[24px] text-black">
                +
              </span>
            </button>
            <textarea
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
              }}
              onKeyPress={handleKeyPress}
              placeholder="Tell me how you're feeling about your trades..."
              rows={1}
              className="flex-1 bg-white border-[5px] border-black rounded-[16px] px-6 py-4 shadow-[6px_6px_0px_#000000] font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-black placeholder:text-black/40 focus:outline-none focus:shadow-[4px_4px_0px_#000000] transition-shadow resize-none overflow-y-auto min-h-[56px]"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-white border-[5px] border-black rounded-[16px] px-6 shadow-[6px_6px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] active:shadow-[2px_2px_0px_#000000] transition-all hover:scale-105 active:scale-95 flex-shrink-0 h-[56px] flex items-center justify-center disabled:opacity-50"
            >
              <span className="font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-black">
                →
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
