import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, PointTransaction, Booking } from '../types';
import { 
  Award, 
  CreditCard, 
  Clock, 
  MapPin, 
  History, 
  TrendingUp, 
  Truck, 
  CheckCircle2, 
  QrCode, 
  X,
  Sparkles,
  Info
} from 'lucide-react';

interface MyPageViewProps {
  profile: UserProfile;
  bookings: Booking[];
  pointTransactions: PointTransaction[];
  onChargePoints: (amount: number) => void;
  onUpdateProfile: (name: string, neighborhood: string) => void;
}

export default function MyPageView({ 
  profile, 
  bookings, 
  pointTransactions, 
  onChargePoints, 
  onUpdateProfile 
}: MyPageViewProps) {
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [chargeAmount, setChargeAmount] = useState<number>(30000);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // 수정 필드 상태
  const [editName, setEditName] = useState(profile.name);
  const [editNeighbor, setEditNeighbor] = useState(profile.neighborhood);

  const predefinedAmounts = [10000, 30000, 50000, 100000];

  const handleChargeSubmit = () => {
    onChargePoints(chargeAmount);
    setShowChargeModal(false);
  };

  const handleProfileUpdate = () => {
    if (!editName.trim() || !editNeighbor.trim()) return;
    onUpdateProfile(editName, editNeighbor);
    setShowEditProfile(false);
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      
      {/* 1. 개인 프로필 카드 */}
      <div className="bg-white rounded-3xl border border-gray-150 p-5 shadow-xs flex items-center justify-between relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full ${profile.avatarColor} text-white font-extrabold text-lg flex items-center justify-center border-4 border-[#FCF9F5] shadow-sm font-mono`}>
            {profile.name.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-gray-900 leading-tight">{profile.name}</h3>
              <button 
                onClick={() => setShowEditProfile(!showEditProfile)}
                className="text-[10px] text-gray-400 hover:text-[#FF6B35] font-bold underline"
              >
                편집
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              대표 행정지역: {profile.neighborhood}
            </p>
            <p className="text-[9px] text-gray-400">{profile.email}</p>
          </div>
        </div>

        {/* 포인트 소형 게이지 */}
        <div className="text-right">
          <span className="text-[9px] font-black text-[#FF6B35] bg-orange-50 px-2 py-0.5 rounded-md">
            동네 골목대장 🌱
          </span>
          <p className="text-xs font-bold text-gray-400 mt-1 leading-none">모도포인트 잔액</p>
          <p className="text-lg font-black text-[#FF6B35] leading-snug mt-1 font-mono">{profile.points.toLocaleString()}P</p>
        </div>
      </div>

      {/* 프로필 편집 인라인 오버레이 */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#FCF9F5] p-4 rounded-3xl border border-[#F5EFE6] space-y-3"
          >
            <h4 className="text-xs font-bold text-gray-800">단골 주소지 및 이름 변경</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400">이웃 활동 이름</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white border border-gray-200 outline-none rounded-xl px-2.5 py-1.5 text-xs text-gray-800 font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400">우리 동네 구역명</label>
                <input 
                  type="text" 
                  value={editNeighbor}
                  onChange={(e) => setEditNeighbor(e.target.value)}
                  className="w-full bg-white border border-gray-200 outline-none rounded-xl px-2.5 py-1.5 text-xs text-gray-800 font-sans"
                />
              </div>
            </div>
            <div className="flex justify-end gap-1.5">
              <button 
                onClick={() => setShowEditProfile(false)}
                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-500 rounded-xl text-[10px] font-bold hover:bg-gray-50"
              >
                취소
              </button>
              <button 
                onClick={handleProfileUpdate}
                className="px-3 py-1.5 bg-[#FF6B35] text-white rounded-xl text-[10px] font-bold hover:bg-[#E0531F]"
              >
                동네 적용
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. 오프라인 가맹점용 모도포인트 QR/바코드 통합 승인 UI */}
      <div className="bg-white rounded-3xl border border-gray-150 p-5 shadow-xs text-center space-y-3.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1 leading-none">
            <QrCode className="w-4 h-4 text-gray-400" />
            현장 오프라인 픽업 바코드
          </span>
          <span className="text-[9px] text-[#4ECDC4] font-black uppercase tracking-wide bg-[#4ECDC4]/10 px-2 py-0.5 rounded-md">
            보안 안전 승인
          </span>
        </div>

        {/* 바코드 형상화 그래픽 (SVG 바코드 렌더러!) */}
        <div className="bg-[#FCF9F5] p-4 rounded-2xl inline-block max-w-[280px] w-full border border-dashed border-gray-250">
          <svg className="w-full h-12" viewBox="0 0 200 60">
            {/* 정교한 바코드 기둥들 */}
            <rect x="10" y="5" width="4" height="40" fill="#2D2A26" />
            <rect x="16" y="5" width="1.5" height="40" fill="#2D2A26" />
            <rect x="20" y="5" width="3" height="40" fill="#2D2A26" />
            <rect x="25" y="5" width="1" height="40" fill="#2D2A26" />
            <rect x="29" y="5" width="5" height="40" fill="#2D2A26" />
            <rect x="36" y="5" width="2" height="40" fill="#2D2A26" />
            
            <rect x="42" y="5" width="4" height="40" fill="#2D2A26" />
            <rect x="48" y="5" width="1.5" height="40" fill="#2D2A26" />
            <rect x="52" y="5" width="5" height="40" fill="#2D2A26" />
            <rect x="60" y="5" width="2" height="40" fill="#2D2A26" />
            <rect x="64" y="5" width="1" height="40" fill="#2D2A26" />
            <rect x="68" y="5" width="3.5" height="40" fill="#2D2A26" />
            
            <rect x="76" y="5" width="2" height="40" fill="#2D2A26" />
            <rect x="80" y="5" width="4" height="40" fill="#2D2A26" />
            <rect x="86" y="5" width="1" height="40" fill="#2D2A26" />
            <rect x="90" y="5" width="1.5" height="40" fill="#2D2A26" />
            <rect x="94" y="5" width="5" height="40" fill="#2D2A26" />
            <rect x="102" y="5" width="3" height="40" fill="#2D2A26" />
            
            <rect x="110" y="5" width="4" height="40" fill="#2D2A26" />
            <rect x="116" y="5" width="1.5" height="40" fill="#2D2A26" />
            <rect x="120" y="5" width="2" height="40" fill="#2D2A26" />
            <rect x="124" y="5" width="5" height="40" fill="#2D2A26" />
            <rect x="131" y="5" width="1" height="40" fill="#2D2A26" />
            <rect x="135" y="5" width="3" height="40" fill="#2D2A26" />
            
            <rect x="142" y="5" width="4" height="40" fill="#2D2A26" />
            <rect x="148" y="5" width="1" height="40" fill="#2D2A26" />
            <rect x="152" y="5" width="5" height="40" fill="#2D2A26" />
            <rect x="160" y="5" width="2" height="40" fill="#2D2A26" />
            <rect x="164" y="5" width="1.5" height="40" fill="#2D2A26" />
            <rect x="168" y="5" width="4" height="40" fill="#2D2A26" />
            <rect x="174" y="5" width="1" height="40" fill="#2D2A26" />
            <rect x="180" y="5" width="5" height="40" fill="#2D2A26" />
            <rect x="188" y="5" width="2" height="40" fill="#2D2A26" />

            {/* 바코드 아랫자 */}
            <text x="100" y="57" className="text-[9px] font-mono fill-gray-500 tracking-[0.2em]" textAnchor="middle">
              MODO-{profile.points.toString().slice(-4)}-9275
            </text>
          </svg>
        </div>
        <div>
          <h5 className="text-[11px] font-bold text-gray-700 leading-tight">상점 사장님께 이 바코드를 보여주세요!</h5>
          <p className="text-[9px] text-[#FF6B35] font-semibold mt-1">
            현장 즉시 픽업 확정 처리 및 모도포인트 결제 차감이 자동으로 일어납니다 🥐.
          </p>
        </div>
      </div>

      {/* 3. 예약 픽업 스케줄러 & 타임라인 현황 */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-bold text-gray-500 tracking-wider">이웃 픽업/배달 예약 현황</h3>
        
        <div className="relative border-l-2 border-gray-150 pl-4 ml-2.5 space-y-5">
          {bookings.length > 0 ? (
            bookings.map((book) => {
              const datePart = book.date.split(' ')[0];
              const timePart = book.date.split(' ')[1] || '';

              const isCompleted = book.status === 'completed';

              return (
                <div key={book.id} className="relative">
                  {/* 타임라인 원형 노드 */}
                  <div className={`absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-xs ${
                    isCompleted ? 'bg-emerald-500' : 'bg-[#FF6B35]'
                  }`} />

                  {/* 예약 상세 정보 카드 */}
                  <div className="bg-white rounded-2xl border border-gray-150 p-3.5 space-y-2.5 shadow-3xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold">{datePart} {timePart}</span>
                        <h4 className="text-xs font-black text-gray-800 leading-tight mt-0.5">{book.storeName}</h4>
                      </div>

                      {/* 완료/대기 뱃지 */}
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                        isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-[#FF6B35]'
                      }`}>
                        {isCompleted ? '수령 완료' : '픽업 대기 중'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-[#FCF9F5] rounded-xl flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🎁</span>
                        <div>
                          <p className="text-xs font-bold text-gray-850 leading-tight">{book.productName}</p>
                          <p className="text-[9.5px] text-gray-500 mt-0.5">수량 : {book.count}개  |  단가 : {book.price.toLocaleString()}원</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-[#FF6B35] font-mono">
                        -{(book.price * book.count).toLocaleString()}P
                      </span>
                    </div>

                    {/* 묶음배송 신청 여부 및 픽업 스케줄 꼬리 */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1.5 border-t border-gray-100/60 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#FF6B35]" />
                        예정 스케줄: {book.pickupTime}
                      </span>
                      
                      {book.bundleDelivery ? (
                        <span className="flex items-center gap-1 text-[#4ECDC4] font-bold">
                          <Truck className="w-3.5 h-3.5 text-[#4ECDC4]" />
                          묶음배송비 0원 혜택
                        </span>
                      ) : (
                        <span className="text-gray-400">매장 도보 픽업</span>
                      )}
                    </div>

                    {/* 포인트 적립 결과 */}
                    <div className="text-right text-[9px] text-emerald-600 font-extrabold">
                      ★ 이 예약에 대한 친환경 매칭 포인트 +{book.earnedPoints}P가 적립 완료되었습니다!
                    </div>

                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-white border border-gray-150 rounded-3xl text-gray-400 text-xs">
              최근 픽업 또는 배송 예약 내역이 비어 있습니다.
            </div>
          )}
        </div>
      </div>

      {/* 4. 포인트 사용 내역 히스토리 */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-bold text-gray-500 tracking-wider">포인트 통합 적립/사용 내역</h3>
        
        <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs divide-y divide-gray-100/85">
          {pointTransactions.map((tx) => (
            <div key={tx.id} className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-3xs ${
                  tx.type === 'earn' ? 'bg-emerald-50 text-[#4ECDC4]' : 'bg-red-50 text-red-500'
                }`}>
                  {tx.type === 'earn' ? '＋' : '－'}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-800 leading-tight">{tx.title}</h5>
                  <span className="text-[9px] text-gray-400 font-medium">{tx.date}</span>
                </div>
              </div>

              <span className={`text-xs font-bold font-mono ${
                tx.type === 'earn' ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {tx.type === 'earn' ? '+' : '-'}{tx.amount.toLocaleString()}P
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 묶음 배송 / 픽업 정보 가이드 */}
      <div className="bg-[#4ECDC4]/5 border-2 border-[#4ECDC4]/10 rounded-3xl p-4.5 flex gap-3">
        <div className="w-10 h-10 rounded-full bg-[#4ECDC4]/20 text-[#4ECDC4] flex items-center justify-center flex-shrink-0">
          <Truck className="w-5 h-5 text-[#4ECDC4]" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-[#4ECDC4]">묶음배송 경로 최적화 스케줄러 정보</h4>
          <p className="text-[10px] text-gray-600 leading-relaxed font-sans">
            마켓 모도모도는 1개 점포별 개별 가축 배송이 아니라, 100m 이내 이웃들의 주소지를 안전하게 연동해 묶음배송(Bundle)하여 온실가스를 저감하고, 이웃에겐 배송료 0원의 혜택을 제공합니다. 묶음 배송 이용 시 포인트는 **무려 10% 더블 적립**됩니다! 🌱
          </p>
        </div>
      </div>

      {/* 6. 포인트 간편 충전 고정 버튼 및 모달 */}
      <div className="pt-2">
        <button
          onClick={() => setShowChargeModal(true)}
          className="w-full py-3 bg-[#FF6B35] hover:bg-[#E0531F] text-white font-extrabold text-[12px] rounded-2xl shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          모도포인트 즉시 간편 충전하기 (수수료 무상)
        </button>
      </div>

      <AnimatePresence>
        {showChargeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChargeModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-white rounded-3xl w-full max-w-sm p-5 border border-gray-150 z-10 shadow-xl relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#4ECDC4]" />
              
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-extrabold text-gray-900 flex items-center gap-1">
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0" onClick={() => setShowChargeModal(false)} />
                  포인트 즉시 간편 충전
                </h3>
                <span className="text-[9px] text-[#4ECDC4] font-black uppercase tracking-wider bg-[#4ECDC4]/10 px-2 py-0.5 rounded-md">
                  수수료 전액 무상
                </span>
              </div>

              <div className="space-y-4">
                <div className="text-center bg-[#FCF9F5] p-4 rounded-2xl border border-gray-150">
                  <p className="text-[10px] text-gray-400 leading-none">현재 내 포인트 보유 잔액</p>
                  <p className="text-lg font-black text-[#FF6B35] leading-none mt-2 font-mono">{profile.points.toLocaleString()}P</p>
                </div>

                {/* 충전 금액 액수 선택 그리드 */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">충전희망 금액 선택</label>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {predefinedAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setChargeAmount(amt)}
                        className={`py-3.5 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                          chargeAmount === amt 
                            ? 'bg-teal-50 text-[#4ECDC4] border-[#4ECDC4] font-black scale-[1.02]' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {amt.toLocaleString()}원
                      </button>
                    ))}
                  </div>
                </div>

                {/* 충전 안내 팁 뱃지 */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-150 text-[10px] text-gray-500 leading-relaxed font-sans flex gap-2">
                  <Info className="w-4.5 h-4.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>신한, 국민, 현대, 삼성 간편 카드 결제 및 계좌 즉시 입금을 지원합니다. 매칭 보너스 혜택으로 충전 수수료가 전액 면제 전액 면제됩니다!</span>
                </div>

                <button
                  onClick={handleChargeSubmit}
                  className="w-full py-2.5 bg-[#4ECDC4] hover:bg-teal-600 text-white font-bold text-[11px] rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  {chargeAmount.toLocaleString()}원 즉시 충전하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
