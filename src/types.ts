export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Store {
  id: string;
  name: string;
  category: 'bakery' | 'grocery' | 'cafe' | 'flower' | 'restaurant' | 'eco';
  description: string;
  distance: number; // km
  rating: number;
  reviewsCount: number;
  image: string;
  address: string;
  coordinates: Coordinates;
  tags: string[];
  phone: string;
  openTime: string;
  products?: Product[];
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  price: number;
  stock: number;
  maxStock: number;
  image: string;
  description: string;
  isPopular?: boolean;
}

export interface PointTransaction {
  id: string;
  type: 'earn' | 'use';
  amount: number;
  title: string;
  date: string;
}

export interface Booking {
  id: string;
  storeId: string;
  storeName: string;
  productId: string;
  productName: string;
  price: number;
  count: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
  pickupTime: string;
  bundleDelivery: boolean;
  earnedPoints: number;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  avatarColor: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  author: string;
  authorRole: 'resident' | 'shopkeeper';
  avatarColor: string;
  content: string;
  likes: number;
  commentsList: Comment[];
  image?: string;
  date: string;
  category: 'news' | 'market_review' | 'together' | 'notice';
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  points: number;
  neighborhood: string;
  avatarColor: string;
}
