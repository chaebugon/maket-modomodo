import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, 
  Product, 
  UserProfile, 
  Booking, 
  PointTransaction, 
  CommunityPost 
} from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeView from './components/HomeView';
import SearchView from './components/SearchView';
import ModoGuide from './components/ModoGuide';
import CommunityView from './components/CommunityView';
import MyPageView from './components/MyPageView';
import StoreDetail from './components/StoreDetail';

// 마스코트 및 배너 이미지 경로 지정 (generate_image 결과물 매핑)
const MASCOT_IMG = "/src/assets/images/modomodo_mascot_1779251775737.png";
const BANNER_IMG = "/src/assets/images/modomodo_banner_1779251795809.png";

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'guide' | 'community' | 'mypage'>('home');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // 데이터 상태 관리
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  
  // 가상 동네 알림 시스템 
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; date: string }>>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. 초기 데이터 로딩 (Express full-stack API 연동!)
  const fetchAllData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [pRes, sRes, bRes, poRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/stores'),
        fetch('/api/bookings'),
        fetch('/api/posts')
      ]);

      if (pRes.ok && sRes.ok && bRes.ok && poRes.ok) {
        const profileData = await pRes.json();
        const storesData = await sRes.json();
        const bookingsData = await bRes.json();
        const postsData = await poRes.json();

        setProfile(profileData);
        setStores(storesData);
        setBookings(bookingsData.bookings);
        setPointTransactions(bookingsData.pointTransactions);
        setPosts(postsData);
      }
    } catch (error) {
      console.error("데이터 동기화 실패:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    
    // 🌟 실시간 재고 꼬리 동기화 Polling (4초마다!) 🌟
    // 이렇게 하면 정교하게 실시간으로 동네 주민들이 구매하는 재고의 소진 임박 모습이 연달아 깜박이여 활기가 극대화된다!
    const tracker = setInterval(() => {
      fetchAllData(true); 
    }, 4000);

    return () => clearInterval(tracker);
  }, []);

  // 2. 가상 푸시 동네 생생 뉴스 시뮬레이터 (매 22초마다)
  useEffect(() => {
    const notifyList = [
      "🥐 방금 골목 양과점에 유기농 프랑스 게랑드 소금빵 10개가 갓 입고되어 주인을 기다립니다!",
      "🍓 [공구확정] 역삼자이아파트 단지 '꼬마딸기' 묶음배송 신청이 3명 매칭되어 무료배송이 승인되었습니다!",
      "🌿 초록발자국 잡화점 사장님이 지구의 날을 맞아 모든 제로웨이스트 포장을 포인트 5% 추가 환급해 드립니다!",
      "☕ 이웃 주민님이 오솔길 쑥라떼 후기글에 소중한 공감(하트)를 남겨주셨습니다."
    ];

    const alerts = setInterval(() => {
      const luckyNotify = notifyList[Math.floor(Math.random() * notifyList.length)];
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          text: luckyNotify,
          date: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);
    }, 22000);

    return () => clearInterval(alerts);
  }, []);

  // API 3. 포인트 간편 충전 처리 
  const handleChargePoints = async (amount: number) => {
    try {
      const res = await fetch('/api/profile/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      if (res.ok) {
        // 즉시 전역 동기화 
        await fetchAllData(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // API 4. 프로필 정보(이름, 주소) 변경 
  const handleUpdateProfile = async (name: string, neighborhood: string) => {
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, neighborhood })
      });

      if (res.ok) {
        await fetchAllData(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // API 5. 재고 예약 및 차감 처리 연동 
  const handleReserveProduct = async (
    productId: string, 
    count: number, 
    pickupTime: string, 
    bundleDelivery: boolean
  ) => {
    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, count, pickupTime, bundleDelivery })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await fetchAllData(true);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: "서버 통신에 실패했습니다." };
    }
  };

  // API 6. 사랑방 이야기 게시물 작성 
  const handleAddPost = async (post: { title: string; content: string; category: 'news' | 'market_review' | 'together' }) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      });

      if (res.ok) {
        await fetchAllData(true);
        // 가상 알림 추가 
        setNotifications(prev => [
          {
            id: `notif-${Date.now()}`,
            text: `📝 내가 보낸 '${post.title.slice(0, 10)}...' 글이 동네 사랑방 피드에 성공적으로 퍼졌습니다!`,
            date: "방금"
          },
          ...prev
        ]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // API 7. 커뮤니티 댓글 추가 
  const handleAddComment = async (postId: string, content: string) => {
    try {
      const res = await fetch('/api/posts/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content })
      });

      if (res.ok) {
        await fetchAllData(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // API 8. 커뮤니티 공감(따봉) 하트 추가 
  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });

      if (res.ok) {
        await fetchAllData(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 상점 입장 상세 연결 
  const handleSelectStore = (storeId: string) => {
    setSelectedStoreId(storeId);
  };

  const handleEnterStoreFromGuide = (storeId: string) => {
    setSelectedStoreId(storeId);
    setActiveTab('home'); // 홈 탭으로 포커싱을 옮김과 동시에 모달 오버레이!
  };

  return (
    <div className="min-h-screen bg-[#FCF9F5] max-w-7xl mx-auto border-x border-[#F5EFE6] flex flex-col relative shadow-sm">
      
      {isLoading ? (
        // 🌟 따스한 온기의 3D 클레이풍 로딩 오프너 🌟
        <div className="fixed inset-0 bg-[#FCF9F5] z-100 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-24 h-24 rounded-full border border-orange-100 bg-white shadow-md p-1.5 animate-bounce mb-4 flex items-center justify-center">
            <img 
              src={MASCOT_IMG} 
              alt="Mascot loading" 
              className="w-full h-full object-contain animate-delicate-float"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-space font-extrabold text-[#FF6B35] tracking-tight text-lg">market-modomodo</h1>
          <p className="text-xs text-gray-500 mt-2 font-medium">우리 동네의 골목 골목 숨겨진 보물상점을 선선히 여는 중...</p>
          <div className="flex gap-1.5 mt-5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#FF6B35] animate-ping [animation-delay:-0.3s]"></span>
            <span className="inline-block w-2 h-2 rounded-full bg-[#FF6B35] animate-ping [animation-delay:-0.15s]"></span>
            <span className="inline-block w-2 h-2 rounded-full bg-[#FF6B35] animate-ping"></span>
          </div>
        </div>
      ) : (
        <>
          {/* 상단 뼈대 헤더 */}
          <Header 
            profile={profile!} 
            onOpenMyPage={() => setActiveTab('mypage')}
            onOpenNotifications={() => setShowNeighborhoodSelectorOrNotifModal(true)}
            notificationCount={notifications.length}
          />

          {/* 메인 뷰 스위치 트랜짓 오케스트라 */}
          <main className="flex-1 p-4 overflow-y-auto no-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.22 }}
              >
                {activeTab === 'home' && (
                  <HomeView 
                    profile={profile!}
                    stores={stores}
                    bannerImage={BANNER_IMG}
                    onSelectStore={handleSelectStore}
                    onSwitchTab={setActiveTab}
                    onSetCategoryFilter={setCategoryFilter}
                  />
                )}

                {activeTab === 'search' && (
                  <SearchView 
                    stores={stores}
                    onSelectStore={handleSelectStore}
                    initialFilter={categoryFilter}
                  />
                )}

                {activeTab === 'guide' && (
                  <ModoGuide 
                    profile={profile!}
                    mascotImage={MASCOT_IMG}
                    onEnterStore={handleEnterStoreFromGuide}
                  />
                )}

                {activeTab === 'community' && (
                  <CommunityView 
                    posts={posts}
                    onAddPost={handleAddPost}
                    onAddComment={handleAddComment}
                    onLikePost={handleLikePost}
                  />
                )}

                {activeTab === 'mypage' && (
                  <MyPageView 
                    profile={profile!}
                    bookings={bookings}
                    pointTransactions={pointTransactions}
                    onChargePoints={handleChargePoints}
                    onUpdateProfile={handleUpdateProfile}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* 상점 상세 오버레이 (바텀 플로팅 혹은 풀화면 확장) */}
          <AnimatePresence>
            {selectedStoreId && (() => {
              const activeStore = stores.find(s => s.id === selectedStoreId);
              if (!activeStore) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 z-50 overflow-y-auto"
                >
                  <StoreDetail 
                    store={activeStore}
                    profile={profile!}
                    onClose={() => setSelectedStoreId(null)}
                    onReserve={handleReserveProduct}
                  />
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* 에그타르트 형상의 서정적인 동네 알림 모달 창 */}
          <AnimatePresence>
            {showNotificationsModal && (
              <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowNeighborhoodSelectorOrNotifModal(false)}
                  className="absolute inset-0 bg-black/45 backdrop-blur-xs"
                />

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-3xl w-full max-w-sm p-5 border border-gray-150 z-10 shadow-2xl relative overflow-hidden flex flex-col max-h-[420px]"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF6B35]" />
                  
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black text-gray-950">역삼2동 생생 동네 뉴스 피드 </h3>
                    <span className="text-[9px] text-[#FF6B35] bg-orange-50 font-black px-2 py-0.5 rounded-md">Live alerts</span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-3 bg-[#FCF9F5] border border-gray-150 rounded-2xl flex gap-2.5 items-start">
                          <span className="text-base flex-shrink-0">🐶</span>
                          <div className="flex-1">
                            <p className="text-[11px] text-gray-750 font-sans leading-relaxed">{notif.text}</p>
                            <span className="text-[8px] text-gray-400 font-medium block mt-1">{notif.date}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16 text-[10px] text-gray-400 font-medium space-y-2">
                        <span>🐾</span>
                        <p>동네 소식통이 조용합니다. 골목에 활기차가 일어날 때 소식을 보내 드릴게요!</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => { setNotifications([]); setShowNeighborhoodSelectorOrNotifModal(false); }}
                    className="mt-4 w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-150 text-gray-500 hover:text-gray-800 text-[10.5px] font-bold rounded-xl transition-all"
                  >
                    소식 보관함 비우고 닫기
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* 하단 스마트 탭 네비게이션 */}
          <BottomNav 
            activeTab={activeTab} 
            onSwitchTab={(t) => { setActiveTab(t); setSelectedStoreId(null); }}
            notificationCount={notifications.length}
          />
        </>
      )}

    </div>
  );

  // 알림 열고 닫는 helper 메카니즘
  function setShowNeighborhoodSelectorOrNotifModal(open: boolean) {
    setShowNotificationsModal(open);
  }
}
