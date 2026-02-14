import { Flame, Star, X, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type ProcessStep = {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'completed';
};

type Chat = {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  time: string;
  statusDot?: string; // Color of status dot
  messages: Array<{
    type: 'user' | 'ai';
    text: string;
  }>;
};

interface SuperBearRightPanelProps {
  isProcessing?: boolean;
  onChatSelect?: (chatId: string) => void;
}

// ============================================rec
// MATRIX EFFECT SPEED CONTROL
// ============================================
// Adjust this value to change how fast labels change and scramble
// 
// Presets:
// 0.5  = x0.5 speed (VERY SLOW - 2400ms per label change)
// 0.75 = x0.75 speed (SLOW - 1600ms per label change)
// 1.0  = x1 speed (NORMAL - 1200ms per label change)
// 1.5  = x1.5 speed (MEDIUM - 800ms per label change)
// 2.0  = x2 speed (FAST - 600ms per label change) ← CURRENT
// 3.0  = x3 speed (VERY FAST - 400ms per label change)
// 4.0  = x4 speed (ULTRA FAST - 300ms per label change)
//
const MATRIX_SPEED = 2.0; // ← CHANGE THIS VALUE TO ADJUST SPEED
// ============================================

// Step label variations for matrix effect
const stepVariations = {
  1: [
    'Gathering trade data',
    'Collecting order flow',
    'Analyzing volume data',
    'Extracting price action',
    'Reading market depth'
  ],
  2: [
    'Searching related market conditions',
    'Searching Twitter for social sentiments',
    'Scanning news feeds',
    'Analyzing market sentiment',
    'Checking correlation data',
    'Monitoring whale activity'
  ],
  3: [
    'Pattern matching',
    'Detecting chart patterns',
    'Identifying key levels',
    'Cross-referencing setups',
    'Analyzing historical data',
    'Finding similar trades'
  ],
  4: [
    'Synthesizing explanation',
    'Generating insights',
    'Building narrative',
    'Creating summary',
    'Compiling analysis',
    'Formulating conclusion'
  ]
};

// Matrix scramble effect - replaces characters with random chars then reveals target
const scrambleText = (current: string, target: string, progress: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const revealLength = Math.floor(target.length * progress);
  
  let result = '';
  for (let i = 0; i < target.length; i++) {
    if (i < revealLength) {
      result += target[i];
    } else if (target[i] === ' ') {
      result += ' ';
    } else {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return result;
};

export default function SuperBearRightPanel({ isProcessing = false, onChatSelect }: SuperBearRightPanelProps) {
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<ProcessStep[]>([
    { id: 1, label: 'Gathering trade data', status: 'pending' },
    { id: 2, label: 'Searching related market conditions', status: 'pending' },
    { id: 3, label: 'Pattern matching', status: 'pending' },
    { id: 4, label: 'Synthesizing explanation', status: 'pending' },
  ]);

  // Matrix effect state
  const [displayLabels, setDisplayLabels] = useState<string[]>(steps.map(s => s.label));
  const [targetLabels, setTargetLabels] = useState<string[]>(steps.map(s => s.label));
  const [scrambleProgress, setScrambleProgress] = useState<number[]>([1, 1, 1, 1]);
  
  // Track if we've ever processed (don't show idle state after first processing)
  const [hasProcessed, setHasProcessed] = useState(false);

  // ============================================
  // CHAT DRAWER STATE
  // ============================================
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  // ============================================
  // RESEARCH DRAWER STATE
  // ============================================
  const [isResearchDrawerOpen, setIsResearchDrawerOpen] = useState(false);
  const [activeResearchId, setActiveResearchId] = useState<string | null>(null);
  const [researchSearchQuery, setResearchSearchQuery] = useState('');
  const [hoveredResearchId, setHoveredResearchId] = useState<string | null>(null);

  // Mock chat data
  const [chats] = useState<Chat[]>([
    {
      id: 'chat-1',
      title: 'Why did I enter at resistance without confirmation?',
      tag: 'Momentum Bias',
      tagColor: '#22c55e',
      time: '2h ago',
      statusDot: '#22c55e',
      messages: [
        { type: 'user', text: 'Can you analyze my EUR/USD trade from yesterday?' },
        { type: 'ai', text: 'I analyzed your EUR/USD trade. You entered at a strong resistance level without waiting for confirmation. Your stop loss was too tight at 15 pips.' }
      ]
    },
    {
      id: 'chat-2',
      title: 'How to improve my risk management strategy?',
      tag: 'Risk Management',
      tagColor: '#f59e0b',
      time: 'Yesterday',
      statusDot: '#f59e0b',
      messages: [
        { type: 'user', text: 'How can I improve my risk management?' },
        { type: 'ai', text: 'Let\'s analyze your recent trades and identify patterns in your risk management approach.' }
      ]
    },
    {
      id: 'chat-3',
      title: 'Understanding volatility 100 patterns',
      tag: 'Pattern Recognition',
      tagColor: '#3b82f6',
      time: '2 days ago',
      statusDot: '#3b82f6',
      messages: [
        { type: 'user', text: 'What patterns should I look for in Volatility 100?' },
        { type: 'ai', text: 'Volatility 100 has unique characteristics. Let me break down the key patterns you should watch.' }
      ]
    },
    {
      id: 'chat-4',
      title: 'Emotional trading after losses',
      tag: 'Trading Psychology',
      tagColor: '#8b5cf6',
      time: '3 days ago',
      statusDot: '#8b5cf6',
      messages: [
        { type: 'user', text: 'I keep revenge trading after losses' },
        { type: 'ai', text: 'Revenge trading is a common challenge. Let\'s work on strategies to break this pattern.' }
      ]
    },
    {
      id: 'chat-5',
      title: 'Best timeframes for swing trading',
      tag: 'Strategy Development',
      tagColor: '#ec4899',
      time: '1 week ago',
      statusDot: '#ec4899',
      messages: [
        { type: 'user', text: 'What timeframes work best for swing trading?' },
        { type: 'ai', text: 'For swing trading, the 4H and daily charts are typically most effective. Let me explain why.' }
      ]
    }
  ]);

  // Filtered chats based on search
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock research data
  const [research] = useState<Chat[]>([ // Reusing Chat type for simplicity
    {
      id: 'research-1',
      title: 'Entered Volatility 100 at major resistance without confirmation',
      tag: 'Momentum Bias',
      tagColor: '#22c55e',
      time: '2 hours ago',
      statusDot: '#22c55e',
      messages: []
    },
    {
      id: 'research-2',
      title: 'EUR/USD stop loss too tight at 15 pips given ATR of 42',
      tag: 'Risk Management',
      tagColor: '#f59e0b',
      time: 'Yesterday',
      statusDot: '#f59e0b',
      messages: []
    },
    {
      id: 'research-3',
      title: 'Gold breakout trade missed volume confirmation',
      tag: 'Pattern Recognition',
      tagColor: '#3b82f6',
      time: '2 days ago',
      statusDot: '#3b82f6',
      messages: []
    },
    {
      id: 'research-4',
      title: 'Revenge traded after 3 consecutive losses on GBP/USD',
      tag: 'Trading Psychology',
      tagColor: '#8b5cf6',
      time: '3 days ago',
      statusDot: '#8b5cf6',
      messages: []
    },
    {
      id: 'research-5',
      title: 'Bitcoin swing trade entered too early on 4H timeframe',
      tag: 'Timing Analysis',
      tagColor: '#ec4899',
      time: '4 days ago',
      statusDot: '#ec4899',
      messages: []
    },
    {
      id: 'research-6',
      title: 'NASDAQ correlation breakdown missed during NFP news',
      tag: 'Market Context',
      tagColor: '#06b6d4',
      time: '5 days ago',
      statusDot: '#06b6d4',
      messages: []
    },
    {
      id: 'research-7',
      title: 'Overtraded during Asian session with poor win rate',
      tag: 'Session Analysis',
      tagColor: '#f97316',
      time: '1 week ago',
      statusDot: '#f97316',
      messages: []
    }
  ]);

  // Filtered research based on search
  const filteredResearch = research.filter(item =>
    item.title.toLowerCase().includes(researchSearchQuery.toLowerCase()) ||
    item.tag.toLowerCase().includes(researchSearchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isProcessing) {
      // Don't reset if we've already processed - keep showing completed steps
      if (hasProcessed) return;
      return;
    }

    // Mark that we're processing
    setHasProcessed(true);

    // Reset to initial state when new processing starts
    setProgress(0);
    const initialSteps = [
      { id: 1, label: 'Gathering trade data', status: 'pending' as const },
      { id: 2, label: 'Searching related market conditions', status: 'pending' as const },
      { id: 3, label: 'Pattern matching', status: 'pending' as const },
      { id: 4, label: 'Synthesizing explanation', status: 'pending' as const },
    ];
    setSteps(initialSteps);
    setDisplayLabels(initialSteps.map(s => s.label));
    setTargetLabels(initialSteps.map(s => s.label));
    setScrambleProgress([1, 1, 1, 1]);

    // Immediately activate first step
    setSteps(prev => prev.map((step, idx) => 
      idx === 0 ? { ...step, status: 'active' } : step
    ));

    // Start processing animation
    let currentProgress = 0;
    let currentStep = 0;
    const totalDuration = 6000; // 6 seconds total (slowed down)
    const frameRate = 30; // 30 fps
    const progressIncrement = 100 / (totalDuration / (1000 / frameRate));

    const interval = setInterval(() => {
      currentProgress += progressIncrement;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        // Mark all steps as completed
        setSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));
        clearInterval(interval);
      } else {
        setProgress(currentProgress);
        
        // Update step status based on progress
        // Each step gets 25% of time, but next step only activates AFTER previous completes
        // Step 1: 0-25%   (active at 0%, completes at 25%)
        // Step 2: 25-50%  (active at 25%, completes at 50%)
        // Step 3: 50-75%  (active at 50%, completes at 75%)
        // Step 4: 75-100% (active at 75%, completes at 100%)
        
        let newStepIndex = -1;
        if (currentProgress >= 75) newStepIndex = 3;
        else if (currentProgress >= 50) newStepIndex = 2;
        else if (currentProgress >= 25) newStepIndex = 1;
        else newStepIndex = 0;
        
        if (newStepIndex !== currentStep) {
          currentStep = newStepIndex;
          setSteps(prev => prev.map((step, idx) => {
            if (idx < newStepIndex) return { ...step, status: 'completed' };
            if (idx === newStepIndex) return { ...step, status: 'active' };
            return { ...step, status: 'pending' };
          }));
        }
      }
    }, 1000 / frameRate);

    return () => clearInterval(interval);
  }, [isProcessing]);

  // Matrix effect - change labels when active
  useEffect(() => {
    if (!isProcessing) return;

    const labelChangeInterval = setInterval(() => {
      steps.forEach((step, idx) => {
        if (step.status === 'active') {
          // Pick a random variation for this step
          const variations = stepVariations[step.id as keyof typeof stepVariations];
          const randomLabel = variations[Math.floor(Math.random() * variations.length)];
          
          setTargetLabels(prev => {
            const newTargets = [...prev];
            newTargets[idx] = randomLabel;
            return newTargets;
          });
          
          // Reset scramble progress to start the reveal animation
          setScrambleProgress(prev => {
            const newProgress = [...prev];
            newProgress[idx] = 0;
            return newProgress;
          });
        }
      });
    }, 600 / MATRIX_SPEED); // Change label every 600ms

    // Scramble animation
    const scrambleInterval = setInterval(() => {
      setScrambleProgress(prev => prev.map((p, idx) => {
        if (steps[idx].status === 'active' && p < 1) {
          return Math.min(p + 0.1, 1);
        }
        return p;
      }));
    }, 30);

    return () => {
      clearInterval(labelChangeInterval);
      clearInterval(scrambleInterval);
    };
  }, [isProcessing, steps]);

  // Update display labels with scramble effect
  useEffect(() => {
    setDisplayLabels(prev => prev.map((current, idx) => {
      const target = targetLabels[idx];
      const progress = scrambleProgress[idx];
      
      if (steps[idx].status === 'active' && progress < 1) {
        return scrambleText(current, target, progress);
      }
      return target;
    }));
  }, [targetLabels, scrambleProgress, steps]);

  return (
    <>
      <div className="w-[360px] bg-white/5 border-l-[3px] border-white/20 sticky top-0 h-screen p-6 flex flex-col gap-6 overflow-y-auto">
        {/* Stats Overview Card */}
        <div className="bg-white rounded-[16px] border-[3px] border-black shadow-[4px_4px_0px_#000000] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-[#3b82f6] border-[3px] border-black rounded-[8px] p-2">
                <Flame size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-black leading-none">
                  3
                </span>
                <span className="font-['Arimo:Bold',sans-serif] font-bold text-[10px] text-black/60 uppercase">
                  Day
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-[#f3ff00] border-[3px] border-black rounded-[8px] p-2">
                <Star size={20} className="text-black" fill="black" />
              </div>
              <div className="flex flex-col">
                <span className="font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-black leading-none">
                  500
                </span>
                <span className="font-['Arimo:Bold',sans-serif] font-bold text-[10px] text-black/60 uppercase">
                  XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Research Card - Click to Open Modal */}
        <div 
          onClick={() => setIsResearchDrawerOpen(true)}
          className="bg-white rounded-[16px] border-[3px] border-black shadow-[4px_4px_0px_#000000] p-5 cursor-pointer transition-all hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black uppercase">
              Recent Research
            </h3>
            <button className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] text-[#3b82f6] uppercase hover:text-[#2563eb] transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-2">
            {/* Research Preview */}
            {research.slice(0, 2).map(item => (
              <div 
                key={item.id}
                className="bg-gradient-to-r from-[#f0fdf4] to-[#dcfce7] border-[2px] border-black rounded-[12px] p-3 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start gap-2 mb-1">
                  <div 
                    className="w-[6px] h-[6px] rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: item.statusDot }}
                  />
                  <p 
                    className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] uppercase flex-1"
                    style={{ color: item.tagColor }}
                  >
                    {item.tag}
                  </p>
                </div>
                <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-black line-clamp-2">
                  {item.title}
                </p>
                <p className="font-['Arimo:Bold',sans-serif] font-bold text-[10px] text-black/50 uppercase mt-1">
                  {item.time}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Chats Card - Click to Open Modal */}
        <div 
          onClick={() => setIsChatDrawerOpen(true)}
          className="bg-white rounded-[16px] border-[3px] border-black shadow-[4px_4px_0px_#000000] p-5 cursor-pointer transition-all hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black uppercase">
              Recent Chats
            </h3>
            <button className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] text-[#3b82f6] uppercase hover:text-[#2563eb] transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-2">
            {/* Chat Preview */}
            {chats.slice(0, 2).map(chat => (
              <div 
                key={chat.id}
                className="bg-gradient-to-r from-[#f0fdf4] to-[#dcfce7] border-[2px] border-black rounded-[12px] p-3 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start gap-2 mb-1">
                  <div 
                    className="w-[6px] h-[6px] rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: chat.statusDot }}
                  />
                  <p 
                    className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] uppercase flex-1"
                    style={{ color: chat.tagColor }}
                  >
                    {chat.tag}
                  </p>
                </div>
                <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-black line-clamp-2">
                  {chat.title}
                </p>
                <p className="font-['Arimo:Bold',sans-serif] font-bold text-[10px] text-black/50 uppercase mt-1">
                  {chat.time}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Panel */}
        <div className={`rounded-[16px] border-[3px] border-black shadow-[4px_4px_0px_#000000] p-5 transition-all duration-500 ${
          isProcessing 
            ? 'bg-[#f3ff00]' 
            : 'bg-[#f3ff00]/30'
        }`}>
          <h3 className={`font-['Arimo:Bold',sans-serif] font-bold text-[12px] uppercase mb-4 transition-colors duration-500 ${
            isProcessing ? 'text-black/60' : 'text-black/30'
          }`}>
            Intelligence
          </h3>

          {/* Process Steps - Show when processing OR after first process */}
          {(isProcessing || hasProcessed) && (
            <div className="space-y-3 animate-in fade-in duration-500">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-3">
                  {/* Indicator */}
                  <div className={`w-[12px] h-[12px] rounded-full border-[2px] flex-shrink-0 transition-all ${
                    step.status === 'pending' 
                      ? 'bg-transparent border-black/20' 
                      : step.status === 'active'
                      ? 'bg-[#22c55e] border-[#22c55e] animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                      : 'bg-[#22c55e] border-[#22c55e]'
                  }`} />
                  
                  {/* Label */}
                  <p className={`font-['Arimo:Bold',sans-serif] font-bold text-[13px] transition-colors ${
                    step.status === 'pending'
                      ? 'text-black/40'
                      : step.status === 'active'
                      ? 'text-black'
                      : 'text-black/70'
                  }`}>
                    {displayLabels[step.id - 1]}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Empty state - Show when never processed */}
          {!isProcessing && !hasProcessed && (
            <div className="flex items-center justify-center py-8">
              <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-black/20 uppercase text-center">
                Locked in, ready to vibe.
              </p>
            </div>
          )}
        </div>

        {/* Premium Upsell Card */}
        <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] border-[3px] border-black rounded-[16px] p-5 shadow-[6px_6px_0px_#000000]">
          <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-white uppercase mb-2">
            Go Pro!
          </h3>
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-white/90 leading-relaxed mb-4">
            Get unlimited trade analysis and advanced AI insights!
          </p>
          <button className="w-full bg-[#f3ff00] border-[5px] border-black rounded-[12px] py-3 shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] active:shadow-[1px_1px_0px_#000000] transition-all">
            <span className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-black uppercase">
              Upgrade Now
            </span>
          </button>
        </div>
      </div>

      {/* MODAL OVERLAY - Recent Chats Popup */}
      {isChatDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200"
          onClick={() => setIsChatDrawerOpen(false)}
        >
          {/* Modal Content */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[20px] border-[5px] border-black shadow-[12px_12px_0px_#000000] w-full max-w-[900px] max-h-[90vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          >
            {/* Modal Header */}
            <div className="p-6 border-b-[4px] border-black flex-shrink-0">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-black uppercase tracking-wide">
                  Recent Chats
                </h2>
                <button
                  onClick={() => setIsChatDrawerOpen(false)}
                  className="bg-white hover:bg-black/5 border-[3px] border-black rounded-[10px] p-2 transition-all hover:scale-110 active:scale-95"
                >
                  <X size={24} className="text-black" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full bg-white border-[3px] border-black rounded-[12px] pl-12 pr-4 py-4 font-['Arimo:Bold',sans-serif] font-bold text-[15px] text-black placeholder:text-black/30 focus:outline-none focus:border-[#3b82f6] transition-colors shadow-[3px_3px_0px_#000000]"
                />
              </div>
            </div>

            {/* Chat List - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredChats.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="bg-black/5 border-[3px] border-black rounded-full p-8 mb-6">
                    <Search size={48} className="text-black/20" />
                  </div>
                  <p className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-black/30 uppercase text-center mb-2">
                    No Chats Found
                  </p>
                  <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-black/20 text-center">
                    Try a different search term
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredChats.map(chat => (
                    <div
                      key={chat.id}
                      onMouseEnter={() => setHoveredChatId(chat.id)}
                      onMouseLeave={() => setHoveredChatId(null)}
                      onClick={() => {
                        setActiveChatId(chat.id);
                        if (onChatSelect) onChatSelect(chat.id);
                        setIsChatDrawerOpen(false); // Close modal after selection
                      }}
                      className={`relative rounded-[16px] border-[3px] border-black p-5 cursor-pointer transition-all group ${
                        activeChatId === chat.id
                          ? 'bg-[#f3ff00] shadow-[4px_4px_0px_#000000] scale-[1.02]'
                          : 'bg-gradient-to-r from-white to-gray-50 hover:shadow-[3px_3px_0px_#000000] hover:scale-[1.01]'
                      }`}
                    >
                      {/* Status Dot & Tag */}
                      <div className="flex items-start gap-2 mb-3">
                        <div 
                          className="w-[10px] h-[10px] rounded-full mt-1 flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: chat.statusDot }}
                        />
                        <span 
                          className={`font-['Arimo:Bold',sans-serif] font-bold text-[12px] uppercase px-3 py-1.5 rounded-[8px] border-[3px] border-black ${
                            activeChatId === chat.id ? 'bg-white' : 'bg-white/80'
                          }`}
                          style={{ color: chat.tagColor }}
                        >
                          {chat.tag}
                        </span>
                      </div>

                      {/* Chat Title */}
                      <p className={`font-['Arimo:Bold',sans-serif] text-[16px] text-black mb-3 pr-20 ${
                        activeChatId === chat.id ? 'font-bold' : 'font-semibold'
                      }`}>
                        {chat.title}
                      </p>

                      {/* Time */}
                      <p className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black/50 uppercase">
                        {chat.time}
                      </p>

                      {/* Hover Actions - Rename & Delete */}
                      {hoveredChatId === chat.id && (
                        <div className="absolute top-4 right-4 flex gap-2 animate-in fade-in slide-in-from-right-1 duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Rename chat
                            }}
                            className="bg-white border-[3px] border-black rounded-[8px] p-2 shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] transition-all"
                          >
                            <Edit2 size={16} className="text-black" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Delete chat
                            }}
                            className="bg-white border-[3px] border-black rounded-[8px] p-2 shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] transition-all"
                          >
                            <Trash2 size={16} className="text-[#ff1814]" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL OVERLAY - Recent Research Popup */}
      {isResearchDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200"
          onClick={() => setIsResearchDrawerOpen(false)}
        >
          {/* Modal Content */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[20px] border-[5px] border-black shadow-[12px_12px_0px_#000000] w-full max-w-[900px] max-h-[90vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          >
            {/* Modal Header */}
            <div className="p-6 border-b-[4px] border-black flex-shrink-0">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-black uppercase tracking-wide">
                  Recent Research
                </h2>
                <button
                  onClick={() => setIsResearchDrawerOpen(false)}
                  className="bg-white hover:bg-black/5 border-[3px] border-black rounded-[10px] p-2 transition-all hover:scale-110 active:scale-95"
                >
                  <X size={24} className="text-black" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                <input
                  type="text"
                  value={researchSearchQuery}
                  onChange={(e) => setResearchSearchQuery(e.target.value)}
                  placeholder="Search research..."
                  className="w-full bg-white border-[3px] border-black rounded-[12px] pl-12 pr-4 py-4 font-['Arimo:Bold',sans-serif] font-bold text-[15px] text-black placeholder:text-black/30 focus:outline-none focus:border-[#3b82f6] transition-colors shadow-[3px_3px_0px_#000000]"
                />
              </div>
            </div>

            {/* Research List - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredResearch.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="bg-black/5 border-[3px] border-black rounded-full p-8 mb-6">
                    <Search size={48} className="text-black/20" />
                  </div>
                  <p className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-black/30 uppercase text-center mb-2">
                    No Research Found
                  </p>
                  <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-black/20 text-center">
                    Try a different search term
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredResearch.map(item => (
                    <div
                      key={item.id}
                      onMouseEnter={() => setHoveredResearchId(item.id)}
                      onMouseLeave={() => setHoveredResearchId(null)}
                      onClick={() => {
                        setActiveResearchId(item.id);
                        setIsResearchDrawerOpen(false); // Close modal after selection
                      }}
                      className={`relative rounded-[16px] border-[3px] border-black p-5 cursor-pointer transition-all group ${
                        activeResearchId === item.id
                          ? 'bg-[#f3ff00] shadow-[4px_4px_0px_#000000] scale-[1.02]'
                          : 'bg-gradient-to-r from-white to-gray-50 hover:shadow-[3px_3px_0px_#000000] hover:scale-[1.01]'
                      }`}
                    >
                      {/* Status Dot & Tag */}
                      <div className="flex items-start gap-2 mb-3">
                        <div 
                          className="w-[10px] h-[10px] rounded-full mt-1 flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: item.statusDot }}
                        />
                        <span 
                          className={`font-['Arimo:Bold',sans-serif] font-bold text-[12px] uppercase px-3 py-1.5 rounded-[8px] border-[3px] border-black ${
                            activeResearchId === item.id ? 'bg-white' : 'bg-white/80'
                          }`}
                          style={{ color: item.tagColor }}
                        >
                          {item.tag}
                        </span>
                      </div>

                      {/* Research Title */}
                      <p className={`font-['Arimo:Bold',sans-serif] text-[16px] text-black mb-3 pr-20 ${
                        activeResearchId === item.id ? 'font-bold' : 'font-semibold'
                      }`}>
                        {item.title}
                      </p>

                      {/* Time */}
                      <p className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black/50 uppercase">
                        {item.time}
                      </p>

                      {/* Hover Actions - Rename & Delete */}
                      {hoveredResearchId === item.id && (
                        <div className="absolute top-4 right-4 flex gap-2 animate-in fade-in slide-in-from-right-1 duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Rename research
                            }}
                            className="bg-white border-[3px] border-black rounded-[8px] p-2 shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] transition-all"
                          >
                            <Edit2 size={16} className="text-black" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Delete research
                            }}
                            className="bg-white border-[3px] border-black rounded-[8px] p-2 shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] transition-all"
                          >
                            <Trash2 size={16} className="text-[#ff1814]" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}