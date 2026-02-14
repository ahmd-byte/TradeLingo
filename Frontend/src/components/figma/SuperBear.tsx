import { useState, useEffect, useRef } from 'react';
import superBearImage from "figma:asset/789c2c0c2a8de258540ceea8886d63826611f10a.png";

// Initial greeting text
const greetingText = "SuperBear turns your trades into a private research.";

// AI Response (mock - will come from backend later)
const mockAiResponse = "I analyzed your EUR/USD trade from yesterday. You entered at a strong resistance level without waiting for confirmation. Your stop loss was too tight at 15 pips, but your risk management was solid. The real issue? Momentum bias - you were chasing the win after two successful trades. Let's break down what happened and how to avoid this pattern.";

interface Message {
  id: number;
  type: 'user' | 'ai';
  text: string;
  quickReplies?: { label: string; action: string }[];
}

interface SuperBearProps {
  onProcessingChange?: (isProcessing: boolean) => void;
}

export default function SuperBear({ onProcessingChange }: SuperBearProps = {}) {
  const [speechBubbleVisible, setSpeechBubbleVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [bearVisible, setBearVisible] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [bearShrunken, setBearShrunken] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false); // Track if AI is responding
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(0); // Unique ID counter

  // Show bear first when component mounts
  useEffect(() => {
    const bearTimer = setTimeout(() => {
      setBearVisible(true);
    }, 100);
    
    return () => clearTimeout(bearTimer);
  }, []);

  // Show speech bubble after bear, then start typewriter for greeting
  useEffect(() => {
    if (!bearVisible) return;

    const cloudTimer = setTimeout(() => {
      setSpeechBubbleVisible(true);
    }, 400); // Cloud appears after bear
    
    return () => clearTimeout(cloudTimer);
  }, [bearVisible]);

  // Typewriter effect for initial greeting
  useEffect(() => {
    if (!speechBubbleVisible || messages.length > 0) return;

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
  }, [speechBubbleVisible, messages]);

  const handleSendMessage = () => {
    if (!userInput.trim() || isAiResponding) return; // Block if AI is responding
    
    const userMessageText = userInput; // Capture before clearing
    
    // ============================================
    // 1. SHOW USER MESSAGE IMMEDIATELY (no delay!)
    // ============================================
    const newUserMessage: Message = { 
      id: messageIdCounter.current++, 
      type: 'user', 
      text: userMessageText
    };
    setMessages(prev => [...prev, newUserMessage]);
    
    // 2. Clear input field immediately
    setUserInput('');
    
    // ============================================
    // 3. DISABLE INPUT - AI IS NOW RESPONDING
    // ============================================
    setIsAiResponding(true);
    
    // 4. Start Intelligence processing animation
    if (onProcessingChange) {
      onProcessingChange(true);
    }
    
    // ============================================
    // 5. BACKEND INTEGRATION (TODO)
    // ============================================
    // Replace this setTimeout with actual backend API call:
    // const response = await fetch('/api/superbear', {
    //   method: 'POST',
    //   body: JSON.stringify({ message: userMessageText })
    // });
    // const aiResponse = await response.json();
    
    // ============================================
    // 6. AI RESPONSE AFTER PROCESSING COMPLETES
    // ============================================
    const PROCESSING_DURATION = 6000; // 6 seconds - matches Intelligence animation
    
    setTimeout(() => {
      // Add AI response to chat AFTER intelligence finishes
      const aiMessage: Message = {
        id: messageIdCounter.current++,
        type: 'ai',
        text: mockAiResponse,
        quickReplies: [
          { label: 'Create a branch about this', action: 'create-branch' },
          { label: 'I\'m feeling frustrated', action: 'emotional-support' }
        ]
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Stop Intelligence processing (steps freeze in completed state)
      if (onProcessingChange) {
        onProcessingChange(false);
      }
      
      // RE-ENABLE INPUT - User can send new message now
      setIsAiResponding(false);
      setIsProcessingComplete(true);
    }, PROCESSING_DURATION);
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

  const handleQuickReply = (action: string) => {
    console.log('Quick reply action:', action);
    // Handle different quick reply actions here
    // This will later integrate with backend AI agent
  };

  return (
    <div className="flex-1 flex overflow-y-auto bg-[var(--bg-primary)]">
      {/* Main Chat Area - Scrollable */}
      <div className="flex-1 min-w-0">
        {/* Header Section - Scrolls with content */}
        <div className="pt-8 pb-3 px-8 flex items-center justify-center gap-3">
          <h1 className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-white uppercase tracking-wide">
            SuperBear
          </h1>
          {/* Tiny Bear - appears after first message */}
          {messages.length > 0 && (
            <img 
              src={superBearImage} 
              alt="SuperBear" 
              className="w-[40px] h-auto object-contain animate-in fade-in zoom-in duration-300"
            />
          )}
        </div>

        {/* Initial Bear Hero Section - Only show when no messages */}
        {messages.length === 0 && (
          <div className="pb-[180px] px-8 flex flex-col items-center gap-4">
            {/* Context Card - Above Bear */}
            {speechBubbleVisible && (
              <div className="relative animate-fade-in max-w-[500px] w-full">
                <div className="bg-white border-[4px] border-black rounded-[20px] px-5 py-3 shadow-[6px_6px_0px_#000000]">
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
                className="w-[260px] h-auto object-contain"
              />
            </div>
          </div>
        )}

        {/* Chat Messages - Show when conversation started */}
        {messages.length > 0 && (
          <div className="px-8 pb-[180px] pt-4">
            <div className="max-w-[700px] mx-auto space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* User Message */}
                  {message.type === 'user' && (
                    <div className="flex justify-end">
                      <div className="bg-white border-[3px] border-black rounded-[16px] px-4 py-3 shadow-[3px_3px_0px_#000000] max-w-[80%]">
                        <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI Message */}
                  {message.type === 'ai' && (
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-start">
                        <div className="bg-[#5eb3ff] border-[3px] border-black rounded-[16px] px-4 py-3 shadow-[3px_3px_0px_#000000] max-w-[85%]">
                          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black leading-relaxed">
                            {message.text}
                          </p>
                        </div>
                      </div>

                      {/* Quick Reply Buttons */}
                      {message.quickReplies && message.quickReplies.length > 0 && (
                        <div className="flex gap-2 justify-start ml-2">
                          {message.quickReplies.map((reply, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickReply(reply.action)}
                              className="bg-white border-[2px] border-black rounded-[10px] px-3 py-1.5 shadow-[2px_2px_0px_#000000] hover:shadow-[1px_1px_0px_#000000] active:shadow-[0px_0px_0px_#000000] transition-all"
                            >
                              <span className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] text-black">
                                {reply.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sticky Input - Fixed at bottom */}
        <div className="fixed bottom-0 left-[200px] right-[340px] bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent pt-8 pb-6 px-8 flex justify-center z-10">
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
              disabled={isAiResponding}
              className={`bg-white border-[5px] border-black rounded-[16px] px-6 shadow-[6px_6px_0px_#000000] flex-shrink-0 h-[56px] flex items-center justify-center transition-all ${
                isAiResponding 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:shadow-[4px_4px_0px_#000000] active:shadow-[2px_2px_0px_#000000] hover:scale-105 active:scale-95'
              }`}
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
              placeholder={isAiResponding ? "SuperBear is thinking..." : "Type your message..."}
              rows={1}
              disabled={isAiResponding}
              className={`flex-1 bg-white border-[5px] border-black rounded-[16px] px-6 py-4 shadow-[6px_6px_0px_#000000] font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-black placeholder:text-black/40 resize-none overflow-y-auto min-h-[56px] transition-all ${
                isAiResponding 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'focus:outline-none focus:shadow-[4px_4px_0px_#000000]'
              }`}
            />
            <button
              onClick={handleSendMessage}
              disabled={isAiResponding || !userInput.trim()}
              className={`bg-white border-[5px] border-black rounded-[16px] px-6 shadow-[6px_6px_0px_#000000] flex-shrink-0 h-[56px] flex items-center justify-center transition-all ${
                isAiResponding || !userInput.trim()
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:shadow-[4px_4px_0px_#000000] active:shadow-[2px_2px_0px_#000000] hover:scale-105 active:scale-95'
              }`}
            >
              <span className="font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-black">
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}