import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Store, Product, UserProfile } from '../types';
import { 
  X, 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  ShoppingBag, 
  Check, 
  Truck, 
  AlertCircle,
  HelpCircle,
  Award,
  CheckCircle2
} from 'lucide-react';

interface StoreDetailProps {
  store: Store;
  profile: UserProfile;
  onClose: () => void;
  onReserve: (productId: string, count: number, pickupTime: string, bundleDelivery: boolean) => Promise<{ success: boolean; error?: string }>;
}

export default function StoreDetail({ store, profile, onClose, onReserve }: StoreDetailProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [pickupTime, setPickupTime] = useState('17:30 - 18:00 (오후 퇴근길 픽업)');
  const [bundleDelivery, setBundleDelivery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // 상점 이미지 Carousel 가상 주소
  const slideImages = [
    store.image,
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop", // 매장 내부 서정적인 분위기
    "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=600&auto=format&fit=crop", // 패키징 감성
  ];
  const [activeSlide, setActiveSlide] = useState(0);

  // 이미지 번들링 자동 루프 
  useEffect(() => {
    const term = setInterval(() => {
      setActiveSlide(p => (p + 1) % slideImages.length);
    }, 4500);
    return () => clearInterval(term);
  }, [store]);

  // Toast 자동 소멸 타이머
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  const handleOpenReserve = (product: Product) => {
    if (product.stock <= 0) {
      setToastMessage({ text: "죄송합니다. 현재 이 보물 상품은 실시간 재고가 모두 소진되었습니다!", isError: true });
      return;
    }
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleReserveSubmit = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);

    const priceRequired = selectedProduct.price * quantity;
    if (profile.points < priceRequired) {
      setToastMessage({ 
        text: `모도포인트가 부족합니다. (부족금액: ${(priceRequired - profile.points).toLocaleString()}P)\n마이페이지 탭에서 먼저 간편하게 충전해 주세요!`, 
        isError: true 
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await onReserve(
        selectedProduct.id, 
        quantity, 
        pickupTime, 
        bundleDelivery
      );

      if (res.success) {
        setToastMessage({ 
          text: `축하합니다 🎉!\n'${selectedProduct.name}' ${quantity}개 예약 결제가 성공했습니다.\n이웃 묶음 및 포인트 적립이 마이페이지에 기록되었습니다.`,
          isError: false
        });
        setSelectedProduct(null); // 바텀시트 닫기
      } else {
        setToastMessage({ text: res.error || "예약에 실패했습니다.", isError: true });
      }
    } catch (error) {
      setToastMessage({ text: "서버가 잠시 바쁩니다. 다시 요청해 주세요.", isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FCF9F5] flex flex-col h-screen max-w-7xl mx-auto border-x border-[#E9E1D5] no-scrollbar">
      
      {/* 1. 고해상도 이미지 슬라이더 및 탑 세팅 */}
      <div className="relative h-[220px] w-full flex-shrink-0 bg-gray-200">
        <AnimatePresence mode="wait">
          <motion.img 
            key={activeSlide}
            src={slideImages[activeSlide]} 
            alt="Store Mood Banner" 
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.8 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        {/* 오버레이 그라디언트 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* 이미지 도트 인디케이터 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {slideImages.map((_, sIdx) => (
            <span 
              key={sIdx}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                activeSlide === sIdx ? 'bg-[#FF6B35] w-3.5' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* 상단 닫기 단추 */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. 상점 프롤로그 정보 패널 */}
      <div className="px-4 py-5 space-y-4 border-b border-[#F5EFE6] bg-white">
        <div className="flex justify-between items-start">
          <div>
            <span className="px-2 py-0.5 text-[8.5px] bg-orange-50 text-[#FF6B35] font-black rounded-md tracking-wider uppercase">
              {store.category.toUpperCase()} 큐레이션 상점
            </span>
            <h2 className="text-base font-black text-gray-900 leading-tight mt-1">{store.name}</h2>
          </div>

          <div className="flex items-center gap-0.5 text-[#FF6B35] font-extrabold text-sm flex-shrink-0">
            <Star className="w-4.5 h-4.5 text-amber-400 fill-amber-400" />
            <span>{store.rating}</span>
            <span className="text-[10px] text-gray-400 font-medium">({store.reviewsCount})</span>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed font-sans">{store.description}</p>

        {/* 상점 메타 세부 줄 */}
        <div className="grid grid-cols-2 gap-2 text-[10.5px] text-gray-500 pt-1">
          <div className="flex items-center gap-1.5 leading-none">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>역삼동 {store.address.split(' ').slice(2).join(' ')}</span>
          </div>
          <div className="flex items-center gap-1.5 leading-none">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>가게번호 {store.phone}</span>
          </div>
          <div className="flex items-center gap-1.5 leading-none col-span-2">
            <Clock className="w-4 h-4 text-[#FF6B35]" />
            <span className="font-semibold text-gray-700">영업 시간: {store.openTime} (모도 실시간 예약 대응)</span>
          </div>
        </div>
      </div>

      {/* 3. 실시간 재고를 포함한 보물 상품 리스트 */}
      <div className="flex-1 px-4 py-5 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-gray-500 tracking-wider">상점별 실시간 입고 제품 ({store.products?.length || 0})</h3>
          <p className="text-[10px] text-gray-400 mt-1">이웃들이 실시간으로 쓸어가는 중이니 수량이 떨어지기 전 선주문하세요!</p>
        </div>

        <div className="space-y-3.5">
          {store.products && store.products.length > 0 ? (
            store.products.map((product) => {
              const isLowStock = product.stock > 0 && product.stock <= 4;
              const isOut = product.stock === 0;

              return (
                <div 
                  key={product.id}
                  onClick={() => handleOpenReserve(product)}
                  className={`p-3 bg-white border rounded-3xl transition-all shadow-3xs flex gap-3 cursor-pointer select-none ${
                    isOut 
                      ? 'border-gray-200 opacity-60 hover:border-gray-200' 
                      : 'border-gray-150 hover:border-[#FF6B35]/40 active:scale-[0.99]'
                  }`}
                >
                  {/* 상품 썸네일 */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {product.isPopular && (
                      <span className="absolute top-1 left-1 bg-[#FF6B35] text-white text-[7.5px] font-black px-1 py-0.5 rounded-md uppercase tracking-wider">
                        인기보물
                      </span>
                    )}
                  </div>

                  {/* 세부 제품설명 */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-black text-gray-800 leading-tight">{product.name}</h4>
                        <span className="text-[11.5px] font-bold text-gray-950 font-mono">
                          {product.price.toLocaleString()}원
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed font-sans">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-50/70">
                      {/* 실시간 잔여 재고 메키니즘 뱃지 */}
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${
                        isOut ? 'text-gray-400' :
                        isLowStock ? 'text-red-500 font-extrabold animate-pulse' : 'text-[#4ECDC4] font-extrabold'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isOut ? 'bg-gray-400' :
                          isLowStock ? 'bg-red-500 animate-ping' : 'bg-[#4ECDC4]'
                        }`} />
                        {isOut ? '당일 완판 소진!' :
                         isLowStock ? `마감직전! 단 ${product.stock}개 남음 🔥` : `현재 실시간 재고 ${product.stock}개 여유`}
                      </span>

                      {!isOut && (
                        <button className="px-3 py-1 bg-[#FF6B35] text-white font-extrabold text-[10px] rounded-lg tracking-tight hover:bg-[#E0531F]">
                          실시간 예약
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-xs text-gray-400">
              이 상점은 현재 입고 준비 중입니다. 사장님께 문의해 보세요!
            </div>
          )}
        </div>
      </div>

      {/* 4. 실시간 예약 팝업 시트 (드롭 오버레이) */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* 시트 백드롭 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* 바텀 플레이백 시트 내용물 */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 border border-gray-150 z-10 shadow-2xl relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF6B35]" />

              <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
                <h3 className="text-xs font-black text-gray-800">모도포인트 즉시 예약결제</h3>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* 상품 요약 요약 */}
                <div className="flex items-center gap-3 bg-[#FCF9F5] p-3 rounded-2xl border border-gray-150">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-11 h-11 object-cover rounded-xl border border-gray-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="text-xs font-black text-gray-800 leading-none">{selectedProduct.name}</h5>
                    <p className="text-[10px] text-[#FF6B35] font-semibold mt-1.5 leading-none font-mono">
                      {selectedProduct.price.toLocaleString()}원
                    </p>
                    <p className="text-[8px] text-gray-400 mt-1 leading-none">실시간 픽업 가용 수량: {selectedProduct.stock}개</p>
                  </div>
                </div>

                {/* 수량 정산기 조리기 */}
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100/65">
                  <span className="text-[10.5px] font-bold text-gray-600">예약 수량 조절</span>
                  <div className="flex items-center gap-3">
                    <button
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(p => Math.max(1, p - 1))}
                      className="w-7 h-7 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 font-extrabold rounded-lg text-sm flex items-center justify-center transition-all disabled:opacity-40"
                    >
                      －
                    </button>
                    <span className="text-xs font-black font-mono w-4 text-center">{quantity}</span>
                    <button
                      disabled={quantity >= selectedProduct.stock}
                      onClick={() => setQuantity(p => Math.min(selectedProduct.stock, p + 1))}
                      className="w-7 h-7 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-[#FF6B35] font-extrabold rounded-lg text-sm flex items-center justify-center transition-all disabled:opacity-40"
                    >
                      ＋
                    </button>
                  </div>
                </div>

                {/* 픽업/배달 옵션 설정 */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">픽업/인도 희망 시간대</label>
                  <select 
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs focus:border-[#FF6B35]/50 outline-none rounded-xl px-3 py-2.5 font-sans cursor-pointer"
                  >
                    <option value="오전 08:30 - 09:00 (아침 갓구운 빵 선입고)">오전 08:30 - 09:00 (아침 갓구운 빵 선입고)</option>
                    <option value="오후 12:00 - 13:00 (점심 브런치 대용수령)">오후 12:00 - 13:00 (점심 브런치 대용수령)</option>
                    <option value="15:00 - 15:30 (오후의 달콤한 티타임)">15:00 - 15:30 (오후의 달콤한 티타임)</option>
                    <option value="17:30 - 18:00 (오후 퇴근길 픽업)">17:30 - 18:00 (오후 퇴근길 픽업)</option>
                    <option value="가게 영업시간 내 언제든 자유 픽업">가게 영업시간 내 언제든 자유 픽업</option>
                  </select>
                </div>

                {/* 묶음배송 공구원 연동 체크박스 (통합 핵심 요구기능!) */}
                <div 
                  onClick={() => setBundleDelivery(!bundleDelivery)}
                  className={`p-3 border-2 rounded-2xl flex gap-2.5 cursor-pointer transition-all select-none ${
                    bundleDelivery 
                      ? 'bg-[#4ECDC4]/5 border-[#4ECDC4]' 
                      : 'bg-white border-gray-150 hover:border-gray-300'
                  }`}
                >
                  <div className="pt-0.5">
                    <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-colors ${
                      bundleDelivery ? 'bg-[#4ECDC4] border-[#4ECDC4]' : 'bg-white border-gray-300'
                    }`}>
                      {bundleDelivery && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-[11px] font-black text-gray-800 flex items-center gap-1 leading-none">
                        <Truck className="w-3.5 h-3.5 text-[#4ECDC4]" />
                        우리 이웃 묶음배송(Bundle) 신청
                      </h5>
                      <span className="text-[8px] bg-[#4ECDC4] text-white font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                        배달무상
                      </span>
                    </div>
                    <p className="text-[9.5px] text-gray-500 leading-relaxed font-sans">
                      역삼 자이, 래미안 등 근처 아파트 주민들과 한 차량으로 묶어 배송받습니다. 배송비 0원 혜택과 **통합 더블 10% 적립 보너스**(일반 5%)가 지급됩니다! 🌱
                    </p>
                  </div>
                </div>

                {/* 최종 정산 요약액 */}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center bg-[#FCF9F5] p-3 rounded-2xl text-xs">
                  <div>
                    <span className="text-gray-400 font-bold">결제 예정 포인트</span>
                    <p className="text-[9.5px] text-[#4ECDC4] font-bold mt-1">적립예상: {(selectedProduct.price * quantity * (bundleDelivery ? 0.1 : 0.05))}P ({bundleDelivery ? 'Double 10%' : '5% 기본'})</p>
                  </div>
                  <span className="text-sm font-black text-[#FF6B35] font-mono">
                    {(selectedProduct.price * quantity).toLocaleString()} 포인트
                  </span>
                </div>

                {/* 결제 실행 */}
                <button
                  onClick={handleReserveSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#FF6B35] hover:bg-[#E0531F] text-white font-extrabold text-[12px] rounded-2xl shadow-md transition-all active:scale-95 disabled:bg-gray-200 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isSubmitting ? '동네 승인 처리 중...' : '예약 결제하기 및 포인트 즉시차감'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 실시간 팝업 알림 토스트 피드백 */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-100 max-w-sm w-[90%] p-4 rounded-3xl text-xs text-white shadow-xl flex gap-2.5 items-start ${
              toastMessage.isError ? 'bg-red-500 border-2 border-red-400/20' : 'bg-emerald-500 border-2 border-emerald-400/20'
            }`}
          >
            {toastMessage.isError ? (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-white" />
            ) : (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-white animate-bounce" />
            )}
            <div className="whitespace-pre-line font-bold font-sans flex-1">
              {toastMessage.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
