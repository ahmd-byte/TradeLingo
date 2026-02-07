import { useState } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import mascotImage from "@/assets/mascotbear.png";
import { Book, Brain, Sparkles, Flame, User, Lock, Trophy, Star } from 'lucide-react';
import TradingTherapy from './TradingTherapy';
import SuperBear from './SuperBear';
import SuperBearRightPanel from './SuperBearRightPanel';
import StreaksCenter from './StreaksCenter';
import StreaksRightPanel from './StreaksRightPanel';
import ProfileCenter from './ProfileCenter';
import ProfileRightPanel from './ProfileRightPanel';
import LessonFlow from './LessonFlow';

// Types
type LessonNode = {
  id: string;
  type: 'start' | 'lesson' | 'locked' | 'milestone';
  title: string;
  status: 'active' | 'completed' | 'locked' | 'available';
  xp?: number;
};

// Sample lesson data
const lessonPath: LessonNode[] = [
  { id: '1', type: 'start', title: 'Start Your Journey', status: 'completed' },
  { id: '2', type: 'lesson', title: 'Talk about nationalities', status: 'active', xp: 10 },
  { id: '3', type: 'lesson', title: 'Chart Reading 101', status: 'available', xp: 15 },
  { id: '4', type: 'locked', title: 'Locked Lesson', status: 'locked', xp: 20 },
  { id: '5', type: 'lesson', title: 'Risk Management', status: 'locked', xp: 20 },
  { id: '6', type: 'milestone', title: 'Foundation Complete', status: 'locked', xp: 50 },
  { id: '7', type: 'lesson', title: 'Advanced Patterns', status: 'locked', xp: 25 },
];

// Components
function LeftNavigation({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const navigate = useNavigate();
  
  const navItems = [
    { id: 'learn', label: 'Learn', icon: Book, path: '/dashboard/learn' },
    { id: 'therapy', label: 'Trading Therapy', icon: Brain, path: '/dashboard/therapy' },
    { id: 'superbear', label: 'SuperBear', icon: Sparkles, path: '/dashboard/superbear' },
    { id: 'streaks', label: 'Streaks', icon: Flame, path: '/dashboard/streaks' },
    { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/profile' },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    navigate(item.path);
    onTabChange(item.id);
  };

  return (
    <div className="w-[200px] bg-black border-r-[3px] border-white/20 h-screen flex flex-col p-6 gap-8">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-[40px] h-[40px] bg-[#f3ff00] rounded-full border-[3px] border-black flex items-center justify-center">
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-black">T</span>
        </div>
        <span className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-white uppercase">
          TradeLingo
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex items-center gap-3 px-4 py-3 rounded-[12px] border-[3px] transition-all ${
                isActive
                  ? 'bg-[#ff1814] border-white text-white'
                  : 'bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={20} strokeWidth={3} />
              <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] uppercase">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function CenterLearningPath({ onXPEarned }: { onXPEarned: (amount: number) => void }) {
  const [clickedNode, setClickedNode] = useState<string | null>(null);
  const [startedLesson, setStartedLesson] = useState<LessonNode | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleNodeClick = (nodeId: string) => {
    // Toggle: if clicking the same node, close it
    setClickedNode(clickedNode === nodeId ? null : nodeId);
  };

  const handleStartLesson = (node: LessonNode) => {
    setStartedLesson(node);
    setClickedNode(null);
  };

  const handleLessonComplete = () => {
    setStartedLesson(null);
  };

  const handleLessonBack = () => {
    setStartedLesson(null);
  };

  // Show lesson flow if started
  if (startedLesson) {
    return (
      <div className="flex-1 h-screen overflow-y-auto hide-scrollbar bg-[#ff1814]">
        <LessonFlow 
          onComplete={handleLessonComplete}
          onBack={handleLessonBack}
          lessonTitle={startedLesson.title}
          xpReward={startedLesson.xp || 0}
          onXPEarned={onXPEarned}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 h-screen overflow-y-auto hide-scrollbar bg-[#ff1814]">
      {/* Sticky Header - Floating with background shield */}
      <div className="sticky top-0 z-[100] pt-4 pb-8 bg-gradient-to-b from-[#ff1814] via-[#ff1814] to-transparent">
        <div className="flex justify-center px-8">
          <div className="bg-[#22c55e] border-[3px] border-black rounded-[16px] px-6 py-3 flex items-center justify-between gap-6 shadow-[4px_4px_0px_#000000] max-w-[600px] w-full">
            <div className="flex flex-col gap-0">
              <p className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] text-black/60 uppercase tracking-wider leading-tight">
                Path 1 · Foundation
              </p>
              <h1 className="font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-black uppercase tracking-wide leading-tight">
                Trading Fundamentals
              </h1>
            </div>
            <button 
              onClick={() => setShowGuide(true)}
              className="bg-white border-[3px] border-black rounded-[10px] px-5 py-2 shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] active:shadow-[1px_1px_0px_#000000] transition-all flex-shrink-0"
            >
              <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black uppercase">
                Guide
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div className="pt-4 pb-12 px-8 flex flex-col items-center gap-0 relative min-h-[calc(100vh-120px)]">
        {/* Vertical connecting line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-white/20 transform -translate-x-1/2" />

        {lessonPath.map((node, index) => (
          <div key={node.id} className="relative flex flex-col items-center">
            {/* Node */}
            <LessonNodeComponent 
              node={node} 
              isClicked={node.id === clickedNode}
              onClick={() => handleNodeClick(node.id)}
            />

            {/* Mascot near active node */}
            {node.id === '2' && (
              <div className="absolute left-[-180px] top-0 animate-fade-in">
                <div className="w-[120px] h-[180px] rounded-[60px] overflow-hidden border-[5px] border-black shadow-[8px_8px_0px_#000000]">
                  <img 
                    src={mascotImage} 
                    alt="LingoBear" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Popup on the right side */}
            {node.id === clickedNode && node.status !== 'locked' && (
              <div className="absolute left-[180px] top-0 z-50 animate-fade-in">
                <div className="bg-white rounded-[16px] border-[3px] border-black shadow-[6px_6px_0px_#000000] p-5 w-[280px]">
                  <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-black mb-2 leading-tight">
                    {node.title}
                  </h3>
                  <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black/60 mb-4">
                    Lesson {node.id} of {lessonPath.filter(l => l.type === 'lesson').length}
                  </p>
                  <button 
                    className="w-full bg-[#22c55e] border-[3px] border-black rounded-[12px] py-3 shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] active:shadow-[1px_1px_0px_#000000] transition-all"
                    onClick={() => handleStartLesson(node)}
                  >
                    <span className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-black uppercase">
                      {node.status === 'completed' ? 'Practice Again' : `Start +${node.xp} XP`}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Spacer between nodes */}
            {index < lessonPath.length - 1 && (
              <div className="h-[80px] w-[4px] bg-transparent" />
            )}
          </div>
        ))}
      </div>

      {/* Guide Popup */}
      {showGuide && <GuidePopup onClose={() => setShowGuide(false)} />}
    </div>
  );
}

function LessonNodeComponent({ 
  node, 
  isClicked, 
  onClick 
}: { 
  node: LessonNode; 
  isClicked: boolean; 
  onClick: () => void;
}) {
  const getNodeStyle = () => {
    if (node.status === 'locked') {
      return 'bg-gray-600 border-gray-800 opacity-60 cursor-not-allowed';
    }
    if (node.status === 'completed') {
      return 'bg-[#22c55e] border-black cursor-pointer hover:scale-105';
    }
    if (node.status === 'active' || isClicked) {
      return 'bg-[#f3ff00] border-black cursor-pointer animate-pulse-3x scale-110';
    }
    return 'bg-white border-black cursor-pointer hover:scale-105';
  };

  const getNodeContent = () => {
    if (node.type === 'start') {
      return <Star size={36} strokeWidth={3} className="text-white" fill="white" />;
    }
    if (node.type === 'locked') {
      return <Lock size={36} strokeWidth={3} className="text-white" />;
    }
    if (node.type === 'milestone') {
      return <Trophy size={36} strokeWidth={3} className="text-[#ff1814]" />;
    }
    if (node.status === 'completed') {
      return <Star size={36} strokeWidth={3} className="text-white" fill="white" />;
    }
    return <Book size={36} strokeWidth={3} className="text-black" />;
  };

  return (
    <div className="flex flex-col items-center gap-3 z-10">
      {/* Label above node */}
      {node.type === 'start' && (
        <div className="bg-white/90 border-[3px] border-black rounded-[8px] px-3 py-1">
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black uppercase">
            Start
          </span>
        </div>
      )}

      {/* Node Circle */}
      <button
        onClick={onClick}
        disabled={node.status === 'locked'}
        className={`
          w-[100px] h-[100px] rounded-full border-[5px] 
          flex items-center justify-center
          shadow-[8px_8px_0px_#000000]
          transition-all duration-200
          ${getNodeStyle()}
        `}
      >
        {getNodeContent()}
      </button>

      {/* Node Label */}
      <div className="text-center max-w-[200px]">
        <p className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-white uppercase leading-tight">
          {node.title}
        </p>
        {node.xp && (
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-[#f3ff00] uppercase mt-1">
            +{node.xp} XP
          </p>
        )}
      </div>
    </div>
  );
}

function GuidePopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] px-4">
      <div className="bg-white border-[5px] border-black rounded-[24px] shadow-[12px_12px_0px_#000000] max-w-[600px] w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-[40px] h-[40px] bg-[#ff1814] border-[3px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] active:shadow-[1px_1px_0px_#000000] transition-all"
        >
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-white leading-none">✕</span>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[32px] text-black uppercase tracking-wide leading-tight">
            XP Guide
          </h2>
          <div className="w-[60px] h-[4px] bg-[#f3ff00] mt-2"></div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* What is XP */}
          <div>
            <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-black uppercase mb-2">
              What is XP?
            </h3>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black/70 leading-relaxed">
              XP (Experience Points) tracks your learning progress in TradeLingo. Earn XP to level up your trading knowledge and compete on the leaderboard!
            </p>
          </div>

          {/* How it Works */}
          <div>
            <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-black uppercase mb-2">
              How it Works
            </h3>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black/70 leading-relaxed">
              Your XP is tracked in two ways: <span className="text-[#22c55e]">Daily XP</span> (resets each day with a goal of 20 XP) and <span className="text-[#ff1814]">Total XP</span> (your lifetime score shown on the leaderboard).
            </p>
          </div>

          {/* How to Get Points */}
          <div>
            <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-black uppercase mb-3">
              How to Get Points
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-[32px] h-[32px] bg-[#22c55e] border-[2px] border-black rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white">✓</span>
                </div>
                <div>
                  <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black uppercase">
                    Correct Answers
                  </p>
                  <p className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black/60">
                    Earn 5 XP for each correct answer during lessons
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-[32px] h-[32px] bg-[#f3ff00] border-[2px] border-black rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black">★</span>
                </div>
                <div>
                  <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black uppercase">
                    Complete Lessons
                  </p>
                  <p className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black/60">
                    Finish lessons to earn bonus XP and unlock new content
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-[32px] h-[32px] bg-[#ff1814] border-[2px] border-black rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white">🔥</span>
                </div>
                <div>
                  <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black uppercase">
                    Maintain Streaks
                  </p>
                  <p className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black/60">
                    Keep your daily streak alive for bonus XP rewards
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Got It Button */}
        <button
          onClick={onClose}
          className="mt-8 w-full bg-[#22c55e] border-[5px] border-black rounded-[16px] px-8 py-4 shadow-[8px_8px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] active:shadow-[1px_1px_0px_#000000] transition-all"
        >
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-white uppercase tracking-wide">
            Got It!
          </span>
        </button>
      </div>
    </div>
  );
}

function RightPanel({ dailyXP, totalXP }: { dailyXP: number; totalXP: number }) {
  const dailyGoal = 20;
  const progressPercentage = (dailyXP / dailyGoal) * 100;
  
  return (
    <div className="w-[300px] bg-white/5 border-l-[3px] border-white/20 h-screen overflow-y-auto p-6">
      {/* XP Progress */}
      <div className="bg-white rounded-[16px] border-[3px] border-black shadow-[4px_4px_0px_#000000] p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black/60 uppercase">
            Daily Goal
          </span>
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-[#22c55e]">
            {dailyXP}/{dailyGoal} XP
          </span>
        </div>
        <div className="w-full h-[12px] bg-gray-200 rounded-full overflow-hidden border-[2px] border-black">
          <div 
            className="h-full bg-[#22c55e] transition-all duration-300" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Current Streak */}
      <div className="bg-[#f3ff00] rounded-[16px] border-[3px] border-black shadow-[4px_4px_0px_#000000] p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-[50px] h-[50px] bg-[#ff1814] rounded-full border-[3px] border-black flex items-center justify-center">
            <Flame size={28} strokeWidth={3} className="text-[#f3ff00]" fill="#f3ff00" />
          </div>
          <div>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[24px] text-black leading-none">
              7 Day
            </p>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black/60 uppercase">
              Streak
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="bg-white rounded-[16px] border-[3px] border-black shadow-[4px_4px_0px_#000000] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black uppercase">
            Leaderboard
          </h3>
          <Trophy size={18} strokeWidth={3} className="text-[#ff1814]" />
        </div>
        <div className="space-y-2">
          {[
            { name: 'Sarah M.', xp: 2450, rank: 1 },
            { name: 'You', xp: totalXP, rank: 2, highlight: true },
            { name: 'Mike K.', xp: 1625, rank: 3 },
          ].map((user) => (
            <div 
              key={user.rank} 
              className={`flex items-center justify-between p-2 rounded-[8px] ${
                user.highlight ? 'bg-[#f3ff00]/30' : 'bg-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black/40 w-[20px]">
                  {user.rank}
                </span>
                <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black">
                  {user.name}
                </span>
              </div>
              <span className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black/60">
                {user.xp} XP
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get active tab from URL path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/therapy')) return 'therapy';
    if (path.includes('/superbear')) return 'superbear';
    if (path.includes('/streaks')) return 'streaks';
    if (path.includes('/profile')) return 'profile';
    return 'learn';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTab());
  const [isSuperBearProcessing, setIsSuperBearProcessing] = useState(false);
  const [dailyXP, setDailyXP] = useState(12); // Current daily XP (out of 20)
  const [totalXP, setTotalXP] = useState(1830); // Total lifetime XP for leaderboard
  
  const handleXPEarned = (amount: number) => {
    setDailyXP(prev => Math.min(prev + amount, 20)); // Cap at 20 for daily goal
    setTotalXP(prev => prev + amount);
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="flex h-screen w-screen bg-[#ff1814] overflow-hidden">
      <LeftNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <Routes>
        <Route path="learn" element={
          <>
            <CenterLearningPath onXPEarned={handleXPEarned} />
            <RightPanel dailyXP={dailyXP} totalXP={totalXP} />
          </>
        } />
        <Route path="therapy" element={<TradingTherapy />} />
        <Route path="superbear" element={
          <>
            <SuperBear onProcessingChange={setIsSuperBearProcessing} />
            <SuperBearRightPanel isProcessing={isSuperBearProcessing} />
          </>
        } />
        <Route path="streaks" element={
          <>
            <StreaksCenter />
            <StreaksRightPanel />
          </>
        } />
        <Route path="profile" element={
          <>
            <ProfileCenter onLogout={handleLogout} />
            <ProfileRightPanel />
          </>
        } />
        {/* Default redirect to learn */}
        <Route path="" element={<Navigate to="learn" replace />} />
        <Route path="*" element={<Navigate to="learn" replace />} />
      </Routes>
    </div>
  );
}
