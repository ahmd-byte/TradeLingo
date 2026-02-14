import { useState, useEffect, useRef } from 'react';
import superBearImage from "@/assets/superbear.png";

// Initial greeting text
const greetingText = "SuperBear turns your trades into a private research.";

// Agent response type from backend
interface AgentResponse {
  observation: string;
  analysis: string;
  learning_concept: string;
  why_it_matters: string;
  teaching_explanation: string;
  teaching_example: string;
  actionable_takeaway: string;
  next_learning_suggestion: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  agentResponse?: AgentResponse;
}

interface SuperBearProps {
  onProcessingChange?: (isProcessing: boolean) => void;
  onAgentResponse?: (response: AgentResponse | null) => void;
}

export default function SuperBear({ onProcessingChange, onAgentResponse }: SuperBearProps = {}) {
  const [speechBubbleVisible, setSpeechBubbleVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [hasStartedSession, setHasStartedSession] = useState(false);
  const [remarkVisible, setRemarkVisible] = useState(false);
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

  // Show remark after bear
  useEffect(() => {
    if (!bearVisible) return;

    const remarkTimer = setTimeout(() => {
      setRemarkVisible(true);
    }, 400);
    
    return () => clearTimeout(remarkTimer);
  }, [bearVisible]);

  // Show speech bubble after remark, then start typewriter for greeting
  useEffect(() => {
    if (!remarkVisible) return;

    const cloudTimer = setTimeout(() => {
      setSpeechBubbleVisible(true);
    }, 600);
    
    return () => clearTimeout(cloudTimer);
  }, [remarkVisible]);

  // Typewriter effect for initial greeting
  useEffect(() => {
    if (!speechBubbleVisible) return;

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
  }, [speechBubbleVisible]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, displayedText]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    const message = userInput.trim();
    setUserInput('');
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    
    // Start loading/processing
    setIsLoading(true);
    setHasStartedSession(true);
    if (onProcessingChange) onProcessingChange(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          session_id: 'superbear-session',
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
      
      const agentResponse: AgentResponse = await res.json();
      
      // Build the display text from agent response
      const aiText = agentResponse.teaching_explanation || agentResponse.observation || 'I couldn\'t generate a response. Please try again.';
      
      // Add assistant message to chat
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: aiText,
        agentResponse,
      }]);
      
      // Send response to right panel
      if (onAgentResponse) onAgentResponse(agentResponse);
      
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = 'Sorry, I couldn\'t connect to the server. Make sure the backend is running.';
      setChatMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsLoading(false);
      if (onProcessingChange) onProcessingChange(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File uploaded:', file.name);
      // Handle file upload logic here
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
          SuperBear
        </h1>
      </div>

      {/* Bear Hero Section / Chat Area */}
      <div ref={chatContainerRef} className="pb-[220px] px-8 flex flex-col items-center gap-6">
        {/* Speech Bubble */}
        {speechBubbleVisible && (
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
        
        {/* SuperBear Image */}
        <div className={`relative flex flex-col items-center transition-opacity duration-500 ${bearVisible ? 'opacity-100' : 'opacity-0'}`}>
          <img 
            src={superBearImage} 
            alt="SuperBear with headset" 
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
                    ? 'bg-[#3b82f6] text-white' 
                    : 'bg-white text-black'
                }`}>
                  <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  {msg.agentResponse?.learning_concept && (
                    <div className="mt-2 pt-2 border-t-2 border-black/20">
                      <span className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-[#22c55e] uppercase">
                        📚 {msg.agentResponse.learning_concept}
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

      {/* Sticky Input - Always visible */}
      <div className="fixed bottom-0 left-[200px] right-[340px] bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a] to-transparent pt-8 pb-6 px-8 flex justify-center">
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
              // Auto-expand textarea
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 bg-white border-[5px] border-black rounded-[16px] px-6 py-4 shadow-[6px_6px_0px_#000000] font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-black placeholder:text-black/40 focus:outline-none focus:shadow-[4px_4px_0px_#000000] transition-shadow resize-none overflow-y-auto min-h-[56px]"
          />
          <button
            onClick={handleSendMessage}
            className="bg-white border-[5px] border-black rounded-[16px] px-6 shadow-[6px_6px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] active:shadow-[2px_2px_0px_#000000] transition-all hover:scale-105 active:scale-95 flex-shrink-0 h-[56px] flex items-center justify-center"
          >
            <span className="font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-black">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
