import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ModoGuideProps {
  profile: UserProfile;
  mascotImage: string;
  onEnterStore: (storeId: string) => void;
}

export default function ModoGuide({ profile, mascotImage, onEnterStore }: ModoGuideProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `멍멍! 반가워요, ${profile.name} 이웃님! 🐾 

저는 우리 동네 보물이 숨겨진 상점들의 소식과 실시간 재고를 쏙쏙 꾀고 있는 골목대장 강아지 강아지 **'모도'**예요! 🐶

오늘 어떤 맛있는 빵이나 신선한 도리를 찾고 있으신가요? 아니면 이웃과 요금을 아끼는 **묶음배송** 공구가 궁금하신가요? 아래 추천 칩을 누르시거나 저에게 편하게 말을 걸어주세요!`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    { text: "🥐 지금 통밀빵이나 소금빵 살 수 있어?", icon: "🥖" },
    { text: "📦 이웃과의 묶음배송이 뭐야?", icon: "🚚" },
    { text: "🍓 싱싱한 꿀딸기 재고 알려줘", icon: "🍓" },
    { text: "🏡 근처에 별점 높은 꽃집 추천해줘", icon: "💐" }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // API call to custom server gemini proxy
      // chatHistory를 전달하여 연속 대화가 가능하게 함
      const chatHistory = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/gemini/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: chatHistory
        })
      });

      if (!res.ok) {
        throw new Error("서버 응답 오류");
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "멍... 발바닥에 땀나도록 골목길을 뛰어가 봤는데 인터넷 바람이 잠시 끊겼나봐요! 🐾 다시 한 번 시도해 주시면 얼른 알아올게요! (서버 연결 에러가 발생했습니다)" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 텍스트 내에서 특정 상점이나 상품 키워드를 탐지해서 '바로가기' 버튼을 자동으로 생성해주는 스마트 링크 로직
  const renderMessageContent = (text: string) => {
    // 마크다운 형식의 기호들을 간단히 볼드 처리 등으로 한글 파싱
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formattedLine = line;
      // 볼드 처리
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="font-bold text-[#FF6B35]">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const isListItem = line.trim().startsWith('-') || line.trim().startsWith('*');

      return (
        <p key={idx} className={`text-xs leading-relaxed ${isListItem ? 'pl-2.5 my-0.5' : 'my-1'}`}>
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  // 메시지 꼬리 감지하여 인앱 지능형 액션 버튼 렌더링
  const getActionButtons = (text: string) => {
    const actions = [];
    if (text.includes("양과점") || text.includes("소금빵")) {
      actions.push({ name: "골목 양과점 구경가기 🥐", id: "store-1" });
    }
    if (text.includes("초록뜨락") || text.includes("딸기") || text.includes("쌈채소")) {
      actions.push({ name: "싱싱마켓 초록뜨락 구경가기 🍓", id: "store-2" });
    }
    if (text.includes("꽃빛") || text.includes("꽃다발") || text.includes("아이비")) {
      actions.push({ name: "꽃빛 그리다 구경가기 💐", id: "store-3" });
    }
    if (text.includes("초록발자국") || text.includes("가치잡화점") || text.includes("수세미")) {
      actions.push({ name: "초록발자국 가치잡화점 구경가기 🌿", id: "store-4" });
    }
    if (text.includes("오솔길") || text.includes("파니니") || text.includes("쑥라떼")) {
      actions.push({ name: "오솔길 브런치&카페 구경가기 🥪", id: "store-5" });
    }
    return actions;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[640px] bg-white rounded-3xl border border-[#F5EFE6] overflow-hidden shadow-xs">
      {/* 챗봇 헤더 */}
      <div className="bg-[#FF6B35]/5 px-4 py-3 border-b border-[#FF6B35]/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border border-[#FF6B35]/20 overflow-hidden bg-white flex items-center justify-center p-0.5 shadow-xs">
              <img 
                src={mascotImage} 
                alt="마스코트 모도" 
                className="w-full h-full object-contain animate-delicate-float"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border border-white flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-800">동네 골목대장 '모도'</span>
              <span className="px-1.5 py-0.5 text-[8px] bg-[#FF6B35] text-white font-extrabold rounded-md shadow-xs">AI 가이드</span>
            </div>
            <p className="text-[10px] text-gray-500">실시간 재고 소식 및 골목 큐레이션</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-white/50 px-2 py-1 rounded-lg border border-gray-100">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
          Gemini 3.5 기반 가동
        </div>
      </div>

      {/* 메시지 영역 */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#FCF9F5]/30 to-white no-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'model' && (
                <div className="w-8 h-8 rounded-full border border-gray-150 overflow-hidden bg-white flex-shrink-0 flex items-center justify-center p-0.5">
                  <img src={mascotImage} alt="Mascot" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
              )}

              <div className="flex flex-col max-w-[80%] space-y-1">
                {message.role === 'model' && (
                  <span className="text-[9px] text-gray-400 font-bold ml-1">골묵대장 모도</span>
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 shadow-xs text-xs whitespace-pre-line ${
                    message.role === 'user'
                      ? 'bg-[#FF6B35] text-white rounded-tr-none font-medium'
                      : 'bg-[#FCF9F5] text-gray-800 border border-[#F5EFE6] rounded-tl-none font-sans'
                  }`}
                >
                  {message.role === 'user' ? message.text : renderMessageContent(message.text)}
                </div>

                {/* 지능형 컴포넌트 바로가기 오프너 */}
                {message.role === 'model' && (
                  <div className="flex flex-wrap gap-1.5 mt-1 ml-1">
                    {getActionButtons(message.text).map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        onClick={() => onEnterStore(btn.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF6B35]/10 hover:bg-[#FF6B35] text-[#FF6B35] hover:text-white font-bold text-[10px] border border-[#FF6B35]/20 transition-all active:scale-95 cursor-pointer shadow-2xs"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        {btn.name}
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2.5 justify-start"
            >
              <div className="w-8 h-8 rounded-full border border-gray-150 overflow-hidden bg-white flex-shrink-0 flex items-center justify-center p-0.5">
                <img src={mascotImage} alt="Mascot" className="w-full h-full object-contain animate-bounce" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-[9px] text-gray-400 font-bold ml-1">모도가 발걸음 옮기는 중..</span>
                <div className="bg-[#FCF9F5] border border-[#F5EFE6] rounded-2xl rounded-tl-none px-4 py-3 text-xs text-gray-500 shadow-2xs flex items-center gap-2">
                  <div className="flex space-x-1">
                    <span className="inline-block w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="inline-block w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="inline-block w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-[10px] tracking-tight">골목 상점들 실시간 재고 냄새 맡는 중🐾</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 추천 질문 키워드 칩 (대화창 바로 위에 뜸) */}
      <div className="px-4 py-2 border-t border-gray-100 bg-[#FCF9F5]/40">
        <div className="flex gap-2 py-1 overflow-x-auto no-scrollbar">
          {suggestedQuestions.map((q, qIdx) => (
            <button
              key={qIdx}
              onClick={() => handleSendMessage(q.text)}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-orange-50 text-[10.5px] font-bold text-gray-700 border border-gray-150 hover:border-[#FF6B35]/30 transition-all active:scale-95 cursor-pointer shadow-3xs"
            >
              <span>{q.icon}</span>
              <span>{q.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 대화 입력 바 */}
      <div className="p-3 border-t border-[#F5EFE6] bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
          placeholder="강아지 가이드 '모도'에게 말을 걸어보세요..."
          className="flex-1 px-4 py-2.5 outline-none rounded-2xl bg-[#FCF9F5] border border-gray-150 focus:border-[#FF6B35]/50 hover:border-gray-300 font-sans text-xs transition-colors"
        />
        <button
          onClick={() => handleSendMessage(inputValue)}
          disabled={!inputValue.trim() || isLoading}
          className="p-2.5 rounded-2xl bg-[#FF6B35] text-white disabled:bg-gray-100 disabled:text-gray-400 font-bold transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-xs shadow-[#FF6B35]/25"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
