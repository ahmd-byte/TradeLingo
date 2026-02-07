import { useState, useEffect, useRef } from 'react';
import bearOnCouchImage from "@/assets/therapybear.png";

// Initial greeting text
const greetingText = "Let's talk about your recent trades.";

// AI Speech Text (appears after clicking button)
const aiSpeechText = "This loss came after two wins. Let's talk about emotional control.";

// Remark text
const remarkText = "You lost $120 today in the Volatility 100 trade";

export default function TradingTherapy() {
  const [speechBubbleVisible, setSpeechBubbleVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [hasStartedSession, setHasStartedSession] = useState(false);
  const [remarkVisible, setRemarkVisible] = useState(false);
  const [bearVisible, setBearVisible] = useState(false);
  const [userInput, setUserInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    }, 600); // Cloud appears after remark
    
    return () => clearTimeout(cloudTimer);
  }, [remarkVisible]);

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

  // Typewriter effect for AI response
  useEffect(() => {
    if (!hasStartedSession) return;

    setDisplayedText(''); // Clear the greeting
    setIsTypingComplete(false);
    
    let currentIndex = 0;
    const typingSpeed = 50; // milliseconds per character

    const typingInterval = setInterval(() => {
      if (currentIndex < aiSpeechText.length) {
        setDisplayedText(aiSpeechText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [hasStartedSession]);

  const handleStartSession = () => {
    setHasStartedSession(true);
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    // Handle sending the message here
    console.log('User message:', userInput);
    setUserInput('');
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
          Trading Therapy
        </h1>
      </div>

      {/* Bear Hero Section */}
      <div className="pb-[220px] px-8 flex flex-col items-center gap-6">
        {/* Context Card - Above Bear */}
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
        
        {/* Bear on Couch Image */}
        <div className={`relative flex flex-col items-center transition-opacity duration-500 ${bearVisible ? 'opacity-100' : 'opacity-0'}`}>
          <img 
            src={bearOnCouchImage} 
            alt="Bear on therapy couch" 
            className="w-[320px] h-auto object-contain"
          />
        </div>

        {/* Single Remark - Appears FIRST when page loads */}
        <div className={`max-w-[500px] w-full transition-opacity duration-600 ${remarkVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-white/5 border border-white/20 rounded-full px-6 py-3">
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white/70 text-center leading-relaxed">
              {remarkText}
            </p>
          </div>
        </div>
      </div>

      {/* Therapy Prompts Section - REMOVED */}

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
        )}
      </div>
    </div>
  );
}
