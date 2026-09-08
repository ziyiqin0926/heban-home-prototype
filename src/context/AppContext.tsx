import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, ChatMessage, DraftOrder, CommunityPost, RealNameVerification, UserAddress, CouponItem } from '../types';
import { ALL_CITY_POSTS } from '../data/cityPosts';
import {
  getSupabaseOrders,
  insertSupabaseOrder,
  getSupabaseCommunityPosts,
  insertSupabaseCommunityPost,
  deleteSupabaseCommunityPost,
  saveSupabaseVerification,
  getSupabaseVerification,
  saveSupabaseUserProfile,
  getSupabaseUserProfile,
  getSupabaseCoupons,
  insertSupabaseCoupon,
  deleteSupabaseCoupon,
  syncCouponsToSupabase,
  resetSupabaseCouponsToSingle
} from '../lib/supabase';

export const INITIAL_SINGLE_80_COUPON: CouponItem = {
  id: 'cp-single-80',
  name: '新人首单专属陪护券',
  discount: '8折',
  discountRate: 0.8,
  category: '全品类',
  description: '平台新用户专享首单8折专属福利 · 全品类陪护就医通用 · 线下结算直接抵扣',
  validUntil: '2026-12-31',
  status: 'available',
  code: 'BENEFIT80',
  minSpend: '无门槛',
  createdAt: '2026-01-01T00:00:00.000Z'
};

interface AppContextType {
  orders: Order[];
  addOrder: (draft: DraftOrder) => Order;
  cancelOrder: (id: string) => void;
  completeOrder: (id: string) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  updateChatMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearChat: () => void;
  userPhone: string;
  setUserPhone: (phone: string) => void;
  backupPhone: string;
  setBackupPhone: (phone: string) => void;
  userAddress: UserAddress;
  setUserAddress: (addr: UserAddress) => void;
  communityPosts: CommunityPost[];
  addOfficialCommunityPost: (post: Omit<CommunityPost, 'id' | 'publishedTimeAgo'>) => CommunityPost;
  deleteCommunityPost: (id: string) => void;
  toggleLikePost: (id: string) => void;
  currentCity: string;
  setCurrentCity: (city: string) => void;
  prefilledPrompt: string;
  setPrefilledPrompt: (prompt: string) => void;
  verification: RealNameVerification;
  updateVerification: (data: Partial<RealNameVerification>) => void;
  resetVerification: () => void;
  isCloudConnected: boolean;
  syncAllToSupabase: () => Promise<number>;
  coupons: CouponItem[];
  addCoupon: (coupon: Omit<CouponItem, 'id'> | CouponItem) => Promise<CouponItem>;
  updateCoupon: (id: string, updates: Partial<CouponItem>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  useCoupon: (id: string, orderTitle?: string) => Promise<void>;
  resetCouponsToInitial: () => Promise<void>;
  syncCouponsWithSupabase: () => Promise<number>;
  isCouponsSyncing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialCommunityPosts: CommunityPost[] = ALL_CITY_POSTS;

const initialOrders: Order[] = [
  {
    id: 'ord-101',
    title: '北京协和医院门诊复查与陪同就医',
    type: '医疗陪诊',
    city: '北京',
    location: '北京协和医院东单院区门诊楼',
    time: '明天上午 09:00',
    description: '母亲进行心内科常规复查，需要陪护人员帮忙取号、排队就诊、引导检查科室并协助打印报告单。',
    publisher: '和伴用户',
    publisherId: 'current-user',
    phone: '13800138000',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    status: 'accepted',
    estimatedDuration: '3 小时',
    budget: '150 元',
    tips: [
      '请提醒就医者带好身份证、医保卡及以往病历资料',
      '建议提前15分钟到达集合地点碰面沟通'
    ],
    matchedEscort: {
      name: '李明辉 (资深陪诊员)',
      phone: '13788990011',
      rating: '4.95',
      tag: '已实名认证 · 医护背景'
    }
  }
];

const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    content: '您好！我是您的 **和伴 AI 陪护管家**。\n\n无论您需要**老人医院陪诊、排队代办取药、长者户外陪伴**还是**临时看护**，只需直接打字或语音告诉我您的需求，我将为您自动提取信息并一键生成标准化服务需求订单！同时您可以在【社区】中浏览同城邻里发布的各类陪伴需求。',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [userPhone, setUserPhone] = useState('13800138000');
  const [backupPhone, setBackupPhone] = useState('13900139000');
  const [userAddress, setUserAddress] = useState<UserAddress>({
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    street: '粤海街道',
    detail: '市人民医院 / 锦绣花园小区'
  });
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(initialCommunityPosts);
  const [currentCity, setCurrentCity] = useState('北京');
  const [prefilledPrompt, setPrefilledPrompt] = useState('');
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const [isCouponsSyncing, setIsCouponsSyncing] = useState(false);

  // Coupons state: initially only 1 single 8-fold coupon, any old mock coupons cleared
  const [coupons, setCoupons] = useState<CouponItem[]>(() => {
    try {
      const saved = localStorage.getItem('app_user_coupons');
      if (saved) {
        const parsed: CouponItem[] = JSON.parse(saved);
        // Clean up any legacy multiple mock coupons (e.g. cp-02, cp-03, cp-04, cp-05, cp-06)
        const isLegacyMulti = Array.isArray(parsed) && parsed.some(c => c.id === 'cp-02' || c.id === 'cp-03' || c.id === 'cp-04');
        if (isLegacyMulti) {
          console.log('[Coupons] Detected legacy mock coupons. Resetting to single 8-fold initial coupon as requested.');
          localStorage.setItem('app_user_coupons', JSON.stringify([INITIAL_SINGLE_80_COUPON]));
          return [INITIAL_SINGLE_80_COUPON];
        }
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return [INITIAL_SINGLE_80_COUPON];
  });
  
  const [verification, setVerification] = useState<RealNameVerification>(() => {
    try {
      const saved = localStorage.getItem('app_user_verification');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return {
      isVerified: false,
      realName: '',
      idCardNumber: '',
      status: 'unverified'
    };
  });

  // Load cloud data from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCloudData() {
      try {
        console.log('[App] 🔄 Loading data from Supabase cloud database...');
        const cloudPosts = await getSupabaseCommunityPosts();
        if (isMounted) {
          if (cloudPosts && cloudPosts.length > 0) {
            console.log(`[App] 📥 Loaded ${cloudPosts.length} posts from Supabase.`);
            const cloudIds = new Set(cloudPosts.map(p => p.id));
            const merged = [
              ...cloudPosts,
              ...ALL_CITY_POSTS.filter(p => !cloudIds.has(p.id))
            ];
            setCommunityPosts(merged);
          } else {
            // Table in Supabase is currently empty, seed the initial posts so user sees them in Supabase
            console.log('[App] ⚡ Supabase table "community_posts" is empty. Seeding initial posts to Supabase...');
            for (const post of initialCommunityPosts.slice(0, 10)) {
              await insertSupabaseCommunityPost(post);
            }
          }
        }

        const cloudOrders = await getSupabaseOrders();
        if (isMounted && cloudOrders && cloudOrders.length > 0) {
          setOrders(cloudOrders);
        }

        const cloudVerif = await getSupabaseVerification(userPhone);
        if (isMounted && cloudVerif && cloudVerif.isVerified) {
          setVerification(cloudVerif);
        }

        // Load coupons from Supabase cloud database
        const cloudCoupons = await getSupabaseCoupons(userPhone);
        if (isMounted) {
          if (cloudCoupons && cloudCoupons.length > 0) {
            // Clean up any legacy mock coupons (cp-02 to cp-06)
            const cleaned = cloudCoupons.filter(
              c => c.id !== 'cp-02' && c.id !== 'cp-03' && c.id !== 'cp-04' && c.id !== 'cp-05' && c.id !== 'cp-06'
            );
            if (cleaned.length > 0) {
              setCoupons(cleaned);
              try {
                localStorage.setItem('app_user_coupons', JSON.stringify(cleaned));
              } catch (e) {}
            } else {
              setCoupons([INITIAL_SINGLE_80_COUPON]);
              await insertSupabaseCoupon(INITIAL_SINGLE_80_COUPON);
            }
          } else {
            // Seed the initial single 80% coupon to Supabase
            await insertSupabaseCoupon(INITIAL_SINGLE_80_COUPON);
          }
        }
      } catch (err) {
        console.warn('[App] Supabase initial load note:', err);
      }
    }
    loadCloudData();
    return () => {
      isMounted = false;
    };
  }, [userPhone]);

  const syncAllToSupabase = async (): Promise<number> => {
    let successCount = 0;
    try {
      console.log('[App] 🚀 Performing full manual sync to Supabase...');
      for (const p of communityPosts) {
        const res = await insertSupabaseCommunityPost(p);
        if (res.success) successCount++;
      }
      for (const o of orders) {
        await insertSupabaseOrder(o);
      }
      if (verification.isVerified) {
        await saveSupabaseVerification(verification, userPhone);
      }
      // Sync all coupons to Supabase
      const couponSyncRes = await syncCouponsToSupabase(coupons);
      if (couponSyncRes.success) {
        successCount += couponSyncRes.count;
      }
      // Sync user profile
      await saveSupabaseUserProfile({
        userId: `u-${userPhone}`,
        city: userAddress.city ? userAddress.city.replace('市', '') : currentCity,
        phone: userPhone,
        nickname: '和伴用户',
        wechatId: 'wx_user_' + userPhone.slice(-4),
        backupPhone: backupPhone,
        province: userAddress.province,
        district: userAddress.district,
        street: userAddress.street,
        detailAddress: userAddress.detail,
        formattedAddress: `${userAddress.province || ''}${userAddress.city || ''}${userAddress.district || ''}${userAddress.street || ''}${userAddress.detail || ''}`,
        realName: verification.realName,
        idCardNumber: verification.idCardNumber,
        verificationStatus: verification.status,
        userRole: 'client'
      });
    } catch (e) {
      console.error('[App] Manual sync exception:', e);
    }
    return successCount;
  };

  const updateVerification = (data: Partial<RealNameVerification>) => {
    setVerification(prev => {
      const next = { ...prev, ...data };
      try {
        localStorage.setItem('app_user_verification', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      // Save to Supabase in background
      saveSupabaseVerification(next, userPhone);
      return next;
    });
  };

  const resetVerification = () => {
    const unverified: RealNameVerification = {
      isVerified: false,
      realName: '',
      idCardNumber: '',
      status: 'unverified'
    };
    setVerification(unverified);
    try {
      localStorage.removeItem('app_user_verification');
    } catch (e) {
      // ignore
    }
  };

  const addOfficialCommunityPost = (postData: Omit<CommunityPost, 'id' | 'publishedTimeAgo'>): CommunityPost => {
    const newPost: CommunityPost = {
      ...postData,
      id: `case-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      publishedTimeAgo: '刚刚',
      isOfficialCase: true,
      status: postData.status || 'completed',
      likesCount: postData.likesCount || 1,
    };
    setCommunityPosts(prev => [newPost, ...prev]);
    insertSupabaseCommunityPost(newPost);
    return newPost;
  };

  const deleteCommunityPost = (id: string) => {
    setCommunityPosts(prev => prev.filter(p => p.id !== id));
    deleteSupabaseCommunityPost(id);
  };

  const addOrder = (draft: DraftOrder): Order => {
    const targetCity = draft.city || currentCity;
    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5)}`,
      title: draft.title,
      type: draft.type,
      city: targetCity,
      location: draft.location,
      time: draft.time,
      description: draft.description,
      publisher: '和伴用户',
      publisherId: 'current-user',
      phone: draft.phone || userPhone,
      createdAt: new Date().toISOString(),
      status: 'pending',
      estimatedDuration: draft.estimatedDuration || '2 小时',
      budget: draft.budget || '150 元',
      tips: draft.tips || ['请保持电话畅通，以便服务人员与您沟通'],
    };

    // User's order is kept strictly in their personal center
    setOrders(prev => [newOrder, ...prev]);

    // Save to Supabase user orders table
    insertSupabaseOrder(newOrder);

    // Simulate escort matching in background for user experience
    setTimeout(() => {
      setOrders(prev => prev.map(o => {
        if (o.id === newOrder.id && o.status === 'pending') {
          const updated = {
            ...o,
            status: 'accepted' as const,
            matchedEscort: {
              name: '张舒婷 (专业就医陪诊师)',
              phone: '13677889922',
              rating: '4.98',
              tag: '红十字急救员 · 5年陪护经验'
            }
          };
          insertSupabaseOrder(updated);
          return updated;
        }
        return o;
      }));
    }, 4000);

    return newOrder;
  };

  const cancelOrder = (id: string) => {
    // 保留在个人中心的订单记录（标记为已取消状态）
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        const updated = { ...order, status: 'cancelled' as const };
        insertSupabaseOrder(updated);
        return updated;
      }
      return order;
    }));
  };

  const completeOrder = (id: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        const updated = { ...order, status: 'completed' as const };
        insertSupabaseOrder(updated);
        return updated;
      }
      return order;
    }));
  };

  const toggleLikePost = (id: string) => {
    setCommunityPosts(prev => prev.map(post => {
      if (post.id === id) {
        const isLiked = !post.isLiked;
        const newLikes = isLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1);
        const updated = {
          ...post,
          isLiked,
          likesCount: newLikes
        };
        insertSupabaseCommunityPost(updated);
        return updated;
      }
      return post;
    }));
  };

  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, newMsg]);
    return newMsg;
  };

  const updateChatMessage = (id: string, updates: Partial<ChatMessage>) => {
    setChatMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const clearChat = () => {
    setChatMessages(initialChatMessages);
  };

  // Coupon Operations linked with Supabase
  const addCoupon = async (couponData: Omit<CouponItem, 'id'> | CouponItem): Promise<CouponItem> => {
    const newCoupon: CouponItem = {
      ...couponData,
      id: 'id' in couponData && couponData.id ? couponData.id : `cp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      status: couponData.status || 'available',
      discount: couponData.discount || '8折',
      discountRate: couponData.discountRate || 0.8,
      createdAt: couponData.createdAt || new Date().toISOString()
    };
    setCoupons(prev => {
      const next = [newCoupon, ...prev];
      try {
        localStorage.setItem('app_user_coupons', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    // Sync to Supabase in background
    await insertSupabaseCoupon(newCoupon);
    return newCoupon;
  };

  const updateCoupon = async (id: string, updates: Partial<CouponItem>): Promise<void> => {
    let targetCoupon: CouponItem | null = null;
    setCoupons(prev => {
      const next = prev.map(c => {
        if (c.id === id) {
          targetCoupon = { ...c, ...updates, updatedAt: new Date().toISOString() };
          return targetCoupon;
        }
        return c;
      });
      try {
        localStorage.setItem('app_user_coupons', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    if (targetCoupon) {
      await insertSupabaseCoupon(targetCoupon);
    }
  };

  const deleteCoupon = async (id: string): Promise<void> => {
    setCoupons(prev => {
      const next = prev.filter(c => c.id !== id);
      try {
        localStorage.setItem('app_user_coupons', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    await deleteSupabaseCoupon(id);
  };

  const useCoupon = async (id: string, orderTitle?: string): Promise<void> => {
    const usedDateStr = `${new Date().toLocaleDateString('zh-CN')}${orderTitle ? ` 已在「${orderTitle}」中抵扣8折` : ' 已在订单中抵扣8折'}`;
    await updateCoupon(id, {
      status: 'used',
      usedDate: usedDateStr
    });
  };

  const resetCouponsToInitial = async (): Promise<void> => {
    setCoupons([INITIAL_SINGLE_80_COUPON]);
    try {
      localStorage.setItem('app_user_coupons', JSON.stringify([INITIAL_SINGLE_80_COUPON]));
    } catch (e) {}
    await resetSupabaseCouponsToSingle(INITIAL_SINGLE_80_COUPON);
  };

  const syncCouponsWithSupabase = async (): Promise<number> => {
    setIsCouponsSyncing(true);
    try {
      const res = await syncCouponsToSupabase(coupons);
      return res.count;
    } finally {
      setIsCouponsSyncing(false);
    }
  };

  return (
    <AppContext.Provider value={{
      orders,
      addOrder,
      cancelOrder,
      completeOrder,
      chatMessages,
      addChatMessage,
      updateChatMessage,
      clearChat,
      userPhone,
      setUserPhone,
      backupPhone,
      setBackupPhone,
      userAddress,
      setUserAddress,
      communityPosts,
      addOfficialCommunityPost,
      deleteCommunityPost,
      toggleLikePost,
      currentCity,
      setCurrentCity,
      prefilledPrompt,
      setPrefilledPrompt,
      verification,
      updateVerification,
      resetVerification,
      isCloudConnected,
      syncAllToSupabase,
      coupons,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      useCoupon,
      resetCouponsToInitial,
      syncCouponsWithSupabase,
      isCouponsSyncing
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

