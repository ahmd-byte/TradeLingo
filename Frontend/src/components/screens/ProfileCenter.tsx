import { Flame, Shield, Trophy, Zap, Edit2, X, Palette } from 'lucide-react';
import { useState, useEffect } from 'react';

type FriendSuggestion = {
  id: string;
  name: string;
  initial: string;
  color: string;
  followedBy: string;
};

const DEFAULT_COLOR = '#3bd6ff';
const PRESET_COLORS = [
  { color: '#f570dc', name: 'Pink' },
  { color: '#3bd6ff', name: 'Cyan' },
  { color: '#ff3131', name: 'Red' },
  { color: '#ffb2b2', name: 'Rose' },
  { color: '#5da38e', name: 'Teal' },
  { color: '#1e1b4b', name: 'Starry Night' },
];

export default function ProfileCenter({ onLogout }: { onLogout: () => void }) {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [buttonFlash, setButtonFlash] = useState(false);

  const friendSuggestions: FriendSuggestion[] = [
    { id: '1', name: 'LOLA', initial: 'L', color: '#fb923c', followedBy: 'Follows you' },
    { id: '2', name: 'Miguel', initial: 'M', color: '#c084fc', followedBy: 'Followed by Olivia' },
    { id: '3', name: 'Divyanshi', initial: 'D', color: '#3b82f6', followedBy: 'Followed by Olivia' },
  ];

  useEffect(() => {
    const currentColor = localStorage.getItem('profileColor');
    if (currentColor) {
      setSelectedColor(currentColor);
    }
  }, []);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    localStorage.setItem('profileColor', color);
    document.documentElement.style.setProperty('--bg-primary', color);
    setIsColorPickerOpen(false);
    
    // Trigger flash effect
    setButtonFlash(true);
    setTimeout(() => setButtonFlash(false), 400);
  };

  const handlePresetColorChange = (color: string) => {
    setSelectedColor(color);
    localStorage.setItem('profileColor', color);
    document.documentElement.style.setProperty('--bg-primary', color);
  };

  const handleResetToDefault = () => {
    setSelectedColor(DEFAULT_COLOR);
    localStorage.setItem('profileColor', DEFAULT_COLOR);
    document.documentElement.style.setProperty('--bg-primary', DEFAULT_COLOR);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#0f172a] p-8">
      <div className="max-w-[500px]">
        {/* Profile Card */}
        <div className="bg-[#1e293b] rounded-[24px] border-[3px] border-white/10 p-8 mb-6">
          {/* Profile Picture */}
          <div className="relative w-[200px] h-[200px] mx-auto mb-6">
            <div className="w-full h-full bg-[#3b82f6]/20 rounded-full border-[4px] border-dashed border-[#3b82f6] flex items-center justify-center">
              <div className="text-[80px]">👤</div>
            </div>
            <button className="absolute top-2 right-2 w-[40px] h-[40px] bg-white rounded-full border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] active:shadow-[1px_1px_0px_#000000] transition-all">
              <Edit2 size={18} className="text-black" />
            </button>
          </div>

          {/* Name and Username */}
          <h1 className="font-['Arimo:Bold',sans-serif] font-bold text-[32px] text-white mb-1">
            Saarvind Raj
          </h1>
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-white/50 mb-2">
            @SaarvindRa
          </p>
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white/40 mb-4">
            Joined June 2022
          </p>

          {/* Following/Followers */}
          <div className="flex items-center gap-4 mb-4">
            <button className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-[#3b82f6] hover:underline">
              1 Following
            </button>
            <button className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-[#3b82f6] hover:underline">
              2 Followers
            </button>
          </div>

          {/* Edit Profile Button */}
          <button className="bg-[var(--bg-primary)] border-[3px] border-black rounded-[12px] px-6 py-2 shadow-[5px_5px_0px_#000000] hover:shadow-[3px_3px_0px_#000000] active:shadow-[1px_1px_0px_#000000] transition-all">
            <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white uppercase">
              Edit Profile
            </span>
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-6">
          <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[24px] text-white uppercase mb-4">
            Statistics
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Day Streak */}
            <div className="bg-[#1e293b] rounded-[16px] border-[3px] border-white/10 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Flame size={20} className="text-white/30" />
                <span className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-white/30">
                  0
                </span>
              </div>
              <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-white/40 uppercase">
                Day streak
              </p>
            </div>

            {/* Total XP */}
            <div className="bg-[#1e293b] rounded-[16px] border-[3px] border-white/10 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={20} className="text-[#fbbf24]" fill="#fbbf24" />
                <span className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-white">
                  73
                </span>
              </div>
              <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-white/40 uppercase">
                Total XP
              </p>
            </div>

            {/* Current League */}
            <div className="bg-[#1e293b] rounded-[16px] border-[3px] border-white/10 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={20} className="text-white/30" />
                <span className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-white/30 uppercase">
                  None
                </span>
              </div>
              <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-white/40 uppercase">
                Current League
              </p>
            </div>

            {/* Top 3 Finishes */}
            <div className="bg-[#1e293b] rounded-[16px] border-[3px] border-white/10 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={20} className="text-white/30" />
                <span className="font-['Arimo:Bold',sans-serif] font-bold text-[28px] text-white/30">
                  0
                </span>
              </div>
              <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-white/40 uppercase">
                Top 3 finishes
              </p>
            </div>
          </div>
        </div>

        {/* Color Customization */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[24px] text-white uppercase">
              App Theme Color
            </h2>
            <button
              onClick={handleResetToDefault}
              className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-[#f3ff00] uppercase hover:underline"
            >
              Reset to Default
            </button>
          </div>
          <div className="bg-[#1e293b] rounded-[24px] border-[3px] border-white/10 p-6">
            {/* Current Color Display */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-[80px] h-[80px] rounded-[16px] border-[4px] border-black shadow-[4px_4px_0px_#000000] transition-all"
                style={{ backgroundColor: selectedColor }}
              />
              <div>
                <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white/60 uppercase mb-1">
                  Current Color
                </p>
                <p className="font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-white uppercase">
                  {selectedColor}
                </p>
                {selectedColor === DEFAULT_COLOR && (
                  <p className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-[#22c55e] uppercase">
                    Default
                  </p>
                )}
              </div>
            </div>

            {/* Preset Colors */}
            <div className="mb-4">
              <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white/60 uppercase mb-3">
                Preset Colors
              </p>
              <div className="grid grid-cols-3 gap-3">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => handlePresetColorChange(preset.color)}
                    className={`relative group rounded-[12px] border-[3px] p-3 transition-all hover:scale-105 ${
                      selectedColor === preset.color
                        ? 'border-[#f3ff00] shadow-[4px_4px_0px_#f3ff00]'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div
                      className="w-full h-[60px] rounded-[8px] border-[3px] border-black mb-2"
                      style={{ backgroundColor: preset.color }}
                    />
                    <p className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-white text-center uppercase">
                      {preset.name}
                    </p>
                    {selectedColor === preset.color && (
                      <div className="absolute -top-2 -right-2 w-[24px] h-[24px] bg-[#f3ff00] rounded-full border-[2px] border-black flex items-center justify-center">
                        <span className="text-[14px]">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Picker */}
            <div className="mt-6 pt-6 border-t-[2px] border-white/10">
              <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white/60 uppercase mb-3">
                Custom Color
              </p>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-[60px] h-[60px] rounded-[12px] border-[3px] border-black cursor-pointer"
                    style={{ backgroundColor: selectedColor }}
                  />
                </div>
                <button
                  onClick={() => handleColorChange(selectedColor)}
                  className="flex-1 border-[3px] border-black rounded-[12px] px-6 py-3 shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] active:shadow-[1px_1px_0px_#000000] transition-all"
                  style={{ 
                    backgroundColor: buttonFlash ? selectedColor : '#ffffff',
                    transition: 'background-color 0.4s ease'
                  }}
                >
                  <span 
                    className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] uppercase"
                    style={{ 
                      color: buttonFlash ? '#ffffff' : '#000000',
                      transition: 'color 0.4s ease'
                    }}
                  >
                    Apply
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Friend Suggestions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[24px] text-white uppercase">
              Friend suggestions
            </h2>
            <button className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-[#3b82f6] uppercase hover:underline">
              View All
            </button>
          </div>
          <div className="flex gap-4">
            {friendSuggestions.map((friend) => (
              <div
                key={friend.id}
                className="bg-[#1e293b] rounded-[16px] border-[3px] border-white/10 p-5 flex-1 relative"
              >
                <button className="absolute top-3 right-3 text-white/30 hover:text-white/60">
                  <X size={16} />
                </button>
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-[60px] h-[60px] rounded-full flex items-center justify-center font-['Arimo:Bold',sans-serif] font-bold text-[24px] text-white border-[3px] border-black"
                    style={{ backgroundColor: friend.color }}
                  >
                    {friend.initial}
                  </div>
                  <div className="text-center">
                    <p className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-white uppercase mb-1">
                      {friend.name}
                    </p>
                    <p className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] text-white/40">
                      {friend.followedBy}
                    </p>
                  </div>
                  <button className="w-full bg-[#3b82f6] rounded-[8px] py-2 border-[2px] border-black hover:bg-[#2563eb] transition-colors">
                    <span className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-white uppercase">
                      Follow
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="mb-6">
          <button
            onClick={onLogout}
            className="w-full bg-white border-[5px] border-black rounded-[16px] px-8 py-4 shadow-[8px_8px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] active:shadow-[1px_1px_0px_#000000] transition-all"
          >
            <span className="font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-black uppercase tracking-wide">
              Log Out
            </span>
          </button>
        </div>

        {/* FOR FUTURE: Achievements */}
        {/* <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Arimo:Bold',sans-serif] font-bold text-[24px] text-white uppercase">
              Achievements
            </h2>
            <button className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-[#3b82f6] uppercase hover:underline">
              View All
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-[#1e293b] rounded-[16px] border-[3px] border-white/10 p-5 flex items-center gap-4"
              >
                <div
                  className="w-[70px] h-[70px] rounded-[16px] flex items-center justify-center text-[36px] border-[3px] border-black relative flex-shrink-0"
                  style={{ backgroundColor: achievement.color }}
                >
                  {achievement.icon}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#c084fc] rounded-[6px] px-2 py-0.5 border-[2px] border-black">
                    <span className="font-['Arimo:Bold',sans-serif] font-bold text-[10px] text-white uppercase">
                      Level {achievement.level}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[18px] text-white">
                      {achievement.title}
                    </h3>
                    <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white/50">
                      {achievement.progress}/{achievement.total}
                    </span>
                  </div>

                  <div className="bg-white/10 rounded-full h-[10px] mb-2 overflow-hidden">
                    <div
                      className="bg-[#fbbf24] h-full rounded-full transition-all"
                      style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                    />
                  </div>

                  <p className="font-['Arimo:Bold',sans-serif] font-bold text-[13px] text-white/60">
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
}