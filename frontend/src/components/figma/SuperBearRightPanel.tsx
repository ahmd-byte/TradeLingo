import { Flame, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

type ProcessStep = {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'completed';
};

interface SuperBearRightPanelProps {
  isProcessing?: boolean;
}

export default function SuperBearRightPanel({ isProcessing = false }: SuperBearRightPanelProps) {
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<ProcessStep[]>([
    { id: 1, label: 'Gathering trade data', status: 'pending' },
    { id: 2, label: 'Searching related market conditions', status: 'pending' },
    { id: 3, label: 'Pattern matching', status: 'pending' },
    { id: 4, label: 'Synthesizing explanation', status: 'pending' },
  ]);

  useEffect(() => {
    if (!isProcessing) {
      // Reset when not processing
      setProgress(0);
      setSteps([
        { id: 1, label: 'Gathering trade data', status: 'pending' },
        { id: 2, label: 'Searching related market conditions', status: 'pending' },
        { id: 3, label: 'Pattern matching', status: 'pending' },
        { id: 4, label: 'Synthesizing explanation', status: 'pending' },
      ]);
      return;
    }

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
        
        // Update step status based on progress (each step gets 25% of the bar)
        const stepIndex = Math.floor(currentProgress / 25);
        if (stepIndex !== currentStep && stepIndex < 4) {
          currentStep = stepIndex;
          setSteps(prev => prev.map((step, idx) => {
            if (idx < stepIndex) return { ...step, status: 'completed' };
            if (idx === stepIndex) return { ...step, status: 'active' };
            return { ...step, status: 'pending' };
          }));
        }
      }
    }, 1000 / frameRate);

    return () => clearInterval(interval);
  }, [isProcessing]);
  return (
    <div className="w-[340px] bg-black border-l-[3px] border-white/20 h-screen p-6 flex flex-col gap-6 overflow-y-auto">
      {/* Stats Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-[#3b82f6] border-[3px] border-black rounded-[8px] p-2">
            <Flame size={20} className="text-white" />
          </div>
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-white">
            3
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#f3ff00] border-[3px] border-black rounded-[8px] p-2">
            <Star size={20} className="text-black" fill="black" />
          </div>
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-white">
            500
          </span>
        </div>
      </div>

      {/* Recent Analysis Card */}
      <div className="bg-[#1a1a1a] border-[3px] border-white/20 rounded-[16px] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-white uppercase">
            Recent Analysis
          </h3>
          <button className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-[#3b82f6] uppercase">
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Analysis Item 1 */}
          <div className="bg-white/5 border-[2px] border-white/10 rounded-[12px] p-3 cursor-pointer transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-100">
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-[#22c55e] uppercase mb-1">
              Momentum Bias
            </p>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-white/80">
              Volatility 100 Trade
            </p>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] text-white/50 uppercase mt-1">
              2 hours ago
            </p>
          </div>

          {/* Analysis Item 2 */}
          <div className="bg-white/5 border-[2px] border-white/10 rounded-[12px] p-3 cursor-pointer transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-100">
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-[#f59e0b] uppercase mb-1">
              Risk Management
            </p>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-white/80">
              EUR/USD Trade
            </p>
            <p className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] text-white/50 uppercase mt-1">
              Yesterday
            </p>
          </div>
        </div>
      </div>

      {/* Intelligence Panel */}
      <div className="bg-[#1a1a1a] border-[3px] border-white/20 rounded-[16px] p-5">
        <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-white/60 uppercase mb-4">
          Intelligence
        </h3>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="bg-white/10 border-[2px] border-white/20 rounded-[8px] h-[12px] overflow-hidden">
            <div 
              className="bg-[#f3ff00] h-full transition-all duration-100 ease-linear rounded-[6px]"
              style={{ 
                width: `${progress}%`,
                boxShadow: progress > 0 ? '0 0 8px rgba(243, 255, 0, 0.4)' : 'none'
              }} 
            />
          </div>
        </div>

        {/* Process Steps */}
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-3">
              {/* Indicator */}
              <div className={`w-[12px] h-[12px] rounded-full border-[2px] flex-shrink-0 transition-all ${
                step.status === 'pending' 
                  ? 'bg-transparent border-white/20' 
                  : step.status === 'active'
                  ? 'bg-[#f3ff00] border-[#f3ff00] animate-pulse shadow-[0_0_8px_rgba(243,255,0,0.6)]'
                  : 'bg-[#22c55e] border-[#22c55e]'
              }`} />
              
              {/* Label */}
              <p className={`font-['Arimo:Bold',sans-serif] font-bold text-[13px] transition-colors ${
                step.status === 'pending'
                  ? 'text-white/40'
                  : step.status === 'active'
                  ? 'text-[#f3ff00]'
                  : 'text-white/80'
              }`}>
                {step.label}
              </p>
            </div>
          ))}
        </div>
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
  );
}
