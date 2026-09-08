export interface UserAddress {
  province: string;
  city: string;
  district: string;
  street: string;
  detail: string;
}

export interface UserProfile {
  userId: string;
  city: string;
  phone: string;
  nickname: string;
  avatar?: string;
  wechatId?: string;
  backupPhone?: string;
  province?: string;
  district?: string;
  street?: string;
  detailAddress?: string;
  formattedAddress?: string;
  realName?: string;
  idCardNumber?: string;
  verificationStatus?: 'unverified' | 'pending' | 'verified';
  userRole?: 'client' | 'escort' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export interface EscortCertificate {
  name: string;
  issuer: string;
  verified: boolean;
  date: string;
}

export interface EscortReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  serviceType: string;
  content: string;
}

export interface EscortProfile {
  id: string;
  name: string;
  gender: '女' | '男';
  age: number;
  avatar: string;
  title: string;
  tag: string;
  phone: string;
  city: string;
  serviceArea: string;
  rating: string;
  serviceCount: number;
  yearsOfExperience: number;
  praiseRate: string;
  verified: boolean;
  idCardVerified: boolean;
  healthCertVerified: boolean;
  noCriminalRecord: boolean;
  bio: string;
  category?: '医疗陪诊' | '宠物陪伴' | '同城陪伴';
  monthlyOrders?: number;
  weeklyOrders?: number;
  avgResponseMinutes?: number;
  serviceCommitment: string[];
  specialties: string[];
  certificates: EscortCertificate[];
  workPhotos: Array<{ url: string; caption: string }>;
  reviews: EscortReview[];
}

export interface Order {
  id: string;
  title: string;
  type: string;
  city?: string;
  location: string;
  formattedAddress?: string;
  time: string;
  serviceStartTime?: string;
  description: string;
  remark?: string;
  publisher: string;
  publisherId: string;
  wechatId?: string;
  phone: string;
  createdAt: string;
  publishTime?: string;
  status: OrderStatus;
  estimatedDuration?: string;
  serviceDuration?: string;
  budget?: string;
  amount?: string;
  tips?: string[];
  servicePhotos?: string[];
  matchedEscort?: {
    id?: string;
    name: string;
    avatar?: string;
    phone: string;
    rating: string;
    tag: string;
    profile?: EscortProfile;
  };
}

export interface CommunityPost {
  id: string;
  title: string;
  type: string;
  city?: string;
  district: string;
  location: string;
  time: string;
  description: string;
  coverImage?: string;
  images?: string[];
  publisherName: string;
  publisherAvatar?: string;
  publishedTimeAgo: string;
  status: 'pending' | 'matched' | 'completed' | 'cancelled';
  likesCount: number;
  isLiked?: boolean;
  isMine?: boolean;
  isOfficialCase?: boolean;
  estimatedDuration?: string;
  budget?: string;
  tags?: string[];
  aspectRatio?: 'tall' | 'square' | 'wide';
  serviceHospital?: string;
  escortName?: string;
  escortAvatar?: string;
  escortRating?: string;
  serviceScore?: number;
  serviceReview?: string;
}

export interface DraftOrder {
  title: string;
  type: string;
  city?: string;
  location: string;
  time: string;
  phone: string;
  description: string;
  estimatedDuration?: string;
  budget?: string;
  tips?: string[];
}

export interface RealNameVerification {
  isVerified: boolean;
  realName: string;
  idCardNumber: string;
  idCardFrontImage?: string; // 身份证人像面
  idCardBackImage?: string; // 身份证国徽面
  verifiedAt?: string;
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  draftOrder?: DraftOrder;
  isOrderCreated?: boolean;
  createdOrderId?: string;
}

export interface CouponItem {
  id: string;
  name: string;
  discount: string; // 如 '8折'
  discountRate?: number; // 0.8
  category: '全品类' | '医疗陪诊' | '长者关爱' | '同城陪伴' | '宠物陪伴' | string;
  description: string;
  validUntil: string;
  status: 'available' | 'used' | 'expired';
  code: string;
  minSpend?: string;
  usedDate?: string;
  userPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}


