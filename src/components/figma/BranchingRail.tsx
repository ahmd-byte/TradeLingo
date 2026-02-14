import { useState } from 'react';
import mascotImage from "figma:asset/c47576d9fb019c19ae2380c4945c7cde9e97a55b.png";
import { Book, Lock, Trophy, Star, ChevronDown, X } from 'lucide-react';
import LessonFlow from './LessonFlow';

// Types
type LessonNode = {
  id: string;
  type: 'start' | 'lesson' | 'locked' | 'milestone';
  title: string;
  status: 'active' | 'completed' | 'locked' | 'available';
  xp?: number;
  hasBranch?: boolean;
  branchLabel?: string;
};

type BranchNode = {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'locked' | 'available';
  xp: number;
};

type Branch = {
  id: string;
  parentNodeId: string;
  label: string;
  description?: string;
  direction: 'left' | 'right';
  nodes: BranchNode[];
  mergesBackAt?: string;
  color: string;
  active: boolean;
  badge: string;
};

// Mock User Profile
const userProfile = {
  user_id: "USR_0921",
  initial_trader_type: "scalper",
  current_trader_type: "swing_trader",
  behavior_shift_detected: true,
  learning_style: "numbers_and_logic",
  risk_profile: "moderate",
  market: "stocks",
  branch_history: ["behavior_shift", "simplified_request"]
};

// SCALPER MAIN SPINE (Foundation)
const scalperMainSpine: LessonNode[] = [
  { id: '1', type: 'start', title: 'Start Your Trading Journey', status: 'completed' },
  { id: '2', type: 'lesson', title: 'Micro Timeframe Structure (1m–5m)', status: 'completed', xp: 15 },
  { id: '3', type: 'lesson', title: 'Risk Per Trade for High Frequency', status: 'completed', xp: 20 },
  { 
    id: '4',
    type: 'lesson',
    title: 'Position Sizing for Fast Entries',
    status: 'active',
    xp: 20,
    hasBranch: true,
    branchLabel: 'TIME HORIZON EXPANSION'
  },
  { id: '5', type: 'lesson', title: 'Entry Timing & Spread Awareness', status: 'available', xp: 25 },
  { id: '6', type: 'milestone', title: 'Scalping Foundation Complete', status: 'locked', xp: 50 }
];

// SWING TRADER MAIN SPINE (After behavior shift)
const swingMainSpine: LessonNode[] = [
  { id: '1', type: 'start', title: 'Start Your Trading Journey', status: 'completed' },
  { id: 's1', type: 'lesson', title: 'Trend Structure on 4H & Daily', status: 'active', xp: 20 },
  { id: 's2', type: 'lesson', title: 'Entry Zones vs Noise', status: 'available', xp: 20 },
  { id: 's3', type: 'lesson', title: 'Swing Risk to Reward Mapping', status: 'locked', xp: 25 },
  { id: 's4', type: 'milestone', title: 'Swing Foundation Complete', status: 'locked', xp: 50 }
];

// BRANCH 1 – Behavior Shift (Scalper → Swing Trader)
const branchDataBehaviorShift: Branch = {
  id: 'behavior_shift',
  parentNodeId: '4',
  label: 'TIME HORIZON EXPANSION',
  description: 'Detected longer holding behavior',
  direction: 'right',
  nodes: [
    { id: 'bs1', title: 'Understanding Multi-Day Market Structure', status: 'available', xp: 20 },
    { id: 'bs2', title: 'Holding Through Pullbacks', status: 'available', xp: 20 },
    { id: 'bs3', title: 'Risk Scaling for Multi-Day Trades', status: 'locked', xp: 25 }
  ],
  mergesBackAt: '5',
  color: '#f3ff00',
  active: true,
  badge: 'POTENTIAL SWING TRADER'
};

// BRANCH 2 – Simplified Mode (SuperBear Request)
const branchDataSimplified: Branch = {
  id: 'simplified_request',
  parentNodeId: 's1',
  label: 'SIMPLIFIED MODE',
  description: 'On Request',
  direction: 'left',
  nodes: [
    { id: 'sm1', title: 'Trend Explained with Real Trade Example', status: 'available', xp: 15 },
    { id: 'sm2', title: 'Visual Breakdown of Your Maybank Trade', status: 'available', xp: 15 }
  ],
  mergesBackAt: 's2',
  color: '#3b82f6',
  active: true,
  badge: 'LEARNING STYLE ADAPTED'
};

// All available branches
const allBranches: Branch[] = [
  branchDataBehaviorShift,
  branchDataSimplified
];

// Components
function BranchingRailCenter({ onXPEarned }: { onXPEarned: (amount: number) => void }) {
  const [clickedNode, setClickedNode] = useState<string | null>(null);
  const [startedLesson, setStartedLesson] = useState<LessonNode | BranchNode | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showRoutesModal, setShowRoutesModal] = useState(false);
  const [traderType, setTraderType] = useState<'scalper' | 'swing_trader'>(userProfile.initial_trader_type);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Determine which spine to show based on trader type
  const mainSpinePath = traderType === 'scalper' ? scalperMainSpine : swingMainSpine;
  
  // Determine header text based on trader type
  const getHeaderText = () => {
    if (traderType === 'scalper') {
      return {
        pathLabel: 'Path 1 · Foundation',
        pathTitle: 'Scalping Fundamentals'
      };
    } else {
      return {
        pathLabel: 'Path 2 · Swing Development',
        pathTitle: 'Market Structure & Patience'
      };
    }
  };

  const headerText = getHeaderText();

  const handleNodeClick = (nodeId: string) => {
    setClickedNode(clickedNode === nodeId ? null : nodeId);
  };

  const handleStartLesson = (node: LessonNode | BranchNode) => {
    setStartedLesson(node);
    setClickedNode(null);
  };

  const handleLessonComplete = () => {
    setStartedLesson(null);
  };

  const handleLessonBack = () => {
    setStartedLesson(null);
  };

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowRoutesModal(false);
  };

  // Show lesson flow if started
  if (startedLesson) {
    return (
      <div className="flex-1 h-screen overflow-y-auto hide-scrollbar bg-[var(--bg-primary)]">
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
    <div className="flex-1 h-screen overflow-y-auto hide-scrollbar bg-[var(--bg-primary)]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-[100] pt-4 pb-8 bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent">
        <div className="flex justify-center px-8">
          <div className="bg-[#22c55e] border-[3px] border-black rounded-[16px] px-6 py-3 flex items-center justify-between gap-6 shadow-[4px_4px_0px_#000000] max-w-[600px] w-full">
            <div className="flex flex-col gap-0">
              <p className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] text-black/60 uppercase tracking-wider leading-tight">
                {headerText.pathLabel}
              </p>
              <h1 className="font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-black uppercase tracking-wide leading-tight">
                {headerText.pathTitle}
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

      {/* View Routes Button */}
      <div className="flex justify-center px-8 mb-4">
        <button
          onClick={() => setShowRoutesModal(true)}
          className="bg-white/10 border-[2px] border-black/20 rounded-[10px] px-4 py-2 hover:bg-white/20 transition-all"
        >
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black uppercase flex items-center gap-2">
            View Routes <ChevronDown size={14} />
          </span>
        </button>
      </div>

      {/* Learning Path with Branches */}
      <div className="pt-4 pb-12 px-8 flex flex-col items-center gap-0 relative min-h-[calc(100vh-120px)]">
        {/* Main Spine - Vertical connecting line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[6px] bg-white rounded-full transform -translate-x-1/2 opacity-100" />

        {mainSpinePath.map((node, index) => {
          const hasBranch = selectedBranch && node.id === selectedBranch.parentNodeId;
          
          // Calculate lesson index (only count lessons before this node)
          const lessonNodesBeforeThis = mainSpinePath.slice(0, index + 1).filter(n => n.type === 'lesson').length;
          const totalLessonNodes = mainSpinePath.filter(n => n.type === 'lesson').length;
          
          return (
            <div key={node.id} className="relative flex flex-col items-center">
              {/* Main Spine Node */}
              <MainSpineNode 
                node={node} 
                isClicked={node.id === clickedNode}
                onClick={() => handleNodeClick(node.id)}
                onStartLesson={handleStartLesson}
                isClickedNode={node.id === clickedNode}
                lessonIndex={lessonNodesBeforeThis}
                totalLessons={totalLessonNodes}
              />

              {/* Mascot near active node */}
              {node.id === '3' && (
                <div className="absolute left-[-180px] top-1/2 -translate-y-1/2 animate-fade-in">
                  <div className="w-[120px] h-[180px] rounded-[60px] overflow-hidden border-[5px] border-black shadow-[8px_8px_0px_#000000]">
                    <img 
                      src={mascotImage} 
                      alt="LingoBear" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Branch from this node */}
              {hasBranch && (
                <BranchRail 
                  branch={selectedBranch}
                  clickedNode={clickedNode}
                  onNodeClick={handleNodeClick}
                  onStartLesson={handleStartLesson}
                />
              )}

              {/* Spacer between nodes */}
              {index < mainSpinePath.length - 1 && (
                <div className="h-[80px] w-[6px] bg-transparent" />
              )}
            </div>
          );
        })}
      </div>

      {/* Guide Popup */}
      {showGuide && <GuidePopup onClose={() => setShowGuide(false)} />}

      {/* Routes Modal */}
      {showRoutesModal && (
        <RoutesModal 
          onClose={() => setShowRoutesModal(false)} 
          onBranchSelect={handleBranchSelect}
          selectedBranch={selectedBranch}
        />
      )}
    </div>
  );
}

function MainSpineNode({ 
  node, 
  isClicked, 
  onClick,
  onStartLesson,
  isClickedNode,
  lessonIndex,
  totalLessons
}: { 
  node: LessonNode; 
  isClicked: boolean; 
  onClick: () => void;
  onStartLesson: (node: LessonNode) => void;
  isClickedNode: boolean;
  lessonIndex: number;
  totalLessons: number;
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
      return <Trophy size={36} strokeWidth={3} className="text-[var(--bg-primary)]" />;
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
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] text-black uppercase">
            Start
          </span>
        </div>
      )}

      {/* Node Circle */}
      <button
        onClick={onClick}
        disabled={node.status === 'locked'}
        className={`w-[90px] h-[90px] rounded-full border-[5px] flex items-center justify-center shadow-[6px_6px_0px_#000000] transition-all ${getNodeStyle()}`}
      >
        {getNodeContent()}
      </button>

      {/* Title */}
      <div className="text-center max-w-[140px]">
        <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black uppercase leading-tight">
          {node.title}
        </p>
      </div>

      {/* XP Label */}
      {node.xp && (
        <div className="bg-black/10 border-[2px] border-black rounded-[8px] px-3 py-1">
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black">
            +{node.xp} XP
          </span>
        </div>
      )}

      {/* Popup on the right side */}
      {isClickedNode && node.status !== 'locked' && (
        <div className="absolute left-[180px] top-0 z-50 animate-fade-in">
          <div className="bg-white rounded-[16px] border-[3px] border-black shadow-[6px_6px_0px_#000000] p-5 w-[280px]">
            <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-black mb-2 leading-tight">
              {node.title}
            </h3>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black/60 mb-4">
              Lesson {lessonIndex} of {totalLessons}
            </p>
            <button 
              className="w-full bg-[#22c55e] border-[3px] border-black rounded-[12px] py-3 shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] active:shadow-[1px_1px_0px_#000000] transition-all"
              onClick={() => onStartLesson(node)}
            >
              <span className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-black uppercase">
                {node.status === 'completed' ? 'Practice Again' : `Start +${node.xp} XP`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BranchRail({ 
  branch, 
  clickedNode, 
  onNodeClick,
  onStartLesson
}: { 
  branch: Branch;
  clickedNode: string | null;
  onNodeClick: (id: string) => void;
  onStartLesson: (node: BranchNode) => void;
}) {
  const isLeft = branch.direction === 'left';
  const curveDirection = isLeft ? -1 : 1;

  return (
    <div className={`absolute ${isLeft ? 'right-[140px]' : 'left-[140px]'} top-[45px] animate-fade-in`}>
      {/* Branch Label Badge */}
      <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-black border-[3px] border-black rounded-[12px] px-4 py-1.5 shadow-[2px_2px_0px_rgba(243,255,0,0.6)]" style={{ animation: 'pulse-glow 2s ease-in-out' }}>
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] text-[#f3ff00] uppercase tracking-wide">
            {branch.label}
          </span>
        </div>
      </div>

      {/* Curved Connector */}
      <svg 
        width="180" 
        height="120" 
        className="absolute top-0 left-0"
        style={{ 
          left: isLeft ? 'auto' : '-90px',
          right: isLeft ? '-90px' : 'auto',
        }}
      >
        <path
          d={`M ${isLeft ? 180 : 0} 0 Q ${isLeft ? 90 : 90} 30, ${isLeft ? 0 : 180} 60`}
          stroke="white"
          strokeWidth="4"
          fill="none"
          opacity="0.85"
          strokeLinecap="round"
        />
      </svg>

      {/* Branch Nodes */}
      <div className="flex flex-col items-center gap-3 pt-[60px]">
        {branch.nodes.map((branchNode, index) => (
          <div key={branchNode.id} className="flex flex-col items-center gap-3">
            <BranchNode 
              node={branchNode}
              isClicked={branchNode.id === clickedNode}
              onClick={() => onNodeClick(branchNode.id)}
              onStartLesson={onStartLesson}
              isFirst={index === 0}
            />
            
            {/* Vertical connector between branch nodes */}
            {index < branch.nodes.length - 1 && (
              <div className="w-[4px] h-[60px] bg-white rounded-full opacity-85" />
            )}
          </div>
        ))}
      </div>

      {/* Merge Back Indicator (if applicable) */}
      {branch.mergesBackAt && (
        <div className="mt-3 flex justify-center">
          <div className="w-[4px] h-[40px] bg-white rounded-full opacity-50" />
        </div>
      )}
    </div>
  );
}

function BranchNode({ 
  node, 
  isClicked, 
  onClick,
  onStartLesson,
  isFirst
}: { 
  node: BranchNode;
  isClicked: boolean;
  onClick: () => void;
  onStartLesson: (node: BranchNode) => void;
  isFirst: boolean;
}) {
  const getNodeStyle = () => {
    if (node.status === 'locked') {
      return 'bg-gray-600 border-gray-800 opacity-60 cursor-not-allowed';
    }
    if (node.status === 'completed') {
      return 'bg-[#22c55e] border-black cursor-pointer hover:scale-105';
    }
    if (node.status === 'active' || isClicked) {
      return 'bg-[#f3ff00] border-black cursor-pointer scale-105';
    }
    return 'bg-white border-black cursor-pointer hover:scale-105';
  };

  return (
    <div className="flex flex-col items-center gap-2 z-10 relative">
      {/* Node Circle - 80% size */}
      <button
        onClick={onClick}
        disabled={node.status === 'locked'}
        className={`w-[72px] h-[72px] rounded-full border-[4px] flex items-center justify-center shadow-[6px_6px_0px_#000000] transition-all ${getNodeStyle()} ${
          isFirst ? 'shadow-[0_0_20px_rgba(243,255,0,0.4)]' : ''
        }`}
      >
        {node.status === 'completed' ? (
          <Star size={28} strokeWidth={3} className="text-white" fill="white" />
        ) : (
          <Book size={28} strokeWidth={3} className="text-black" />
        )}
      </button>

      {/* Title */}
      <div className="text-center max-w-[120px]">
        <p className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black uppercase leading-tight">
          {node.title}
        </p>
      </div>

      {/* XP Label */}
      <div className="bg-black/10 border-[2px] border-black rounded-[8px] px-2 py-0.5">
        <span className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] text-black">
          +{node.xp} XP
        </span>
      </div>

      {/* Popup */}
      {isClicked && node.status !== 'locked' && (
        <div className="absolute left-[120px] top-0 z-50 animate-fade-in">
          <div className="bg-white rounded-[16px] border-[3px] border-black shadow-[6px_6px_0px_#000000] p-5 w-[260px]">
            <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-black mb-2 leading-tight">
              {node.title}
            </h3>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-black/60 mb-4">
              Adaptive Branch Lesson
            </p>
            <button 
              className="w-full bg-[#22c55e] border-[3px] border-black rounded-[12px] py-3 shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] active:shadow-[1px_1px_0px_#000000] transition-all"
              onClick={() => onStartLesson(node)}
            >
              <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black uppercase">
                {node.status === 'completed' ? 'Practice Again' : `Start +${node.xp} XP`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GuidePopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-8">
      <div className="bg-white rounded-[24px] border-[5px] border-black shadow-[12px_12px_0px_#000000] p-8 max-w-[500px] w-full animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-black uppercase">
            Path Guide
          </h2>
          <button onClick={onClose} className="text-black/60 hover:text-black">
            <X size={28} strokeWidth={3} />
          </button>
        </div>
        <div className="space-y-4">
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black/80">
            Follow the main spine to build your trading foundation. Adaptive branches appear based on your learning patterns and behavior.
          </p>
          <div className="bg-[#f3ff00]/20 border-[3px] border-black rounded-[12px] p-4">
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-black uppercase mb-2">
              Main Spine
            </p>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black/60">
              Your primary learning route. Complete these lessons to unlock advanced content.
            </p>
          </div>
          <div className="bg-white border-[3px] border-black rounded-[12px] p-4">
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-black uppercase mb-2">
              Adaptive Branches
            </p>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black/60">
              Personalized detours that address specific skills or behaviors. Complete them to merge back into the main path.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoutesModal({ onClose, onBranchSelect, selectedBranch }: { onClose: () => void, onBranchSelect: (branch: Branch) => void, selectedBranch: Branch | null }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-8">
      <div className="bg-white rounded-[24px] border-[5px] border-black shadow-[12px_12px_0px_#000000] p-8 max-w-[700px] w-full animate-fade-in max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-black uppercase">
            Learning Routes
          </h2>
          <button onClick={onClose} className="text-black/60 hover:text-black">
            <X size={28} strokeWidth={3} />
          </button>
        </div>

        {/* Main Path */}
        <div className="mb-6">
          <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black/60 uppercase mb-3">
            Main Path
          </h3>
          <div className="bg-[#22c55e]/10 border-[3px] border-[#22c55e] rounded-[16px] p-5">
            <div className="flex items-center gap-4">
              <div 
                className="w-[60px] h-[60px] rounded-full border-[4px] border-black flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#22c55e' }}
              >
                <Book size={28} strokeWidth={3} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-black uppercase mb-1">
                  Scalping Fundamentals
                  <span className="ml-2 text-[12px] text-[#22c55e]">● ACTIVE</span>
                </h3>
                <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-black/60">
                  Foundation path for high-frequency trading
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Adaptive Branches */}
        <div>
          <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black/60 uppercase mb-3">
            Adaptive Branches
          </h3>
          <div className="space-y-3">
            {allBranches.map((branch) => (
              <div
                key={branch.id}
                className={`bg-white border-[3px] rounded-[16px] p-5 transition-all ${
                  branch.active 
                    ? 'border-black shadow-[4px_4px_0px_#000000]' 
                    : 'border-black/20'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="w-[60px] h-[60px] rounded-full border-[4px] border-black flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: branch.color }}
                  >
                    <Star size={28} strokeWidth={3} className="text-white" fill="white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-black uppercase">
                        {branch.label}
                      </h3>
                      {branch.active && (
                        <span className="bg-[#f3ff00] border-[2px] border-black rounded-[6px] px-2 py-0.5 text-[10px] font-['Arimo:Bold',sans-serif] font-bold text-black uppercase">
                          {branch.badge}
                        </span>
                      )}
                    </div>
                    <p className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black/60 mb-3">
                      {branch.description}
                    </p>
                    
                    {/* Branch lessons preview */}
                    <div className="space-y-2">
                      {branch.nodes.map((node, index) => (
                        <div 
                          key={node.id}
                          className="flex items-center justify-between bg-black/5 rounded-[8px] px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] text-black/40">
                              {index + 1}
                            </span>
                            <span className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black">
                              {node.title}
                            </span>
                          </div>
                          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] text-black/60">
                            +{node.xp} XP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {branch.active && (
                  <button
                    className="w-full bg-[#22c55e] border-[3px] border-black rounded-[12px] py-3 shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] active:shadow-[1px_1px_0px_#000000] transition-all"
                    onClick={() => onBranchSelect(branch)}
                  >
                    <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black uppercase">
                      {selectedBranch && selectedBranch.id === branch.id ? 'SELECTED' : 'SELECT'}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BranchingRailCenter;