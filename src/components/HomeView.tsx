import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Store, UserProfile } from '../types';
import { 
  Award, 
  MapPin, 
  Search, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Flame,
  Star,
  Users
} from 'lucide-react';
import MapVisualizer from './MapVisualizer';

interface HomeViewProps {
  profile: UserProfile;
  stores: Store[];
  bannerImage: string;
  onSelectStore: (storeId: string) => void;
  onSwitchTab: (tab: 'home' | 'search' | 'guide' | 'community' | 'mypage') => void;
  onSetCategoryFilter: (category: string) => void;
}

export default function HomeView({ 
  profile, 
  stores, 
  bannerImage, 
  onSelectStore, 
  onSwitchTab, 
  onSetCategoryFilter 
}: HomeViewProps) {
  const storeListRef = useRef<HTMLDivElement>(null);

  // 우리동네 소속 가상 레벨 계산
  const donorLevel = profile.points > 30000 ? "동네 VIP 수호자 👑" : "동네 다정한 이웃 🌱";

  const categories = [
    { id: 'all', name: '전체 소식', icon: '✨', categoryName: 'all' },
    { id: 'bakery', name: '골목 빵집', icon: '🍞', categoryName: 'bakery' },
    { id: 'grocery', name: '싱싱 청과', icon: '🍓', categoryName: 'grocery' },
    { id: 'cafe', name: '커피 브런치', icon: '☕', categoryName: 'cafe' },
    { id: 'flower', name: '꽃과 화분', icon: '💐', categoryName: 'flower' },
    { id: 'eco', name: '친환경 가치', icon: '🌿', categoryName: 'eco' },
  ];

  // CTA 스크롤 오케스트레이션
  const handleCtaClick = () => {
    if (storeListRef.current) {
      storeListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCategoryClick = (category: string) => {
    onSetCategoryFilter(category);
    onSwitchTab('search');
  };

  // 실시간 핫딜(재고 소진 임박 상품 추출)
  const getSimulatedHotDeals = () => {
    const deals: { store: Store; prod: any }[] = [];
    stores.forEach(store => {
      if (store.products) {
        store.products.forEach(prod => {
          if (prod.stock > 0 && prod.stock <= 5) { // 재고가 1~5개 남은 것
            deals.push({ store, prod });
          }
        });
      }
    });
    return deals.slice(0, 3); // top 3
  };

  const hotDeals = getSimulatedHotDeals();

  return (
    <div className="space-y-6 pb-20 font-sans">
      
      {/* 1. 상단 모도포인트 요약 카드 */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#FF6B35] to-[#E0531F] rounded-3xl p-5 text-white shadow-md relative overflow-hidden"
      >
        {/* 장식용 화려한 써클 물결 */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-white/10" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <Award className="w-5 h-5 text-amber-300 fill-amber-300/20" />
            <span className="text-[11px] font-bold tracking-wider text-orange-100 uppercase">통합 포인트 엔진</span>
          </div>
          <span className="text-[10px] bg-white/20 select-none px-2.5 py-1 rounded-full font-extrabold border border-white/10">
            {donorLevel}
          </span>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-[11px] text-orange-100 font-medium">쓸수록 동네가 풍성해져요!</p>
            <h2 className="text-2xl mt-0.5 font-extrabold tracking-tight font-space">
              {profile.points.toLocaleString()} <span className="text-sm font-bold">P</span>
            </h2>
          </div>

          <button 
            onClick={() => onSwitchTab('mypage')}
            className="px-4 py-2 bg-white text-[#FF6B35] font-extrabold text-[11px] rounded-xl shadow-xs transition-transform active:scale-95 hover:bg-orange-50"
          >
            포인트 충전/내역
          </button>
        </div>

        {/* 포인트 기여 정보바 */}
        <div className="mt-4 pt-3.5 border-t border-white/10 flex justify-between items-center text-[10px] text-orange-100">
          <span className="flex items-center gap-1 font-semibold">
            <Users className="w-3.5 h-3.5" />
            내 예약 이웃 참여 공구: 2건 진행 중 
          </span>
          <span className="font-bold underline cursor-pointer" onClick={() => onSwitchTab('mypage')}>바코드 보기 &gt;</span>
        </div>
      </motion.div>

      {/* 2. 16:9 3D 일러스트 홈 메인 배너 */}
      <div className="relative rounded-3xl overflow-hidden h-[180px] shadow-xs border border-gray-150">
        <img 
          src={bannerImage} 
          alt="모도모도 따스한 골목 풍경" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent flex flex-col justify-center p-6 text-white" />
        
        <div className="absolute inset-0 flex flex-col justify-center p-6 text-white">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#4ECDC4] text-white font-extrabold text-[9px] rounded-full w-fit shadow-xs mb-2">
            <Sparkles className="w-3 h-3 text-white fill-white/20" />
            우리 동네 로컬 통합 플랫폼
          </span>
          <h1 className="text-lg font-extrabold leading-tight tracking-tight">
            우리동네 숨은 보물 찾기,<br />
            마켓 모도모도!
          </h1>
          <p className="text-[10px] text-gray-200 mt-1 font-medium">동네 100m 앞 단골을 실시간으로 편하게 만나세요.</p>
        </div>
      </div>

      {/* 3. 귀여운 카테고리 퀵 링크 */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-gray-500 tracking-wider">가게 분류별 찾아보기</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.categoryName)}
              className="flex flex-col items-center justify-center p-3.5 bg-white border border-gray-100 hover:border-[#FF6B35]/30 rounded-2xl transition-all hover:bg-orange-50/20 active:scale-95 text-center group cursor-pointer shadow-3xs"
            >
              <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-[10.5px] font-bold text-gray-700 leading-none">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. 실시간 보물 위치 지도 연동 */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-gray-500 tracking-wider">우리 동네 실시간 혼잡도 및 위치</h3>
          <span className="text-[10px] text-gray-400 font-bold flex items-center gap-0.5">
            전체 상점 {stores.length}곳 활성화
          </span>
        </div>
        <MapVisualizer stores={stores} onSelectStore={onSelectStore} />
      </div>

      {/* 5. 실시간 재고 부족 임박! 보물 핫딜 시뮬레이터 (진짜 실시간 연동) */}
      {hotDeals.length > 0 && (
        <div className="space-y-3 bg-[#FCF9F5] border border-red-100 p-4 rounded-3xl">
          <div className="flex justify-between items-center">
            <h4 className="text-[11px] font-extrabold text-[#FF6B35] tracking-wider uppercase flex items-center gap-1">
              <Flame className="w-4 h-4 text-[#FF6B35] animate-pulse" />
              실시간 예약 폭주! 재고 부족 임박 상품 🔥
            </h4>
            <span className="text-[8px] bg-red-100 text-red-600 font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Real-time</span>
          </div>
          
          <div className="space-y-2">
            {hotDeals.map(({ store, prod }) => (
              <div 
                key={prod.id}
                onClick={() => onSelectStore(store.id)}
                className="flex items-center justify-between p-2.5 bg-white rounded-2xl border border-gray-150 hover:border-[#FF6B35]/50 transition-colors shadow-3xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="w-12 h-12 object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -top-1.5 -left-1.5 px-1 py-0.5 bg-red-500 text-white font-black text-[7.5px] rounded-md tracking-tighter">
                      HOT {prod.stock}개 남음!
                    </span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-800 leading-tight">{prod.name}</h5>
                    <p className="text-[9px] text-[#FF6B35] font-semibold mt-0.5">{store.name}</p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-[12px] font-extrabold text-gray-950 font-mono">{prod.price.toLocaleString()}원</p>
                    <p className="text-[8px] text-gray-400">통합 {Math.floor(prod.price * 0.05)}P 적립</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. 우리 동네 추천 이달의 상점 리스트 (Scroll Reveal 스러운 우아한 진입) */}
      <div ref={storeListRef} className="space-y-3.5 pt-2">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase">사랑받는 우리 동네 베스트 상점</h3>
            <h2 className="text-base font-extrabold text-gray-800 mt-1">우리동네 소상공인 목록</h2>
          </div>
          
          <button 
            onClick={() => onSwitchTab('search')}
            className="text-[11px] font-bold text-[#FF6B35] flex items-center gap-0.5 group"
          >
            전체 매장 보기
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="space-y-4">
          {stores.map((store, index) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              onClick={() => onSelectStore(store.id)}
              className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col sm:flex-row"
            >
              {/* 상점 섬네일 이미지 */}
              <div className="relative w-full sm:w-48 h-36 flex-shrink-0">
                <img 
                  src={store.image} 
                  alt={store.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 px-2 py-1 bg-white/95 text-gray-800 font-extrabold text-[9.5px] rounded-lg shadow-sm border border-gray-100 flex items-center gap-0.5">
                  도보 {Math.round(store.distance * 15)}분
                </span>

                {store.category === 'bakery' && (
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-[#FF6B35] text-white font-extrabold text-[9px] rounded-md shadow-sm">
                    갓구운 빵 🍞
                  </span>
                )}
                {store.category === 'grocery' && (
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-emerald-500 text-white font-extrabold text-[9px] rounded-md shadow-sm">
                    싱싱 산지직송 🍓
                  </span>
                )}
                {store.category === 'flower' && (
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-pink-500 text-white font-extrabold text-[9px] rounded-md shadow-sm">
                    이슬가득 로즈 💐
                  </span>
                )}
                {store.category === 'eco' && (
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-teal-600 text-white font-extrabold text-[9px] rounded-md shadow-sm">
                    지구 수호 🌿
                  </span>
                )}
                {store.category === 'cafe' && (
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-blue-500 text-white font-extrabold text-[9px] rounded-md shadow-sm">
                    아늑한 브런치 ☕
                  </span>
                )}
              </div>

              {/* 상점 정보 세부 텍스트 */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-bold text-gray-900 leading-tight hover:text-[#FF6B35] transition-colors">{store.name}</h4>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-gray-800">{store.rating}</span>
                      <span className="text-[10px] text-gray-400 font-medium">({store.reviewsCount})</span>
                    </div>
                  </div>

                  <p className="text-[10.5px] text-gray-500 mt-1 line-clamp-2 md:line-clamp-3 leading-relaxed">
                    {store.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {store.tags.map((tag, tIdx) => (
                      <span 
                        key={tIdx} 
                        className="px-2 py-0.5 text-[9px] font-bold bg-[#FCF9F5] text-gray-600 rounded-md border border-gray-150"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                  <span className="flex items-center gap-1.5 leading-none">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {store.address}
                  </span>
                  
                  <span className="flex items-center gap-1 leading-none text-[#FF6B35] font-extrabold">
                    입고상품 {store.products?.length || 0}개 등록됨
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 7. 브랜드 보강 마스코트 위젯 (펄스 애니메이션 탑재) */}
      <div className="bg-[#FCF9F5] rounded-3xl p-5 border-2 border-dashed border-[#F5EFE6] flex items-center justify-between shadow-2xs">
        <div className="space-y-1.5 max-w-[65%]">
          <span className="inline-block px-2 py-0.5 text-[8px] bg-[#4ECDC4] text-white font-extrabold rounded-md shadow-3xs uppercase tracking-wider">
            Modomodo Guide
          </span>
          <h4 className="text-xs font-extrabold text-gray-850">
            "지도를 한 바퀴 도는 것조차 아끼는 묶음배송 요정, 저 '모도'에게 물어보세요!🐾"
          </h4>
          <p className="text-[10px] text-gray-500">
            대답 한번에 골목 상점들의 입고 정보와 소금빵 나오는 시간을 속 시원히 알려드릴게요🐶.
          </p>
          <button 
            onClick={() => onSwitchTab('guide')}
            className="mt-1 px-3.5 py-1.5 text-[10px] font-extrabold bg-[#FF6B35] text-white rounded-lg flex items-center gap-1 animate-soft-pulse shrink-0 tracking-tight cursor-pointer shadow-xs shadow-[#FF6B35]/20"
          >
            모도 가이드 챗봇 바로가기
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="w-20 h-20 rounded-full border-2 border-white overflow-hidden bg-white shadow-xs p-1">
          <img 
            src={profile.avatarColor.includes('orange') ? '/src/assets/images/modomodo_mascot_1779251775737.png' : '/src/assets/images/modomodo_mascot_1779251775737.png'} 
            alt="Mascot" 
            className="w-full h-full object-contain animate-delicate-float"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* 핵심 플로팅 CTA 버튼 */}
      <div className="fixed bottom-18 left-1/2 -translate-x-1/2 z-30 w-[240px]">
        <button
          onClick={handleCtaClick}
          className="w-full py-3 px-4 bg-[#FF6B35] hover:bg-[#E0531F] text-white font-extrabold text-[12px] tracking-tight rounded-full shadow-lg flex items-center justify-center gap-2 border-2 border-white transition-all active:scale-95 animate-glow-pulse cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 fill-white/20 text-white animate-spin" />
          우리 동네 숨은 보물 찾기, 지금 시작하기
        </button>
      </div>

    </div>
  );
}
