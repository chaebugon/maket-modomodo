import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Store } from '../types';
import { MapPin, Navigation, ShoppingBag, Truck, Check } from 'lucide-react';

interface MapVisualizerProps {
  stores: Store[];
  onSelectStore: (storeId: string) => void;
  selectedStoreId?: string;
}

export default function MapVisualizer({ stores, onSelectStore, selectedStoreId }: MapVisualizerProps) {
  const [showRoute, setShowRoute] = useState(false);
  const [activePin, setActivePin] = useState<string | null>(selectedStoreId || null);

  // 가상의 지도 가공 좌표계 적용 (SVG 상의 X, Y 좌표 매핑)
  const mapCenter = { lat: 37.4938, lng: 127.037 };
  
  const getCoords = (lat: number, lng: number) => {
    // 위경도를 SVG 500x350 캔버스 내부 좌표로 비례 변환
    const latDiff = lat - mapCenter.lat;
    const lngDiff = lng - mapCenter.lng;
    
    // 강남역삼 일대 기준 스케일 증폭
    const x = 250 + (lngDiff * 8000); 
    const y = 175 - (latDiff * 11000); // 위도는 커질수록 위로 가야 하므로 마이너스
    return { x: Math.max(30, Math.min(x, 470)), y: Math.max(30, Math.min(y, 320)) };
  };

  const userPos = getCoords(37.4939, 127.0362); // 가상 사용자 위치 (동네 중심)

  const handlePinClick = (storeId: string) => {
    setActivePin(storeId);
    onSelectStore(storeId);
  };

  return (
    <div className="relative bg-[#F3EFE9] border-2 border-[#E9E1D5] rounded-3xl p-4 overflow-hidden h-[280px] w-full shadow-inner">
      {/* 맵 헤더 뱃지 */}
      <div className="absolute top-3 left-3 z-10 flex gap-1.5">
        <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white text-[#FF6B35] rounded-full border border-[#FF6B35]/20 shadow-xs">
          <MapPin className="w-3 h-3 text-[#FF6B35] fill-[#FF6B35]/20 animate-bounce" />
          실시간 역삼2동 골목 보물 지도
        </span>
        
        <button 
          onClick={() => setShowRoute(!showRoute)}
          className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-all shadow-xs ${
            showRoute 
              ? 'bg-[#4ECDC4] text-white border-[#4ECDC4]/20' 
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Truck className="w-3 h-3" />
          {showRoute ? '배송 경로 최적화 ON' : '묶음배송 연계 경로 보기'}
        </button>
      </div>

      {/* 실시간 라이브 연동 표시 */}
      <div className="absolute top-3 right-3 z-10">
        <span className="flex items-center gap-1.5 px-2 py-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200/50 font-medium rounded-full">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          실시간 동기화 중
        </span>
      </div>

      {/* SVG 기반 동네 수제지도 그래픽 */}
      <svg className="w-full h-full text-gray-300" viewBox="0 0 500 350">
        <defs>
          <radialGradient id="userGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4ECDC4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#4ECDC4" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. 동네 오프화이트 그리드 및 길 레이아웃 */}
        <rect width="100%" height="100%" fill="#F1ECE5" />
        
        {/* 공원 녹지 묘사 */}
        <rect x="20" y="20" width="100" height="90" rx="15" fill="#E2ECE6" />
        <text x="35" y="65" className="text-[10px] font-medium fill-[#6E8F7A] tracking-wider font-sans select-none">도곡근린공원</text>
        <circle cx="50" cy="85" r="4" fill="#9FC5AC" />
        <circle cx="65" cy="88" r="5" fill="#9FC5AC" />
        <circle cx="80" cy="82" r="3.5" fill="#9FC5AC" />

        <rect x="360" y="230" width="120" height="100" rx="15" fill="#E2ECE6" />
        <text x="390" y="275" className="text-[10px] font-medium fill-[#6E8F7A] tracking-wider font-sans select-none">역삼 어린이공원</text>

        {/* 도로 라인 (Slick Road Grid) */}
        {/* 테헤란로 일대 */}
        <line x1="10" y1="130" x2="490" y2="130" stroke="#E5DDD2" strokeWidth="24" strokeLinecap="round" />
        <line x1="10" y1="130" x2="490" y2="130" stroke="#FFF" strokeWidth="12" strokeLinecap="round" strokeDasharray="6 4" />
        
        {/* 역삼로 일대 */}
        <line x1="10" y1="240" x2="490" y2="240" stroke="#E5DDD2" strokeWidth="20" strokeLinecap="round" />
        <line x1="10" y1="240" x2="490" y2="240" stroke="#FFF" strokeWidth="10" strokeLinecap="round" />

        {/* 대각선 작은 골목길 */}
        <line x1="120" y1="10" x2="120" y2="340" stroke="#E5DDD2" strokeWidth="16" strokeLinecap="round" strokeDasharray="none" />
        <line x1="120" y1="10" x2="120" y2="340" stroke="#FFF" strokeWidth="8" strokeLinecap="round" />

        <line x1="320" y1="10" x2="320" y2="340" stroke="#E5DDD2" strokeWidth="16" strokeLinecap="round" />
        <line x1="320" y1="10" x2="330" y2="340" stroke="#FFF" strokeWidth="8" strokeLinecap="round" />

        {/* 이웃 아파트 단지 표시 */}
        <g className="opacity-40">
          <rect x="150" y="40" width="60" height="40" rx="5" fill="#DCD3C7" />
          <text x="157" y="63" className="text-[8px] font-bold fill-[#8C8173] font-sans">역삼아이파크</text>
          
          <rect x="180" y="280" width="70" height="40" rx="5" fill="#DCD3C7" />
          <text x="195" y="303" className="text-[8px] font-bold fill-[#8C8173] font-sans">역삼래미안</text>
        </g>

        {/* 2. 묶음배송 기회 연계 최적화 루트 데모 점선선 */}
        {showRoute && (
          <g>
            {/* 유저 위치와 상점들 중 묶음배송 신청 가능한 상점들간 매치 라인 */}
            <path
              d={`M ${userPos.x} ${userPos.y} 
                  Q 180 200, ${getCoords(stores[0].coordinates.lat, stores[0].coordinates.lng).x} ${getCoords(stores[0].coordinates.lat, stores[0].coordinates.lng).y}
                  T ${getCoords(stores[1].coordinates.lat, stores[1].coordinates.lng).x} ${getCoords(stores[1].coordinates.lat, stores[1].coordinates.lng).y}
                  T ${getCoords(stores[4].coordinates.lat, stores[4].coordinates.lng).x} ${getCoords(stores[4].coordinates.lat, stores[4].coordinates.lng).y}`}
              fill="none"
              stroke="#4ECDC4"
              strokeWidth="4"
              strokeDasharray="8,6"
              strokeLinecap="round"
              className="animate-pulse"
            />
            {/* 배달 경로 트럭 아이콘 애니메이션 플레이서 */}
            <circle cx={userPos.x} cy={userPos.y} r="18" fill="#4ECDC4" fillOpacity="0.2" />
          </g>
        )}

        {/* 3. 내 현재 위치 심볼 (HTML5 Geolocation 상상) */}
        <g>
          <circle cx={userPos.x} cy={userPos.y} r="28" fill="url(#userGlow)" />
          <circle cx={userPos.x} cy={userPos.y} r="8" fill="#FFF" shadow-sm="true" />
          <circle cx={userPos.x} cy={userPos.y} r="5" fill="#4ECDC4" />
          <text x={userPos.x - 22} y={userPos.y - 12} className="text-[9px] font-bold fill-[#3FA39B] font-sans tracking-tight">지키고 있는 나 🏠</text>
        </g>

        {/* 4. 상점들의 실시간 위치 핀 및 팝업 */}
        {stores.map((store) => {
          const { x, y } = getCoords(store.coordinates.lat, store.coordinates.lng);
          const isActive = activePin === store.id;
          
          const iconColor = store.category === 'bakery' ? '#FF6B35' : 
                            store.category === 'grocery' ? '#10B981' :
                            store.category === 'flower' ? '#EC4899' :
                            store.category === 'eco' ? '#0F766E' : '#3B82F6';

          return (
            <g key={store.id} className="cursor-pointer" onClick={() => handlePinClick(store.id)}>
              {/* 물결 링 애니메이션 */}
              {isActive && (
                <circle cx={x} cy={y} r="16" fill="none" stroke={iconColor} strokeWidth="1.5">
                  <animate attributeName="r" values="8;20" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              
              {/* 실 고리 핀 그래픽 */}
              <circle cx={x} cy={y + 5} r="4" fill="rgba(0,0,0,0.15)" />
              <path 
                d={`M${x - 8} ${y - 12} C${x - 8} ${y - 20} ${x + 8} ${y - 20} ${x + 8} ${y - 12} C${x + 8} ${y - 4} ${x} ${y} ${x} ${y} C${x} ${y} ${x - 8} ${y - 4} ${x - 8} ${y - 12} Z`}
                fill={iconColor}
                stroke="#FFF"
                strokeWidth="1.2"
              />
              <circle cx={x} cy={y - 12} r="3" fill="#FFF" />
              
              {/* 상점 이름 조그만 명판 */}
              <rect 
                x={x - 35} 
                y={y - 34} 
                width="70" 
                height="13" 
                rx="4" 
                fill={isActive ? iconColor : '#FFF'} 
                stroke={isActive ? '#FFF' : '#E9E1D5'} 
                strokeWidth="1"
                className="transition-colors duration-200"
              />
              <text 
                x={x} 
                y={y - 25} 
                className={`text-[7.5px] font-bold font-sans text-center middle justify-center tracking-tighter transition-colors duration-200`}
                textAnchor="middle"
                fill={isActive ? '#FFF' : '#4A4035'}
              >
                {store.name.slice(0, 6)}..
              </text>
            </g>
          );
        })}
      </svg>

      {/* 핀 터치 시 아래에 흐르는 플로팅 꼬마 상점 정보 오버레이 */}
      <AnimatePresence>
        {activePin && (() => {
          const store = stores.find(s => s.id === activePin);
          if (!store) return null;
          return (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-xs rounded-2xl p-2.5 border border-[#E9E1D5] shadow-md flex items-center justify-between z-20"
            >
              <div className="flex items-center gap-2">
                <img 
                  src={store.image} 
                  alt={store.name} 
                  className="w-10 h-10 object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">{store.name}</h4>
                  <p className="text-[10px] text-gray-500 flex items-center gap-0.5 mt-0.5">
                    <span className="text-[#FF6B35] font-semibold">★ {store.rating}</span>
                    <span className="text-gray-300">|</span>
                    <span>도보 {Math.round(store.distance * 15)}분 ({store.distance}km)</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onSelectStore(store.id)}
                className="px-3 py-1.5 text-[11px] font-bold bg-[#FF6B35] hover:bg-[#E0531F] text-white rounded-xl flex items-center gap-0.5 transition-colors"
              >
                상점 입장
                <ShoppingBag className="w-3 h-3" />
              </button>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
