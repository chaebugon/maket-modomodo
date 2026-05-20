import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: '20mb' }));
const PORT = 3000;

// Gemini AI Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

// Mock & In-memory Data (서버 구동 기간 동안 유지)
const userProfile = {
  name: "모도러버",
  email: "maketmoum@gmail.com",
  phone: "010-1234-5678",
  points: 45000,
  neighborhood: "역삼2동",
  avatarColor: "bg-orange-500",
};

const stores = [
  {
    id: "store-1",
    name: "온기 가득 골목 양과점",
    category: "bakery" as const,
    description: "유기농 통밀과 프랑스 이즈니 버터로 매일 아침 8시, 갓 구워낸 따끈따끈한 소금빵이 가장 유명한 우리 동네 숨은 빵집입니다.",
    distance: 0.3,
    rating: 4.9,
    reviewsCount: 148,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop",
    address: "서울 강남구 논현로64길 12",
    coordinates: { lat: 37.49525, lng: 127.03823 },
    tags: ["소금빵맛집", "유기농통밀", "밀크티맛집"],
    phone: "02-555-1234",
    openTime: "08:00 - 20:00",
  },
  {
    id: "store-2",
    name: "싱싱마켓 초록뜨락",
    category: "grocery" as const,
    description: "산지 직송 친환경 채소와 과일을 중간 도매 없이 가장 정직한 가격에 가져옵니다. 안심하고 먹을 수 있는 우리 가족 식탁의 동반자.",
    distance: 0.5,
    rating: 4.8,
    reviewsCount: 312,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop",
    address: "서울 강남구 역삼로 215",
    coordinates: { lat: 37.49411, lng: 127.04155 },
    tags: ["친환경채소", "산지직송", "달콤한딸기", "묶음배송"],
    phone: "02-567-8901",
    openTime: "09:00 - 21:00",
  },
  {
    id: "store-3",
    name: "꽃빛 그리다",
    category: "flower" as const,
    description: "테이블에 스며드는 조용한 위로, 일상의 반짝임을 담은 감성 꽃집입니다. 프렌치 스타일 플라워 어레인지먼트와 무드 넘치는 반려식물 전문.",
    distance: 0.8,
    rating: 4.7,
    reviewsCount: 92,
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=600&auto=format&fit=crop",
    address: "서울 강남구 도곡로 188",
    coordinates: { lat: 37.49122, lng: 127.04312 },
    tags: ["감성꽃선물", "인테리어반려식물", "플라워클래스"],
    phone: "02-345-6789",
    openTime: "10:00 - 19:30",
  },
  {
    id: "store-4",
    name: "초록발자국 가치잡화점",
    category: "eco" as const,
    description: "쓸수록 지구가 건강해지는 곳. 제로웨이스트 친환경 생활 잡화와 리필 스테이션을 운영하며 무해한 지속 가능한 삶을 권합니다.",
    distance: 1.1,
    rating: 4.9,
    reviewsCount: 74,
    image: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?q=80&w=600&auto=format&fit=crop",
    address: "서울 강남구 역삼로4길 16",
    coordinates: { lat: 37.49195, lng: 127.02981 },
    tags: ["제로웨이스트", "친환경수세미", "리필스테이션", "비건친화"],
    phone: "02-777-3344",
    openTime: "11:00 - 20:00",
  },
  {
    id: "store-5",
    name: "오솔길 브런치&카페",
    category: "cafe" as const,
    description: "피톤치드 가득한 식물 감성의 오슬로풍 인테리어에서 즐기는 신선한 파니니와 달콤 쌉싸름한 시그니처 쑥페너.",
    distance: 0.4,
    rating: 4.6,
    reviewsCount: 185,
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop",
    address: "서울 강남구 역삼로 172",
    coordinates: { lat: 37.49388, lng: 127.03712 },
    tags: ["브런치맛집", "아인슈페너", "식물인테리어", "수다맛집"],
    phone: "02-234-5678",
    openTime: "09:00 - 18:00",
  }
];

// 실시간 상태가 반영될 상품 목록
const products = [
  // 온기 가득 골목 양과점 (store-1)
  {
    id: "prod-1",
    storeId: "store-1",
    name: "🥐 시그니처 프렌치 소금빵",
    price: 3500,
    stock: 8,
    maxStock: 25,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=500&auto=format&fit=crop",
    description: "엄선한 프랑스 게랑드 토판염과 이즈니 버터를 가득 품어 고소한 버터동굴이 일품인 겉바속촉 시그니처 소금빵입니다.",
    isPopular: true,
  },
  {
    id: "prod-2",
    storeId: "store-1",
    name: "🍪 다크 피칸 르뱅 쿠키",
    price: 3800,
    stock: 4,
    maxStock: 15,
    image: "https://images.unsplash.com/photo-1558961309-dbdf037a1e08?q=80&w=500&auto=format&fit=crop",
    description: "진하고 고급스러운 프랑스산 다크 초콜릿칩과 구운 통피칸이 듬뿍 들어가 식감이 오독오독하고 매력적인 뚱쿠키.",
  },
  {
    id: "prod-3",
    storeId: "store-1",
    name: "🌾 수제 무가당 통밀 식빵",
    price: 5200,
    stock: 2,
    maxStock: 8,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=500&auto=format&fit=crop",
    description: "식단 관리하시는 분들의 최애탬! 설탕과 버터 없이 물과 호밀 발효종, 국산 아가베 시럽으로만 구워내어 구수하고 편안한 통밀 식빵.",
  },

  // 싱싱마켓 초록뜨락 (store-2)
  {
    id: "prod-4",
    storeId: "store-2",
    name: "🍓 성주 무농약 한입 꼬마딸기 (500g)",
    price: 8900,
    stock: 12,
    maxStock: 30,
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=500&auto=format&fit=crop",
    description: "농약 없이 벌로 자연 수분시켜 기른 초강력 고당도 꿀맛 딸기! 한입에 쏙 넣어 아이들이나 디저트 데코용으로 인기가 매우 좋습니다.",
    isPopular: true,
  },
  {
    id: "prod-5",
    storeId: "store-2",
    name: "🥬 유기농 쌈채소 모둠팩 (300g)",
    price: 2900,
    stock: 7,
    maxStock: 20,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=500&auto=format&fit=crop",
    description: "적상추, 치커리, 케일, 청경채 등 매일 아침 안성 하우스에서 갓 딴 싱싱한 모둠 쌈채소의 신선함.",
  },
  {
    id: "prod-6",
    storeId: "store-2",
    name: "🥑 파라과이 프리미엄 아보카도 (3과)",
    price: 6500,
    stock: 3,
    maxStock: 10,
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=500&auto=format&fit=crop",
    description: "바로 드실 수 있는 완숙 직전의 리치한 크림 텍스처 아보카도입니다. 간장계란밥이나 아보카도 샌드위치용으로 완전 추천!",
  },

  // 꽃빛 그리다 (store-3)
  {
    id: "prod-7",
    storeId: "store-3",
    name: "💐 오늘의 싱그러운 미니 테이블 꽃다발",
    price: 18000,
    stock: 5,
    maxStock: 12,
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=500&auto=format&fit=crop",
    description: "기분 전환에 완벽한 계절 혼합 꽃다발. 화병에 꽂아두면 동네 꽃시장의 이슬 머금은 향기가 집안 가득 퍼집니다.",
    isPopular: true,
  },
  {
    id: "prod-8",
    storeId: "store-3",
    name: "🌿 동반 화분 '싱그러운 하트 아이비'",
    price: 13000,
    stock: 2,
    maxStock: 6,
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=500&auto=format&fit=crop",
    description: "초보 식집사도 키우기 쉬운 사랑스러운 하트 쉐입 아이비 화분입니다. 공기 정화 능력이 우수하며 반그늘에서도 쑥쑥 잘 늘어납니다.",
  },

  // 초록발자국 가치잡화점 (store-4)
  {
    id: "prod-9",
    storeId: "store-4",
    name: "🧽 국산 천연 수수 수세미 (3입)",
    price: 4200,
    stock: 9,
    maxStock: 25,
    image: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?q=80&w=500&auto=format&fit=crop",
    description: "미세플라스틱 걱정 전~혀 없이 쓸 수 있는 100% 생분해 국산 천연 수수 수세미입니다. 기름기 흡수가 뛰어나요.",
    isPopular: true,
  },
  {
    id: "prod-10",
    storeId: "store-4",
    name: "✨ 대나무 세라믹 칫솔꽂이 및 칫솔세트",
    price: 7500,
    stock: 6,
    maxStock: 15,
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=500&auto=format&fit=crop",
    description: "곰팡이 저항력이 뛰어난 방수형 탄화 대나무 칫솔 대와 이중 미세모 칫솔, 그리고 세라믹 감성의 칫솔 미니 스탠드.",
  },

  // 오솔길 브런치&카페 (store-5)
  {
    id: "prod-11",
    storeId: "store-5",
    name: "🥪 바질 페스토 닭가슴살 파니니",
    price: 8500,
    stock: 4,
    maxStock: 12,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=500&auto=format&fit=crop",
    description: "수제 허브 바질 페스토를 듬뿍 바르고 싱싱한 토마토와 생 모짜렐라, 부드러운 수비드 닭가슴살을 넣어 오븐에 바삭하게 구워내서 겉이 바삭바삭합니다.",
    isPopular: true,
  },
  {
    id: "prod-12",
    storeId: "store-5",
    name: "🍵 시그니처 크림 오솔길 쑥라떼",
    price: 5500,
    stock: 10,
    maxStock: 25,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=500&auto=format&fit=crop",
    description: "청정 봉화 수제 쑥가루로 블렌딩한 진한 쑥 에스프레소 베이스 위에 시그니처 소금 생크림이 살포시 올려진 단짠 쌉싸름의 끝판왕.",
  }
];

// 포인트 내역 리스트
const pointTransactions = [
  { id: "tx-1", type: "earn" as const, amount: 450, title: "양과점 소금빵 예약 적립 (10%)", date: "2026-05-18" },
  { id: "tx-2", type: "use" as const, amount: 3500, title: "미니 테이블 꽃다발 구매 포인트 차감", date: "2026-05-15" },
  { id: "tx-3", type: "earn" as const, amount: 10000, title: "우리동네 걷기 챌린지 10만보 달성 포인트", date: "2026-05-14" },
  { id: "tx-4", type: "earn" as const, amount: 30000, title: "카드 간편 충전 (신한카드)", date: "2026-05-12" },
];

// 예약 이력 리스트
const bookings: any[] = [
  {
    id: "book-1",
    storeId: "store-1",
    storeName: "온기 가득 골목 양과점",
    productId: "prod-1",
    productName: "🥐 시그니처 프렌치 소금빵",
    price: 3500,
    count: 2,
    status: "completed" as const,
    date: "2026-05-18 14:22",
    pickupTime: "17:30 - 18:00 (오후 퇴근길 픽업)",
    bundleDelivery: false,
    earnedPoints: 450,
  },
  {
    id: "book-2",
    storeId: "store-3",
    storeName: "꽃빛 그리다",
    productId: "prod-7",
    productName: "💐 오늘의 싱그러운 미니 테이블 꽃다발",
    price: 18000,
    count: 1,
    status: "completed" as const,
    date: "2026-05-15 11:05",
    pickupTime: "15:00 - 15:30",
    bundleDelivery: true,
    earnedPoints: 1100,
  }
];

// 커뮤니티 게시글 목록 
const communityPosts = [
  {
    id: "post-1",
    title: "📢 골목 양과점 소금빵 나오는 시간 정보!",
    author: "도곡동사랑꾼",
    authorRole: "resident" as const,
    avatarColor: "bg-teal-500",
    content: "여러분 맨날 양과점 소금빵 갈 때마다 허탕치셔서 아쉬우셨죠? 사장님께 여쭤보니까 평일은 오전 8시30분이랑 오후 4시30분, 이렇게 하루 딱 두 번 나온대요! 특히 주말에는 오후 2시에 타임세일 반짝 예약도 열린다고 하니 모도모도 앱으로 눈치싸움 성공하시길 바랄게요ㅎㅎ 꿀맛 보장합니다!",
    likes: 24,
    commentsList: [
      { id: "c-1", author: "빵돌이99", content: "와 대박 꿀정보네요!! 매번 5시에 가서 다 팔렸다고 하셨는데 이 시간 맞춰봐야겠어요", date: "2026-05-19 18:30", avatarColor: "bg-pink-500" },
      { id: "c-2", author: "온기 가득 골목 양과점 사장", content: "아이쿠 사랑방에 이리 소개해 주셔서 감사합니다! 내일 오시면 미니 쿠키라도 하나 더 챙겨드릴게요^^ 마켓 모도모도 선결제 예약도 물량 많이 늘려볼게요!", date: "2026-05-19 20:15", avatarColor: "bg-orange-500" }
    ],
    date: "2026-05-19 15:10",
    category: "news" as const,
  },
  {
    id: "post-2",
    title: "🥬 초록뜨락 무농약 딸기 꼭 드셔보세요~!!",
    author: "둥이엄마",
    authorRole: "resident" as const,
    avatarColor: "bg-purple-500",
    content: "어제 초록뜨락에서 꼬마딸기로 산지직송 받아서 둥이들 씻어줬는데 앉은자리에서 한팩 다 흡입했어요ㅠ 새콤하기보다 엄청 달달하고 무농약이라니까 흐르는 물에 가볍게 착착 씻어서 먹이기 너무 안심되네요! 근처 가실 일 있으면 꼭 데려가세요. 포인트 적립도 마켓모도모도로 아주 쏠쏠하게 쌓였습니당.",
    likes: 18,
    commentsList: [
      { id: "c-3", author: "초록맘", content: "어멋 저두 이거 보고 금방 모도앱으로 픽업예약했어요! 다 나갈려나 조마조마했는데 다행히 수량 있네요!!", date: "2026-05-20 01:22", avatarColor: "bg-green-500" }
    ],
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=500&auto=format&fit=crop",
    date: "2026-05-20 00:45",
    category: "market_review" as const,
  },
  {
    id: "post-3",
    title: "📦 역삼 아파트 단지 묶음 배송 공구원 구해요 (초록뜨락)",
    author: "역삼자이러버",
    authorRole: "resident" as const,
    avatarColor: "bg-rose-500",
    content: "오늘 초록뜨락 야채랑 프리미엄 아보카도 사려는데, 역삼자이 3단지 살거든요! 혹시 오늘 저녁 7시 배달 예정인 모도모도 '묶음 배송' 같이 참여하실 이웃분 계실까요? 배송료도 공짜가 되고 상인분도 한번에 묶어서 보내실 수 있어서 친환경적이고 너무 조아요. 한분만 더 모시면 최적화 시간 배송 가능합니다!",
    likes: 12,
    commentsList: [],
    date: "2026-05-20 03:10",
    category: "together" as const,
  }
];

// --- 🌟 실시간 재고 시뮬레이션 작동 🌟 ---
// 7초마다 임의의 상품의 재고가 동적으로 변화하여, 사용자가 앱에서 진짜동네의 실시간 활기를 체감하게 한다.
setInterval(() => {
  const luckyProductIndex = Math.floor(Math.random() * products.length);
  const prod = products[luckyProductIndex];
  
  // 70% 확률로 재고 감소 (구매 발생), 30% 확률로 재고 충전 (입고)
  const isPurchase = Math.random() < 0.7;
  
  if (isPurchase) {
    if (prod.stock > 1) {
      prod.stock -= 1;
    } else {
      prod.stock = prod.maxStock; // 완전히 떨어지면 다시 듬뿍 입고 시뮬레이션
    }
  } else {
    if (prod.stock < prod.maxStock) {
      prod.stock += Math.floor(Math.random() * 3) + 1;
      if (prod.stock > prod.maxStock) {
        prod.stock = prod.maxStock;
      }
    }
  }
}, 7000);


// API 1. 유저 프로필 조회
app.get("/api/profile", (req, res) => {
  res.json(userProfile);
});

// API 2. 유저 프로필 업데이트
app.post("/api/profile/update", (req, res) => {
  const { name, neighborhood } = req.body;
  if (name) userProfile.name = name;
  if (neighborhood) userProfile.neighborhood = neighborhood;
  res.json({ success: true, profile: userProfile });
});

// API 3. 포인트 충전
app.post("/api/profile/charge", (req, res) => {
  const { amount } = req.body;
  const chargeAmount = parseInt(amount, 10);
  if (isNaN(chargeAmount) || chargeAmount <= 0) {
    return res.status(400).json({ error: "올바른 금액을 입력하세요." });
  }

  userProfile.points += chargeAmount;
  
  const tx = {
    id: `tx-${Date.now()}`,
    type: "earn" as const,
    amount: chargeAmount,
    title: "포인트 간편 충전",
    date: new Date().toISOString().split('T')[0],
  };
  pointTransactions.unshift(tx);

  res.json({ success: true, points: userProfile.points, transaction: tx });
});

// API 4. 동네 상점 정보 및 하위 상품 목록 조회
app.get("/api/stores", (req, res) => {
  // 상점 정보에 실시간 변동되는 상품 정보를 바인딩하여 안전하게 내려줌
  const enrichedStores = stores.map(store => {
    const storeProducts = products.filter(p => p.storeId === store.id);
    return {
      ...store,
      products: storeProducts
    };
  });
  res.json(enrichedStores);
});

// API 5. 예약 & 포인트 결제 처리 
app.post("/api/reserve", (req, res) => {
  const { productId, count, pickupTime, bundleDelivery } = req.body;
  const targetProduct = products.find(p => p.id === productId);
  if (!targetProduct) {
    return res.status(404).json({ error: "존재하지 않는 상품입니다." });
  }

  const rentCount = parseInt(count, 10) || 1;
  if (targetProduct.stock < rentCount) {
    return res.status(400).json({ error: `죄송합니다. 현재 실시간 재고가 부족합니다. (잔여: ${targetProduct.stock}개)` });
  }

  const totalPrice = targetProduct.price * rentCount;
  if (userProfile.points < totalPrice) {
    return res.status(400).json({ error: "모도포인트가 부족합니다. 마이페이지에서 먼저 포인트를 충전해주세요!" });
  }

  // 실시간 재고 삭감 
  targetProduct.stock -= rentCount;

  // 포인트 차감 
  userProfile.points -= totalPrice;

  // 포인트 적립 (결제액의 5% 기본 적립, 묶음배송 신청 시 10% 더블 적립 특전!)
  const earnRate = bundleDelivery ? 0.10 : 0.05;
  const earnedPoints = Math.floor(totalPrice * earnRate);
  userProfile.points += earnedPoints;

  const targetStore = stores.find(s => s.id === targetProduct.storeId);
  const storeName = targetStore ? targetStore.name : "동네 상점";

  // 예약 내역 생성
  const newBooking = {
    id: `book-${Date.now()}`,
    storeId: targetProduct.storeId,
    storeName,
    productId,
    productName: targetProduct.name,
    price: targetProduct.price,
    count: rentCount,
    status: "pending" as const, // 대기 -> 상점 승인 시 완료
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    pickupTime: pickupTime || "영업 시간 내 자유 픽업",
    bundleDelivery: !!bundleDelivery,
    earnedPoints,
  };
  bookings.unshift(newBooking);

  // 포인트 이용/사용 내역 생성 
  const txUse = {
    id: `tx-use-${Date.now()}`,
    type: "use" as const,
    amount: totalPrice,
    title: `${targetProduct.name} 구매 포인트 차감`,
    date: new Date().toISOString().split('T')[0],
  };
  const txEarn = {
    id: `tx-earn-${Date.now()}`,
    type: "earn" as const,
    amount: earnedPoints,
    title: `${targetProduct.name} 구매 확적 적립 (${earnRate * 100}%)`,
    date: new Date().toISOString().split('T')[0],
  };
  pointTransactions.unshift(txUse, txEarn);

  res.json({
    success: true,
    booking: newBooking,
    updatedPoints: userProfile.points,
    updatedStock: targetProduct.stock,
  });
});

// API 6. 묶음 배송 / 픽업 스케줄 관리
app.get("/api/bookings", (req, res) => {
  res.json({
    bookings,
    pointTransactions
  });
});

// API 7. 커뮤니티 글 목록과 글 작성 
app.get("/api/posts", (req, res) => {
  res.json(communityPosts);
});

app.post("/api/posts", (req, res) => {
  const { title, content, category, image } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ error: "제목, 분류, 내용을 채워주세요!" });
  }

  const newPost = {
    id: `post-${Date.now()}`,
    title,
    author: userProfile.name,
    authorRole: "resident" as const,
    avatarColor: userProfile.avatarColor,
    content,
    likes: 0,
    commentsList: [],
    image: image || undefined,
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    category: category,
  };

  communityPosts.unshift(newPost);
  res.json({ success: true, post: newPost });
});

// API 8. 커뮤니티 댓글 추가 
app.post("/api/posts/comment", (req, res) => {
  const { postId, content } = req.body;
  const post = communityPosts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "존재하지 않는 게시글입니다." });
  }

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "댓글 내용을 작성해주세요." });
  }

  const newComment = {
    id: `c-${Date.now()}`,
    author: userProfile.name,
    content,
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    avatarColor: userProfile.avatarColor,
  };

  post.commentsList.push(newComment);
  res.json({ success: true, comment: newComment, commentsList: post.commentsList });
});

// API 9. 동네 소식통 게시물 공감(따봉) 토글 
app.post("/api/posts/like", (req, res) => {
  const { postId } = req.body;
  const post = communityPosts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  }
  post.likes += 1;
  res.json({ success: true, likes: post.likes });
});

// API 10. AI 동네 도우미 "모도"와의 스마트 플레이스 큐레이션 및 추천 챗봇 
app.post("/api/gemini/guide", async (req, res) => {
  const { message, chatHistory } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "메시지를 제공해 주세요." });
  }

  if (!ai) {
    // API Key가 미등록 상태인 경우 친절하고 지혜로운 로컬 Mock 도우미로 Fallback 작동
    const mockResponses = [
      `안녕하세요! 우리 동네 따스한 지킴이 '모도'입니다 🐶! 

현재 강남구 역삼동 일대의 **온기 가득 골목 양과점**에서 정말 바삭바삭하고 버터 소금 동굴이 제대로 뚫린 🥐 **시그니처 프렌치 소금빵**이 막 오븐에서 나와 실시간 재고(8개) 여유가 있답니다! 

혹시 건강한 식탁을 준비하신다면 **싱싱마켓 초록뜨락**의 🍓 **성주 무농약 한입 꼬마딸기**도 같이 추천해 드릴게요! 묶음 배송 신청하시면 이웃끼리 배송료를 아끼는 것은 물론 포인트도 10% 더블 적립돼서 든든해요. 더 알고 싶으신 상점이 있다면 언제든 물어봐 주시면 꼬리치며 알려드릴게요!`,

      `멍멍! 이웃님, 오늘 저녁 찬거리는 걱정 마세요! '모도'가 도와드릴게요 🐾.

오늘 친환경 건강 라이프를 실천하는 **초록발자국 가치잡화점**에 생분해 🧽 **국산 천연 수수 수세미**가 새로 입고되었다고 해요. 환경보호도 하고, 마켓 포인트도 쏠쏠히 쌓으실 수 있답니다!

달콤하고 산뜻한 디저트가 당기신다면 **오솔길 브런치&카페**의 시그니처 🥪 **바질 페스토 닭가슴살 파니니**와 🍵 **쑥라떼**는 어떠신가요? 쑥가루를 봉화에서 가꾼 최고급으로만 쓴다고 해요!`,

      `반가워요 이웃님! 우리 동네 보물 상점들을 쏙쏙 꿰고 있는 똑똑이 가이드 '모도'랍니다 🐕!

오늘 기분이 조금 찌푸둥하시다면 **꽃빛 그리다** 감성꽃집에서 💐 **오늘의 싱그러운 미니 테이블 꽃다발**을 추천해 드려요. 테이블 소형 사이즈라 가벼운 마음으로 화사함을 들이기에 완전 제격이랍니다! 

더 필요한 동네 소식이나, 픽업 배송 꿀팁이 필요하다면 말씀하세요. 이웃님을 위해서라면 언제든 골목 끝까지 뛰어가서 알아올게요!`
    ];

    const randomMockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    // 자연스러운 로딩 연출을 위해 아아아아주 약간의 지연 후 응답
    await new Promise(resolve => setTimeout(resolve, 800));
    return res.json({ text: randomMockResponse });
  }

  try {
    // 1. 현재의 소상공인 상점 및 상품 데이터를 Prompt context로 포맷팅
    const storeContextList = stores.map(store => {
      const storeProducts = products.filter(p => p.storeId === store.id);
      const prodListStr = storeProducts.map(p => `- [ID: ${p.id}] ${p.name}: ${p.price}원 (현재 실시간 재고: ${p.stock}/${p.maxStock}개) - 설명: ${p.description}`).join('\n');
      return `상점명: "${store.name}" [카테고리: ${store.category}, 별점: ${store.rating}, 거리: ${store.distance}km]
상점 위치: ${store.address} (전화번호: ${store.phone}, 영업시간: ${store.openTime})
상점 상세설명: ${store.description}
판매 상품 목록:
${prodListStr}`;
    }).join('\n\n');

    // 2. 동네 커뮤니티 소식 전달
    const postContextList = communityPosts.map(p => `- ${p.title} (작성자: ${p.author}, 공감수: ${p.likes})\n  내용: ${p.content}`).slice(0, 3).join('\n');

    // System instruction 주입
    const systemInstruction = `당신은 '마켓 모도모도(market-modomodo)' 서비스의 친절하고 사랑스러운 동네 골목 대장 강아지 AI 가이드 '모도'🐾 입니다.
사용자는 이웃 주민(고객)이며, 당신은 동네의 모든 보물같은 영세 상인/소상공인 가게 정보와 커뮤니티 소식을 꿰뚫고 있습니다.
말투는 다정하고 온기가 가득하며, 종종 강아지 울음소리 이모티콘("멍멍!", "🐾", "🐶", "단짝 이웃님!") 등을 적절히 섞어 활기를 북돋아야 합니다.
이 앱은 '통합 모도포인트 적립/사용', '실시간 예약하기', '이웃 주민 간의 묶음 배송 공구 신청(더블 적립 혜택 10%)' 기능을 탑재하고 있습니다. 이를 적극 어필하고 유도하세요!

현재 우리 동네(역삼동 일대) 상점 및 실시간 재고 현황 컨텍스트를 완벽히 숙지하고 답변하세요:
${storeContextList}

최근 떠들썩한 동네 사랑방(커뮤니티) 소식:
${postContextList}

[가이드라인]
1. 사용자가 특정 상품이나 상점을 찾으면, 실시간 재고 수량이 남아 있는지 알려주고, '예약하기'에서 모도포인트로 미리 살 수 있음을 알려주세요.
2. 이웃끼리 배송 경로를 아끼는 '묶음 배송'을 신청하면, 포인트도 10%나 대폭 추가 적립(일반 적립은 5%)되므로 다른 이웃들과 역삼 자이 등 근방 아파트에서 함께 묶어 배송받는 기여를 해보라고 상냥히 영감을 주세요.
3. 답변은 너무 길거나 장황하지 않고, 읽기 좋게 문단을 나누고 포인트를 볼드처리하여 친근하게 대화체로 대답하세요.`;

    // 3. Google GenAI SDK를 사용하되 이력을 넘긴다.
    // contents 포맷팅 (chatHistory가 있는 경우 그것을 Gemini SDK 규격에 매핑)
    // 간단히 Single turn generateContent 혹은 chat을 생성할 수 있음.
    // 가이드 준수: ai.models.generateContent 사용
    
    const formattedContents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const turn of chatHistory) {
         formattedContents.push({
           role: turn.role === 'user' ? 'user' : 'model',
           parts: [{ text: turn.text }]
         });
      }
    }
    // 마지막 메시지 추가
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "모도가 지금 동네 한바퀴 뛰러 나갔나봐요! 잠시 후 다시 찾아올게요! (서버 API 오류)" });
  }
});


// Dev & Production configuration for Vite Middleware.
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
