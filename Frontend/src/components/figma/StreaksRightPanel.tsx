import { Clock, Flame } from 'lucide-react';

type LeaderboardUser = {
  rank: number;
  name: string;
  xp: number;
  initial: string;
  color: string;
  country: string;
  streakYears: string;
};

export default function StreaksRightPanel() {
  const leaderboard: LeaderboardUser[] = [
    { rank: 1, name: 'Daphné', xp: 33, initial: 'D', color: '#22c55e', country: '🇪🇸', streakYears: '' },
    { rank: 2, name: 'Lizz', xp: 30, initial: 'L', color: '#22c55e', country: '🌍', streakYears: '1+ year' },
    { rank: 3, name: 'ET', xp: 30, initial: 'E', color: '#c084fc', country: '🌍', streakYears: '3+ years' },
    { rank: 4, name: 'Kelsey', xp: 28, initial: 'K', color: '#fb923c', country: '🌍', streakYears: '1+ year' },
    { rank: 5, name: 'Aesir4099', xp: 15, initial: 'A', color: '#c084fc', country: '🎮', streakYears: '' },
  ];

  const leagues = [
    { color: '#22c55e', unlocked: true },
    { color: '#c084fc', unlocked: true },
    { color: '#ec4899', unlocked: true },
    { color: '#64748b', unlocked: true },
    { color: '#e5e7eb', unlocked: false },
  ];

  return (
    <div className="w-[380px] h-screen overflow-y-auto bg-white border-l-[3px] border-gray-200 p-6 flex flex-col gap-6">
      {/* League Badges */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {leagues.map((league, index) => (
          <div
            key={index}
            className={`w-[52px] h-[52px] flex items-center justify-center transition-all ${
              league.unlocked ? '' : 'opacity-30'
            }`}
            style={{
              background: league.color,
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
              border: '3px solid #000',
            }}
          >
            {!league.unlocked && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C10.34 2 9 3.34 9 5V7H8C6.9 7 6 7.9 6 9V21C6 22.1 6.9 23 8 23H16C17.1 23 18 22.1 18 21V9C18 7.9 17.1 7 16 7H15V5C15 3.34 13.66 2 12 2ZM12 4C12.55 4 13 4.45 13 5V7H11V5C11 4.45 11.45 4 12 4Z"/>
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* League Title */}
      <div className="text-center mb-2">
        <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-gray-800 uppercase">
          Obsidian League
        </h2>
        <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-gray-500 mt-1">
          Top 5 advance to the next league
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Clock size={18} className="text-[#ff9500]" />
          <span className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-[#ff9500]">
            6 days
          </span>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="flex flex-col gap-2">
        {leaderboard.map((user) => (
          <div
            key={user.rank}
            className={`flex items-center gap-4 p-4 rounded-[16px] transition-all ${
              user.rank === 1
                ? 'bg-[#ffd700]/20 border-[3px] border-[#ffd700]'
                : user.rank === 2
                ? 'bg-gray-100 border-[3px] border-gray-300'
                : 'bg-white border-[2px] border-gray-200'
            }`}
          >
            {/* Rank Badge */}
            <div
              className={`w-[32px] h-[32px] rounded-full flex items-center justify-center font-['Arimo:Bold',sans-serif] font-bold text-[16px] flex-shrink-0 ${
                user.rank === 1
                  ? 'bg-[#ffd700] text-white'
                  : user.rank === 2
                  ? 'bg-gray-400 text-white'
                  : user.rank === 3
                  ? 'bg-[#cd7f32] text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {user.rank}
            </div>

            {/* User Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-[48px] h-[48px] rounded-full flex items-center justify-center font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-white border-[3px] border-black"
                style={{ backgroundColor: user.color }}
              >
                {user.initial}
              </div>
              {/* Country Flag Badge */}
              <div className="absolute -top-1 -right-1 w-[22px] h-[22px] bg-white rounded-full flex items-center justify-center border-[2px] border-white shadow-md text-[12px]">
                {user.country}
              </div>
              {/* Online Status */}
              <div className="absolute -bottom-1 -right-1 w-[14px] h-[14px] bg-[#22c55e] rounded-full border-[2px] border-white" />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <p className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-gray-800">
                {user.name}
              </p>
              {user.streakYears && (
                <div className="flex items-center gap-1 mt-1">
                  <Flame size={14} className="text-[#ff9500]" fill="#ff9500" />
                  <span className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-[#ff9500]">
                    {user.streakYears}
                  </span>
                </div>
              )}
            </div>

            {/* XP */}
            <div className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-gray-600">
              {user.xp} XP
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
