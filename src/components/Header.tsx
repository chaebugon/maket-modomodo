import React, { useState } from 'react';
import { MapPin, Bell, User, ChevronDown, Award } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  profile: UserProfile;
  onOpenMyPage: () => void;
  onOpenNotifications: () => void;
  notificationCount: number;
}

export default function Header({ profile, onOpenMyPage, onOpenNotifications, notificationCount }: HeaderProps) {
  const [showNeighborhoodSelector, setShowNeighborhoodSelector] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FCF9F5]/90 backdrop-blur-md border-b border-[#F5EFE6] px-4 py-3 flex items-center justify-between">
      {/* 대표 로케이션 토글러 */}
      <div className="relative">
        <button 
          onClick={() => setShowNeighborhoodSelector(!showNeighborhoodSelector)}
          className="flex items-center gap-1.5 focus:outline-none bg-white py-1.5 px-3 rounded-full border border-gray-100 shadow-xs transition-transform active:scale-95"
        >
          <div className="w-5 h-5 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
            <MapPin className="w-3 h-3 text-[#FF6B35]" />
          </div>
          <span className="text-xs font-bold text-gray-800">{profile.neighborhood}</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>

        {showNeighborhoodSelector && (
          <div className="absolute top-10 left-0 w-44 bg-white border border-gray-150 rounded-2xl shadow-lg p-1.5 z-50 text-xs text-gray-700 animate-in fade-in slide-in-from-top-2 duration-250">
            <div className="px-2.5 py-1.5 font-bold text-[10px] text-gray-400 uppercase tracking-wider">우리 동네 구역</div>
            <button className="flex items-center justify-between w-full text-left px-2.5 py-2 hover:bg-orange-50 rounded-xl font-bold text-[#FF6B35]">
              역삼2동 (대표설정)
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]"></span>
            </button>
            <button className="w-full text-left px-2.5 py-2 hover:bg-orange-50 rounded-xl hover:text-gray-900 transition-colors">
              역삼1동 (근거리)
            </button>
            <button className="w-full text-left px-2.5 py-2 hover:bg-orange-50 rounded-xl hover:text-gray-900 transition-colors">
              도곡동 (도보 10분)
            </button>
          </div>
        )}
      </div>

      {/* 브랜드 댕댕이 엠블럼 로고 */}
      <div className="flex items-center gap-1">
        <span className="font-space font-extrabold text-[#FF6B35] tracking-tight text-sm select-none">modomodo</span>
        <span className="w-1 h-1 rounded-full bg-[#4ECDC4]"></span>
      </div>

      {/* 우측 포인트 단축 버튼 및 노티/마이 프로필 */}
      <div className="flex items-center gap-2">
        {/* 포인트 뱃지 퀵 요약 */}
        <button 
          onClick={onOpenMyPage}
          className="hidden sm:flex items-center gap-1 bg-white border border-[#FF6B35]/20 hover:bg-orange-50/50 rounded-full px-3 py-1 text-xs transition-colors"
        >
          <Award className="w-3.5 h-3.5 text-[#FF6B35]" />
          <span className="font-semibold text-gray-600">모도포인트:</span>
          <span className="font-bold text-[#FF6B35]">{profile.points.toLocaleString()}P</span>
        </button>

        {/* 알림 종 */}
        <button 
          onClick={onOpenNotifications}
          className="relative p-2 rounded-full hover:bg-gray-100/80 text-gray-600 transition-colors active:scale-95"
        >
          <Bell className="w-4.5 h-4.5" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 border border-white text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
              {notificationCount}
            </span>
          )}
        </button>

        {/* 프로필 바로가기 */}
        <button 
          onClick={onOpenMyPage}
          className={`w-8 h-8 rounded-full ${profile.avatarColor} border-2 border-white shadow-xs text-white text-xs font-bold flex items-center justify-center transition-transform active:scale-95 hover:brightness-95`}
        >
          {profile.name.slice(0, 1)}
        </button>
      </div>
    </header>
  );
}
