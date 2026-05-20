import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CommunityPost, Comment } from '../types';
import { 
  MessageSquare, 
  Heart, 
  Plus, 
  Share2, 
  Send, 
  User, 
  Store, 
  Tag, 
  AlertCircle,
  X
} from 'lucide-react';

interface CommunityViewProps {
  posts: CommunityPost[];
  onAddPost: (post: { title: string; content: string; category: 'news' | 'market_review' | 'together' }) => void;
  onAddComment: (postId: string, content: string) => void;
  onLikePost: (postId: string) => void;
}

export default function CommunityView({ posts, onAddPost, onAddComment, onLikePost }: CommunityViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  
  // 새 글 입력 폼 상태
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'news' | 'market_review' | 'together'>('news');
  const [newContent, setNewContent] = useState('');
  
  // 댓글 입력 상태 
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const categories = [
    { id: 'all', name: '전체 사랑방', icon: '💬' },
    { id: 'news', name: '동네 소식통', icon: '📢' },
    { id: 'market_review', name: '단골 리얼후기', icon: '🍳' },
    { id: 'together', name: '묶음배송 공구원', icon: '📦' },
  ];

  const filteredPosts = posts.filter(post => {
    if (activeCategory === 'all') return true;
    return post.category === activeCategory;
  });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddPost({
      title: newTitle,
      content: newContent,
      category: newCategory
    });

    // Reset
    setNewTitle('');
    setNewContent('');
    setNewCategory('news');
    setShowWriteModal(false);
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    onAddComment(postId, text);
    
    // Clear input
    setCommentInputs(prev => ({
      ...prev,
      [postId]: ''
    }));
  };

  return (
    <div className="space-y-4 pb-16 font-sans relative">
      
      {/* 1. 커뮤니티 헤더와 분류 탭 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-extrabold text-gray-800">모도 사랑방 (동네 소식통)</h2>
          <p className="text-[10px] text-gray-500">역삼동 주민들과 소상공인들이 빚어내는 소박한 이야기</p>
        </div>
        
        {/* 새 글 작성 단추 */}
        <button
          onClick={() => setShowWriteModal(true)}
          className="px-3.5 py-1.5 text-[11px] font-bold bg-[#FF6B35] hover:bg-[#E0531F] text-white rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          사랑방 글쓰기
        </button>
      </div>

      {/* 2. 가로 카테고리 필터 스왑 레일 */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-3.5 py-2.5 rounded-2xl font-bold text-[10.5px] border transition-all active:scale-95 cursor-pointer ${
                isSelected 
                  ? 'bg-white text-[#FF6B35] border-[#FF6B35] shadow-2xs font-extrabold' 
                  : 'bg-white text-gray-650 border-gray-150 hover:bg-gray-50'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* 3. 소식 피드 카드 덱 */}
      <div className="space-y-4 pt-1">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-gray-150 p-4 shadow-3xs space-y-3"
            >
              {/* 유저 인포라인 */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full ${post.avatarColor} text-white text-xs font-bold font-mono flex items-center justify-center shadow-2xs`}>
                    {post.author.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-850 leading-tight">{post.author}</span>
                      <span className={`px-1.5 py-0.5 text-[8px] font-black rounded-md ${
                        post.authorRole === 'shopkeeper'
                          ? 'bg-[#FF6B35]/15 text-[#FF6B35]'
                          : 'bg-[#4ECDC4]/15 text-[#4ECDC4]'
                      }`}>
                        {post.authorRole === 'shopkeeper' ? '단골가게 사장님' : '우리동네 주민'}
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-400 font-medium">{post.date}</span>
                  </div>
                </div>

                {/* 카테고리 뱃지 */}
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                  post.category === 'news' ? 'bg-orange-50 text-[#FF6B35]' :
                  post.category === 'market_review' ? 'bg-pink-50 text-pink-500' : 'bg-teal-50 text-teal-600'
                }`}>
                  {post.category === 'news' ? '동네소식' :
                   post.category === 'market_review' ? '단골후기' : '묶음배송공구'}
                </span>
              </div>

              {/* 본문 타이틀 & 본문 */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-950 leading-snug">{post.title}</h4>
                <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-line font-sans pt-0.5">
                  {post.content}
                </p>
                
                {/* 만약 첨부된 이미지가 있으면 보여줌 */}
                {post.image && (
                  <div className="rounded-2xl overflow-hidden mt-3 max-h-48 border border-gray-150">
                    <img 
                      src={post.image} 
                      alt="첨부 이미지"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              {/* 디테일 하트 / 댓글 토글바 */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-bold">
                <button 
                  onClick={() => onLikePost(post.id)}
                  className="flex items-center gap-1.5 hover:text-red-500 transition-colors active:scale-90 group"
                >
                  <Heart className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors fill-none" />
                  <span>공감 <strong className="text-gray-700 font-extrabold">{post.likes}</strong></span>
                </button>

                <button 
                  onClick={() => setOpenCommentPostId(openCommentPostId === post.id ? null : post.id)}
                  className={`flex items-center gap-1.5 hover:text-[#FF6B35] transition-colors ${
                    openCommentPostId === post.id ? 'text-[#FF6B35]' : ''
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>동네댓글 <strong className="text-gray-750 font-extrabold">{post.commentsList.length}</strong></span>
                </button>

                <button className="flex items-center gap-1 hover:text-[#4ECDC4] transition-colors py-1">
                  <Share2 className="w-4 h-4" />
                  <span>공유</span>
                </button>
              </div>

              {/* 댓글 오버레이 섹션 */}
              <AnimatePresence>
                {openCommentPostId === post.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-3 pt-3 border-t border-dashed border-gray-150 space-y-3"
                  >
                    {/* 댓글 리스트 렌더링 */}
                    {post.commentsList.length > 0 ? (
                      <div className="space-y-2.5">
                        {post.commentsList.map((comment) => (
                          <div key={comment.id} className="bg-[#FCF9F5] p-2 rounded-2xl border border-[#F5EFE6] flex gap-2">
                            <div className={`w-6 h-6 rounded-full flex-shrink-0 ${comment.avatarColor} text-white font-bold text-[9px] flex items-center justify-center font-mono`}>
                              {comment.author.slice(0, 1)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center text-[9px] text-[#FF6B35]">
                                <span className="font-extrabold">{comment.author}</span>
                                <span className="text-gray-400 font-medium">{comment.date}</span>
                              </div>
                              <p className="text-[10.5px] text-gray-750 font-sans mt-0.5 leading-snug">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-[10px] text-gray-400 flex flex-col items-center gap-1 font-medium bg-[#FCF9F5]/30 rounded-2xl">
                        <AlertCircle className="w-4 h-4 text-gray-300" />
                        아직 댓글 사랑방이 비어있어요. 첫 마디를 나누어보세요 🌱
                      </div>
                    )}

                    {/* 댓글 한줄 입력 폼 */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="따뜻한 동네 댓글을 작성해 주세요..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({
                          ...prev,
                          [post.id]: e.target.value
                        }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                        className="flex-1 bg-gray-50 border border-gray-150 focus:border-[#FF6B35]/50 outline-none rounded-xl px-3 py-1.5 text-xs font-sans text-gray-800 transition-colors"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        className="p-2 bg-[#FF6B35] hover:bg-[#E0531F] text-white rounded-xl transition-transform active:scale-90 flex items-center justify-center cursor-pointer shadow-3xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white border border-gray-150 rounded-3xl space-y-3">
            <span className="text-4xl">💭</span>
            <h4 className="text-xs font-bold text-gray-800">이야기가 아직 올라오지 않았어요</h4>
            <p className="text-[10px] text-gray-450 mt-1">이웃들을 위해 소소한 묶음공구 소식이나 가게 후기를 전해보세요!</p>
          </div>
        )}
      </div>

      {/* 4. 새 글 작성 모달 오버레이 */}
      <AnimatePresence>
        {showWriteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* 백드롭 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWriteModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* 실제 모달 폼 */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-white rounded-3xl w-full max-w-sm p-5 border border-gray-150 z-10 shadow-xl relative overflow-hidden flex flex-col"
            >
              {/* 장식 띠 */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF6B35]" />
              
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-extrabold text-gray-900 flex items-center gap-1">
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0" onClick={() => setShowWriteModal(false)} />
                  동네 글 전송하기
                </h3>
                <span className="text-[9px] text-[#FF6B35] font-black uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-md">
                  Modo Love
                </span>
              </div>

              <form onSubmit={handlePostSubmit} className="space-y-4">
                {/* 분류 선택 */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-0.5">
                    <Tag className="w-3 h-3 text-gray-400" />
                    이야기 주제 분류
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {(['news', 'market_review', 'together'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewCategory(cat)}
                        className={`py-2 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                          newCategory === cat 
                            ? 'bg-orange-50 text-[#FF6B35] border-[#FF6B35]' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {cat === 'news' ? '📢 동네소식' : 
                         cat === 'market_review' ? '🍳 단골후기' : '📦 묶음배송'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 글 제목 */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">글 제목</label>
                  <input
                    type="text"
                    required
                    placeholder="이웃들이 끌릴만한 멋진 한 줄 제목..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-250 focus:border-[#FF6B35]/50 outline-none rounded-xl bg-gray-50 focus:bg-white font-sans transition-all"
                  />
                </div>

                {/* 글 내용 */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">상세 이야기</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="역삼동 주민들과 함께 나누고 싶은 빵집 소식, 수다, 묶음배송 일정 등을 편안히 작성해보세요!"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-250 focus:border-[#FF6B35]/50 outline-none rounded-xl bg-gray-50 focus:bg-white font-sans resize-none transition-all"
                  />
                </div>

                {/* 전송 단추 */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FF6B35] hover:bg-[#E0531F] text-white font-bold text-[11px] rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  우리 동네 사랑방에 글 퍼뜨리기
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
