import React from 'react';
import { motion } from 'motion/react';
import { Home, Search, MessageSquare, Sparkles, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'search' | 'guide' | 'community' | 'mypage';
  onSwitchTab: (tab: 'home' | 'search' | 'guide' | 'community' | 'mypage') => void;
  notificationCount: number;
}

export default function BottomNav({ activeTab, onSwitchTab, notificationCount }: BottomNavProps) {
  const tabs = [
    { id: 'home' as const, name: '골목홈', icon: Home },
    { id: 'search' as const, name: '보물찾기', icon: Search },
    { id: 'guide' as const, name: 'AI모도', icon: Sparkles, isAi: true },
    { id: 'community' as const, name: '사랑방', icon: MessageSquare, hasBadge: true },
    { id: 'mypage' as const, name: '마이모도', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F5EFE6] px-2 py-1 flex justify-around items-center max-w-7xl mx-auto border-x shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onSwitchTab(tab.id)}
            className="flex flex-col items-center justify-center flex-1 py-1.5 focus:outline-none transition-colors relative group cursor-pointer"
          >
            <div className="relative">
              {/* 바운싱 터치 쉐입 */}
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={`p-1 rounded-xl transition-colors ${
                  isActive 
                    ? tab.isAi
                      ? 'bg-gradient-to-br from-[#FF6B35] to-[#4ECDC4] text-white shadow-xs'
                      : 'text-[#FF6B35]' 
                    : 'text-gray-400 group-hover:text-gray-600'
                }`}
              >
                <Icon className={`w-5.5 h-5.5 ${isActive && tab.isAi ? 'animate-pulse' : ''}`} />
              </motion.div>

              {/* 동네 사랑방용 배지 표시 */}
              {tab.hasBadge && notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </div>

            {/* 정밀 서브 타이틀 */}
            <span className={`text-[9.5px] mt-0.5 leading-none transition-all ${
              isActive 
                ? 'font-extrabold text-[#FF6B35]' 
                : 'font-medium text-gray-400'
            }`}>
              {tab.name}
            </span>

            {/* 활성 지시점 */}
            {isActive && !tab.isAi && (
              <motion.span 
                layoutId="activeDot"
                className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-[#FF6B35]"
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
