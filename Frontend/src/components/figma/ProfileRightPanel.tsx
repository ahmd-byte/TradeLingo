import { useState } from 'react';
import { Flame, Shield, Gem, Heart } from 'lucide-react';
// FOR FUTURE: Add friends feature
// import { Search, Gift, ChevronRight } from 'lucide-react';

type Follower = {
  id: string;
  name: string;
  xp: number;
  initial: string;
  color: string;
};

export default function ProfileRightPanel() {
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');

  const following: Follower[] = [
    { id: '1', name: 'Olivia', xp: 20, initial: 'O', color: '#22c55e' },
  ];

  const followers: Follower[] = [
    { id: '1', name: 'User1', xp: 15, initial: 'U', color: '#3b82f6' },
    { id: '2', name: 'User2', xp: 30, initial: 'U', color: '#c084fc' },
  ];

  const stats = [
    { icon: Flame, value: 0, color: 'text-[#ff6b35]', bgColor: 'bg-[#ff6b35]/10' },
    { icon: Shield, value: 0, color: 'text-white/30', bgColor: 'bg-white/5' },
    { icon: Gem, value: 500, color: 'text-[#3b82f6]', bgColor: 'bg-[#3b82f6]/10' },
    { icon: Heart, value: 5, color: 'text-[#ef4444]', bgColor: 'bg-[#ef4444]/10' },
  ];

  // FOR FUTURE: Footer links
  // const footerLinks = [
  //   ['ABOUT', 'BLOG', 'STORE', 'EFFICACY', 'CAREERS'],
  //   ['INVESTORS', 'TERMS', 'PRIVACY'],
  // ];

  const currentFollowers = activeTab === 'following' ? following : followers;

  return (
    <div className="w-[380px] h-screen overflow-y-auto bg-[#0f172a] border-l-[3px] border-white/10 flex flex-col">
      {/* Stats Bar */}
      <div className="flex items-center justify-around p-4 border-b-[3px] border-white/10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`flex items-center gap-2 ${stat.bgColor} rounded-[12px] px-3 py-2`}
            >
              <Icon size={20} className={stat.color} fill={stat.color} />
              <span className={`font-['Arimo:Bold',sans-serif] font-bold text-[16px] ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex border-b-[3px] border-white/10">
        <button
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-4 font-['Arimo:Bold',sans-serif] font-bold text-[14px] uppercase transition-colors ${
            activeTab === 'following'
              ? 'text-[#3b82f6] border-b-[3px] border-[#3b82f6] -mb-[3px]'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          Following
        </button>
        <button
          onClick={() => setActiveTab('followers')}
          className={`flex-1 py-4 font-['Arimo:Bold',sans-serif] font-bold text-[14px] uppercase transition-colors ${
            activeTab === 'followers'
              ? 'text-[#3b82f6] border-b-[3px] border-[#3b82f6] -mb-[3px]'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          Followers
        </button>
      </div>

      {/* Followers List */}
      <div className="flex-1 p-4">
        <div className="flex flex-col gap-3 mb-6">
          {currentFollowers.map((user) => (
            <div
              key={user.id}
              className="bg-[#1e293b] rounded-[12px] border-[2px] border-white/10 p-3 flex items-center gap-3"
            >
              <div
                className="w-[48px] h-[48px] rounded-full flex items-center justify-center font-['Arimo:Bold',sans-serif] font-bold text-[20px] text-white border-[3px] border-black"
                style={{ backgroundColor: user.color }}
              >
                {user.initial}
              </div>
              <div className="flex-1">
                <p className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-white">
                  {user.name}
                </p>
                <p className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-white/40">
                  {user.xp} XP
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* FOR FUTURE: Add Friends Section */}
        {/* <div className="bg-[#1e293b] rounded-[16px] border-[3px] border-white/10 p-5 mb-6">
          <h3 className="font-['Arimo:Bold',sans-serif] font-bold text-[16px] text-white uppercase mb-4">
            Add friends
          </h3>

          <button className="w-full bg-white/5 hover:bg-white/10 rounded-[12px] border-[2px] border-white/10 p-4 flex items-center gap-3 mb-3 transition-colors">
            <div className="w-[40px] h-[40px] bg-white/10 rounded-full flex items-center justify-center">
              <Search size={20} className="text-white" />
            </div>
            <span className="flex-1 text-left font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white">
              Find friends
            </span>
            <ChevronRight size={20} className="text-white/40" />
          </button>

          <button className="w-full bg-white/5 hover:bg-white/10 rounded-[12px] border-[2px] border-white/10 p-4 flex items-center gap-3 transition-colors">
            <div className="w-[40px] h-[40px] bg-[#f3ff00] rounded-[8px] flex items-center justify-center">
              <Gift size={20} className="text-black" />
            </div>
            <span className="flex-1 text-left font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-white">
              Invite friends
            </span>
            <ChevronRight size={20} className="text-white/40" />
          </button>
        </div> */}

        {/* FOR FUTURE: Footer Links */}
        {/* <div className="space-y-3 pb-6">
          {footerLinks.map((linkGroup, groupIndex) => (
            <div key={groupIndex} className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
              {linkGroup.map((link, linkIndex) => (
                <button
                  key={linkIndex}
                  className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] text-white/30 hover:text-white/50 uppercase transition-colors"
                >
                  {link}
                </button>
              ))}
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}
