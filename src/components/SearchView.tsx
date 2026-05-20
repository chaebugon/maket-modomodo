import React, { useState, useMemo } from 'react';
import { Store } from '../types';
import { Search, MapPin, Star, Sparkles, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface SearchViewProps {
  stores: Store[];
  onSelectStore: (storeId: string) => void;
  initialFilter?: string;
}

export default function SearchView({ stores, onSelectStore, initialFilter = 'all' }: SearchViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilter);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'reviews'>('distance');

  const categories = [
    { id: 'all', name: '전체', icon: '✨' },
    { id: 'bakery', name: '골목 빵집', icon: '🥐' },
    { id: 'grocery', name: '싱싱 청과', icon: '🍓' },
    { id: 'cafe', name: '커피 브런치', icon: '☕' },
    { id: 'flower', name: '꽃과 화분', icon: '💐' },
    { id: 'eco', name: '친환경 가치', icon: '🌿' },
  ];

  // 필터링 및 정렬 파이프라인
  const filteredStores = useMemo(() => {
    return stores
      .filter(store => {
        // 1. 카테고리 필터
        if (selectedCategory !== 'all' && store.category !== selectedCategory) {
          return false;
        }
        // 2. 검색어 매칭 (상점명, 설명, 태그, 상품명 등 광범위 큐레이션)
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        const nameMatch = store.name.toLowerCase().includes(query);
        const descMatch = store.description.toLowerCase().includes(query);
        const tagMatch = store.tags.some(tag => tag.toLowerCase().includes(query));
        
        // 상품명까지 매칭
        const productMatch = store.products?.some(p => p.name.toLowerCase().includes(query)) || false;

        return nameMatch || descMatch || tagMatch || productMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') {
          return a.distance - b.distance; // 가까운 순
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating; // 별점 높은 순
        }
        if (sortBy === 'reviews') {
          return b.reviewsCount - a.reviewsCount; // 리뷰 많은 순
        }
        return 0;
      });
  }, [stores, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-4 pb-16 font-sans">
      
      {/* 1. 검색 바 및 헤더 */}
      <div className="space-y-2">
        <h2 className="text-base font-extrabold text-gray-800">동네 보물 상점 찾기</h2>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="상점, 상품 빵 이름, 혹은 태그를 검색해 보세요 (#소금빵, 딸기)..."
            className="w-full pl-10 pr-4 py-3 outline-none rounded-2xl bg-white border border-gray-200 focus:border-[#FF6B35]/50 shadow-3xs text-xs font-sans transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-xs font-bold text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              지우기
            </button>
          )}
        </div>
      </div>

      {/* 2. 아이콘 카테고리 필터 레일 (Slick horizontal scroll) */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-bold text-[11px] transition-all active:scale-95 shadow-3xs cursor-pointer ${
                isSelected 
                  ? 'bg-[#FF6B35] text-white border border-transparent' 
                  : 'bg-white text-gray-750 border border-gray-150 hover:bg-gray-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3. 소팅 제어 홀더 */}
      <div className="flex items-center justify-between py-1 border-b border-gray-100/60">
        <span className="text-[10px] text-gray-400 font-bold">
          검색된 보물 상점 : <span className="text-gray-700">{filteredStores.length}곳</span>
        </span>

        <div className="flex items-center gap-1 text-[10.5px]">
          <button
            onClick={() => setSortBy('distance')}
            className={`px-2 py-1 rounded-md font-bold transition-colors ${
              sortBy === 'distance' ? 'text-[#FF6B35] bg-orange-50' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            가까운순
          </button>
          <span className="text-gray-200">|</span>
          <button
            onClick={() => setSortBy('rating')}
            className={`px-2 py-1 rounded-md font-bold transition-colors ${
              sortBy === 'rating' ? 'text-[#FF6B35] bg-orange-50' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            별점순
          </button>
          <span className="text-gray-200">|</span>
          <button
            onClick={() => setSortBy('reviews')}
            className={`px-2 py-1 rounded-md font-bold transition-colors ${
              sortBy === 'reviews' ? 'text-[#FF6B35] bg-orange-50' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            단골후기순
          </button>
        </div>
      </div>

      {/* 4. 상점 검색 결과 카드 리스트 */}
      <div className="space-y-3">
        {filteredStores.length > 0 ? (
          filteredStores.map((store) => (
            <div
              key={store.id}
              onClick={() => onSelectStore(store.id)}
              className="bg-white rounded-3xl border border-gray-150 p-4 transition-all hover:border-[#FF6B35]/30 cursor-pointer shadow-3xs flex gap-3.5"
            >
              {/* 소형 정밀 썸네일 */}
              <div className="w-20 d-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative">
                <img 
                  src={store.image} 
                  alt={store.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-1 left-1 px-1 py-0.5 bg-black/50 text-white text-[8px] font-bold rounded-sm z-10">
                  {store.distance}km
                </span>
              </div>

              {/* 디테일 글 정보 */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#FF6B35] transition-colors">{store.name}</h3>
                    <div className="flex items-center gap-0.5 text-[#FF6B35] font-extrabold text-[10.5px]">
                      <Star className="w-3 h-3 fill-[#FF6B35] text-[#FF6B35]" />
                      <span>{store.rating}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {store.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[9px] text-gray-400 mt-2">
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-gray-300" />
                    {store.address.split(' ').slice(1, 3).join(' ')} (도보 {Math.round(store.distance * 15)}분)
                  </span>
                  
                  <span className="font-extrabold text-[#4ECDC4] bg-[#4ECDC4]/10 px-1.5 py-0.5 rounded-md">
                    실시간 상품 {store.products?.length || 0}개
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <span className="text-4xl">🌾</span>
            <div>
              <h4 className="text-xs font-bold text-gray-800">이 지역엔 해당 보물이 아직 없네요</h4>
              <p className="text-[10px] text-gray-450 mt-1">다른 검색어나 카테고리 칩을 선택해 보시겠어요?</p>
            </div>
            <button 
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="px-4 py-1.5 text-[10.5px] font-bold bg-[#FF6B35]/10 hover:bg-[#FF6B35] text-[#FF6B35] hover:text-white rounded-xl border border-[#FF6B35]/20 transition-all active:scale-95"
            >
              전체 빵/상점 초기화
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
