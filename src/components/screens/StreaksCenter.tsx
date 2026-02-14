import { Trophy } from 'lucide-react';

export default function StreaksCenter() {
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const completedDays = [true, true, true, false, false, false, false]; // First 3 days completed

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gradient-to-br from-[#ff9500] via-[#ff9500] to-[#ff7b00] flex items-center justify-center">
      <div className="flex flex-col items-center gap-8 px-8 py-12">
        {/* Trophy Icon */}
        <div className="relative">
          <div className="w-[200px] h-[200px] bg-[#ffd700] rounded-full flex items-center justify-center border-[8px] border-[#ffed4e] shadow-lg">
            <Trophy size={120} className="text-[#ff9500]" strokeWidth={2.5} fill="#ff9500" />
          </div>
          {/* Sunglasses overlay */}
          <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[140px] h-[35px] bg-[#8b4513] rounded-[20px] border-[4px] border-black opacity-80" />
        </div>

        {/* Streak Number */}
        <div className="text-center">
          <h1 className="font-['Arimo:Bold',sans-serif] font-bold text-[120px] leading-none text-white tracking-tight">
            365
          </h1>
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[40px] text-white uppercase tracking-wide mt-2">
            day streak!
          </p>
        </div>

        {/* Calendar Widget */}
        <div className="bg-white rounded-[24px] p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.2)] border-[3px] border-white/50 min-w-[380px]">
          <div className="flex items-center justify-around gap-2">
            {daysOfWeek.map((day, index) => (
              <div key={day} className="flex flex-col items-center gap-3">
                {/* Day label */}
                <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-gray-400 uppercase">
                  {day}
                </span>
                
                {/* Day indicator */}
                <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center border-[3px] transition-all ${
                  completedDays[index]
                    ? 'bg-[#ff9500] border-[#ff9500]'
                    : index === 6 // Saturday is the star/freeze day
                    ? 'bg-white border-gray-300'
                    : 'bg-gray-200 border-gray-300'
                }`}>
                  {completedDays[index] ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10L8 14L16 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : index === 6 ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                        fill="#ffd700" stroke="#ffa500" strokeWidth="1.5"/>
                    </svg>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
