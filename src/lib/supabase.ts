import { createClient } from '@supabase/supabase-js';
import { Order, CommunityPost, RealNameVerification, CouponItem } from '../types';

function sanitizeUrl(rawUrl?: string): string {
  let url = (rawUrl || '').trim();
  // Strip trailing /rest/v1 or /rest/v1/ or trailing slashes
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/+$/, '');
  return url || 'https://rniahxucegfrxnkenews.supabase.co';
}

const RAW_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://rniahxucegfrxnkenews.supabase.co';
const SUPABASE_URL = sanitizeUrl(RAW_URL);
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaWFoeHVjZWdmcnhua2VuZXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NjY4NDMsImV4cCI6MjEwMjQ0Mjg0M30.6KXcmb82lhOJ8f6E4BRm21VYmTG2Xphkz0oFUuz_-Xo';

console.log('[Supabase] Initializing client with URL:', SUPABASE_URL);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

const KNOWN_CITIES = [
  '北京', '西安', '上海', '成都', '福州', '昆明', '乌鲁木齐', 
  '郑州', '广州', '深圳', '杭州', '武汉', '南京', '重庆', 
  '天津', '苏州', '长沙', '沈阳', '青岛', '济南', '合肥', '哈尔滨'
];

function inferCity(data: { city?: string; district?: string; location?: string; title?: string }): string {
  if (data.city && KNOWN_CITIES.includes(data.city)) return data.city;
  const combined = `${data.city || ''} ${data.district || ''} ${data.location || ''} ${data.title || ''}`;
  for (const c of KNOWN_CITIES) {
    if (combined.includes(c)) return c;
  }
  return data.city || '北京';
}

/**
 * Fetch all orders from Supabase
 */
export async function getSupabaseOrders(): Promise<Order[] | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] getOrders error:', error.message);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      type: row.type,
      city: inferCity({
        city: row.city,
        location: row.formatted_address || row.location,
        title: row.title,
      }),
      location: row.formatted_address || row.location,
      formattedAddress: row.formatted_address || row.location,
      time: row.service_start_time || row.time,
      serviceStartTime: row.service_start_time || row.time,
      description: row.remark || row.description || '',
      remark: row.remark || row.description || '',
      publisher: row.publisher || '和伴用户',
      publisherId: 'current-user',
      wechatId: row.wechat_id || 'wx_user_' + (row.phone ? row.phone.slice(-4) : 'guest'),
      phone: row.phone,
      createdAt: row.publish_time || row.created_at,
      publishTime: row.publish_time || row.created_at,
      status: row.status as any,
      budget: row.amount || row.budget || '150 元',
      amount: row.amount || row.budget || '150 元',
      estimatedDuration: row.service_duration || row.estimated_duration || '2 小时',
      serviceDuration: row.service_duration || row.estimated_duration || '2 小时',
      tips: Array.isArray(row.tips) ? row.tips : typeof row.tips === 'string' ? [row.tips] : ['请保持电话畅通，以便服务人员与您沟通'],
      servicePhotos: Array.isArray(row.service_photos) ? row.service_photos : [],
      matchedEscort: row.escort_name ? {
        id: row.escort_id || undefined,
        name: row.escort_name,
        phone: row.escort_phone || '',
        tag: row.escort_tag || '专业陪诊师',
        rating: row.escort_rating || '4.98'
      } : row.matched_escort || (row.status === 'accepted' ? {
        id: row.escort_id || 'escort-bj-01',
        name: row.escort_name || '李明辉 (三甲陪诊师)',
        phone: row.escort_phone || '13788990011',
        rating: '4.99',
        tag: '已实名认证 · 6年就医陪护'
      } : undefined)
    }));
  } catch (err) {
    console.warn('[Supabase] network error (getOrders):', err);
    return null;
  }
}

/**
 * Insert or update an order in Supabase
 */
export async function insertSupabaseOrder(order: Order): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Supabase] 📤 Inserting order to Supabase table "orders":', order.id, order.title);
    
    const detectedCity = order.city || inferCity({
      city: order.city,
      location: order.formattedAddress || order.location,
      title: order.title
    });

    const payload: any = {
      id: order.id,
      title: order.title,
      type: order.type,
      city: detectedCity,
      location: order.formattedAddress || order.location,
      formatted_address: order.formattedAddress || order.location,
      time: order.serviceStartTime || order.time,
      service_start_time: order.serviceStartTime || order.time,
      description: order.remark || order.description || '',
      remark: order.remark || order.description || '',
      publisher: order.publisher || '和伴用户',
      wechat_id: order.wechatId || ('wx_user_' + (order.phone ? order.phone.slice(-4) : 'guest')),
      phone: order.phone || '13800000000',
      status: order.status || 'pending',
      budget: order.amount || order.budget || '150 元',
      amount: order.amount || order.budget || '150 元',
      estimated_duration: order.serviceDuration || order.estimatedDuration || '2 小时',
      service_duration: order.serviceDuration || order.estimatedDuration || '2 小时',
      tips: order.tips || ['请保持电话畅通，以便服务人员与您沟通'],
      service_photos: order.servicePhotos || [],
      escort_id: order.matchedEscort?.id || (order.status === 'accepted' ? 'escort-bj-01' : null),
      escort_name: order.matchedEscort?.name || (order.status === 'accepted' ? '李明辉' : null),
      escort_phone: order.matchedEscort?.phone || (order.status === 'accepted' ? '13788990011' : null),
      escort_tag: order.matchedEscort?.tag || (order.status === 'accepted' ? '已实名认证 · 6年就医陪护' : null),
      created_at: order.publishTime || order.createdAt || new Date().toISOString(),
      publish_time: order.publishTime || order.createdAt || new Date().toISOString()
    };

    let { error } = await supabase.from('orders').upsert(payload);

    // If some columns do not exist yet in Supabase schema, retry with basic payload
    if (error && error.message) {
      console.warn('[Supabase] ⚠️ Initial upsert note, trying fallback payload:', error.message);
      const basicPayload: any = {
        id: order.id,
        title: order.title,
        type: order.type,
        city: detectedCity,
        location: order.formattedAddress || order.location,
        time: order.serviceStartTime || order.time,
        description: order.remark || order.description || '',
        publisher: order.publisher || '和伴用户',
        phone: order.phone || '13800000000',
        status: order.status || 'pending',
        budget: order.amount || order.budget || '150 元',
        estimated_duration: order.serviceDuration || order.estimatedDuration || '2 小时',
        tips: order.tips || ['请保持电话畅通，以便服务人员与您沟通'],
        created_at: order.publishTime || order.createdAt || new Date().toISOString()
      };
      const retryResult = await supabase.from('orders').upsert(basicPayload);
      error = retryResult.error;
    }

    if (error) {
      console.error('[Supabase] ❌ insertSupabaseOrder failed:', error.message, error.details);
      return { success: false, error: error.message };
    }
    
    console.log('[Supabase] ✅ insertSupabaseOrder successfully written to cloud database!');
    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] ❌ network exception (insertOrder):', err);
    return { success: false, error: err.message || '网络连接异常' };
  }
}

/**
 * Fetch community posts from Supabase
 */
export async function getSupabaseCommunityPosts(): Promise<CommunityPost[] | null> {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] getCommunityPosts warning:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((row: any) => {
      const city = inferCity({
        city: row.city,
        district: row.district,
        location: row.location,
        title: row.title,
      });

      let district = row.district || '同城区域';
      if (district.startsWith(`${city} · `)) {
        district = district.replace(`${city} · `, '');
      }

      return {
        id: row.id,
        title: row.title,
        type: row.type || row.order_type || '医疗陪诊',
        city: city,
        district: district,
        location: row.location || row.detail_address || '',
        serviceHospital: row.service_hospital || row.location || '',
        time: row.time || row.service_time || '近期',
        description: row.description || row.case_story || '',
        coverImage: row.cover_image || (Array.isArray(row.images) && row.images[0]) || row.coverImage,
        images: Array.isArray(row.images) ? row.images : row.cover_image ? [row.cover_image] : [],
        publisherName: row.publisher_name || row.publisherName || '和伴用户',
        publisherAvatar: row.publisher_avatar || row.publisherAvatar,
        publishedTimeAgo: row.published_time_ago || '刚刚',
        status: (row.status as any) || 'completed',
        likesCount: row.likes_count || row.likesCount || 0,
        isLiked: false,
        isOfficialCase: row.is_official_case ?? true,
        budget: row.budget || '180 元',
        estimatedDuration: row.estimated_duration || row.estimatedDuration || '2 小时',
        tags: Array.isArray(row.tags) ? row.tags : ['官方精选', '真实案例'],
        escortName: row.escort_name || '李明辉 (资深陪诊师)',
        escortAvatar: row.escort_avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80',
        escortRating: row.escort_rating || '4.98',
        serviceScore: row.service_score || 5.0,
        serviceReview: row.service_review || '师傅服务专业细致，沟通温和让人安心。'
      };
    });
  } catch (err) {
    console.warn('[Supabase] network error (getCommunityPosts):', err);
    return null;
  }
}

/**
 * Insert community post to Supabase
 */
export async function insertSupabaseCommunityPost(post: CommunityPost): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Supabase] 📤 Inserting post to Supabase table "community_posts":', post.id, post.title);

    const postCity = post.city || '北京';
    const districtWithCity = post.district?.includes(postCity)
      ? post.district
      : `${postCity} · ${post.district || '同城区域'}`;

    const payload: any = {
      id: post.id,
      title: post.title,
      type: post.type,
      order_type: post.type,
      city: postCity,
      district: post.district || '市辖区',
      location: post.location || '',
      service_hospital: post.serviceHospital || post.location || '',
      time: post.time || new Date().toLocaleString(),
      service_time: post.time || new Date().toLocaleString(),
      description: post.description || '',
      case_story: post.description || '',
      cover_image: post.coverImage || (post.images && post.images[0]) || '',
      images: post.images || (post.coverImage ? [post.coverImage] : []),
      publisher_name: post.publisherName || '和伴用户',
      publisher_avatar: post.publisherAvatar || '',
      status: post.status || 'completed',
      likes_count: post.likesCount || 0,
      budget: post.budget || '150 元',
      estimated_duration: post.estimatedDuration || '2 小时',
      tags: post.tags || ['同城案例', '官方精选'],
      is_official_case: post.isOfficialCase ?? true,
      escort_name: post.escortName || '',
      escort_avatar: post.escortAvatar || '',
      escort_rating: post.escortRating || '4.98',
      service_score: post.serviceScore || 5.0,
      service_review: post.serviceReview || '',
      created_at: new Date().toISOString()
    };

    let { error } = await supabase.from('community_posts').upsert(payload);

    // If city column does not exist in Supabase schema, retry without city field (city is preserved in district)
    if (error && error.message && error.message.includes("'city'")) {
      console.warn('[Supabase] ⚠️ city column not in community_posts schema, retrying with city in district...');
      delete payload.city;
      const retryResult = await supabase.from('community_posts').upsert(payload);
      error = retryResult.error;
    }

    if (error) {
      if (error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        console.warn('[Supabase] ℹ️ community_posts table not yet created in Supabase database. Falling back to local storage cache. To sync to cloud, create the table in Supabase SQL Editor.');
      } else {
        console.warn('[Supabase] ⚠️ insertSupabaseCommunityPost warning:', error.message);
      }
      return { success: false, error: error.message };
    }

    console.log('[Supabase] ✅ insertSupabaseCommunityPost successfully written to cloud database!');
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase] ℹ️ Community post saved to local cache (Supabase offline/unreachable):', err?.message || err);
    return { success: false, error: err.message || '网络连接异常' };
  }
}

/**
 * Delete community post from Supabase
 */
export async function deleteSupabaseCommunityPost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Supabase] 🗑️ Deleting post from Supabase table "community_posts":', postId);
    const { error } = await supabase.from('community_posts').delete().eq('id', postId);
    if (error) {
      console.warn('[Supabase] ⚠️ deleteSupabaseCommunityPost warning:', error.message);
      return { success: false, error: error.message };
    }
    console.log('[Supabase] ✅ deleteSupabaseCommunityPost successfully removed from cloud database!');
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase] network exception (deleteCommunityPost):', err);
    return { success: false, error: err.message || '网络连接异常' };
  }
}

/**
 * Save Real-Name verification to Supabase
 */
export async function saveSupabaseVerification(
  verification: RealNameVerification,
  userPhone: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Supabase] 📤 Saving verification to table "user_verifications":', userPhone);
    const { data, error } = await supabase.from('user_verifications').upsert({
      user_phone: userPhone,
      real_name: verification.realName,
      id_card_number: verification.idCardNumber,
      status: verification.status,
      verified_at: verification.verifiedAt || new Date().toLocaleDateString('zh-CN'),
      created_at: new Date().toISOString()
    }, { onConflict: 'user_phone' });

    if (error) {
      if (error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        console.warn('[Supabase] ℹ️ user_verifications table not yet created in Supabase database. Verification saved locally in browser cache.');
      } else {
        console.warn('[Supabase] ⚠️ saveVerification warning:', error.message);
      }
      return { success: false, error: error.message };
    }
    console.log('[Supabase] ✅ saveVerification successfully written!');
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase] ℹ️ Verification saved locally (Supabase offline/unreachable):', err?.message || err);
    return { success: false, error: err.message || '网络连接异常' };
  }
}

/**
 * Fetch Real-Name verification from Supabase
 */
export async function getSupabaseVerification(userPhone: string): Promise<RealNameVerification | null> {
  try {
    const { data, error } = await supabase
      .from('user_verifications')
      .select('*')
      .eq('user_phone', userPhone)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      isVerified: data.status === 'verified',
      realName: data.real_name,
      idCardNumber: data.id_card_number,
      verifiedAt: data.verified_at,
      status: data.status,
    };
  } catch (err) {
    console.warn('[Supabase] network error (getVerification):', err);
    return null;
  }
}

/**
 * Save User Profile to Supabase table "user_profiles"
 */
export async function saveSupabaseUserProfile(profile: {
  userId: string;
  city: string;
  phone: string;
  nickname: string;
  wechatId?: string;
  backupPhone?: string;
  province?: string;
  district?: string;
  street?: string;
  detailAddress?: string;
  formattedAddress?: string;
  realName?: string;
  idCardNumber?: string;
  verificationStatus?: string;
  userRole?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Supabase] 📤 Saving user profile to table "user_profiles":', profile.phone, profile.city);
    const payload = {
      user_id: profile.userId || `u-${profile.phone}`,
      city: profile.city || '北京',
      phone: profile.phone,
      nickname: profile.nickname || '和伴用户',
      wechat_id: profile.wechatId || ('wx_user_' + profile.phone.slice(-4)),
      backup_phone: profile.backupPhone || '',
      province: profile.province || '',
      district: profile.district || '',
      street: profile.street || '',
      detail_address: profile.detailAddress || '',
      formatted_address: profile.formattedAddress || `${profile.province || ''}${profile.city || ''}${profile.district || ''}${profile.detailAddress || ''}`,
      real_name: profile.realName || '',
      id_card_number: profile.idCardNumber || '',
      verification_status: profile.verificationStatus || 'unverified',
      user_role: profile.userRole || 'client',
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('user_profiles').upsert(payload, { onConflict: 'user_id' });

    if (error) {
      if (error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        console.warn('[Supabase] ℹ️ user_profiles table not yet created in Supabase. You can create it in Supabase SQL Editor.');
      } else {
        console.warn('[Supabase] ⚠️ saveSupabaseUserProfile warning:', error.message);
      }
      return { success: false, error: error.message };
    }
    console.log('[Supabase] ✅ saveSupabaseUserProfile successfully synced!');
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase] ℹ️ saveSupabaseUserProfile exception:', err?.message || err);
    return { success: false, error: err?.message || '网络连接异常' };
  }
}

/**
 * Fetch User Profile from Supabase
 */
export async function getSupabaseUserProfile(phone: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.warn('[Supabase] network error (getUserProfile):', err);
    return null;
  }
}

/**
 * Supabase SQL table definition for coupons / props
 */
export const COUPONS_TABLE_SQL = `-- 在 Supabase SQL Editor 中执行以下语句以支持【道具/优惠券】持久化：
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  discount TEXT DEFAULT '8折',
  discount_rate NUMERIC DEFAULT 0.8,
  category TEXT DEFAULT '全品类',
  description TEXT,
  valid_until TEXT,
  status TEXT DEFAULT 'available',
  code TEXT UNIQUE,
  min_spend TEXT DEFAULT '无门槛',
  used_date TEXT,
  user_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 开启行级安全并允许全部公开读写（演示/轻量环境）
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Allow all insert coupons" ON coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update coupons" ON coupons FOR UPDATE USING (true);
CREATE POLICY "Allow all delete coupons" ON coupons FOR DELETE USING (true);
`;

/**
 * Fetch all coupons from Supabase table "coupons"
 */
export async function getSupabaseCoupons(userPhone?: string): Promise<CouponItem[] | null> {
  try {
    let query = supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (userPhone) {
      // Allow coupons for this user phone or general coupons (user_phone is null or 'all')
      query = query.or(`user_phone.eq.${userPhone},user_phone.is.null,user_phone.eq.all`);
    }

    const { data, error } = await query;

    if (error) {
      if (error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        console.warn('[Supabase] ℹ️ "coupons" table not yet created in Supabase database. Falling back to local storage.');
      } else {
        console.warn('[Supabase] getCoupons error:', error.message);
      }
      return null;
    }

    if (!data || data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      discount: row.discount || '8折',
      discountRate: Number(row.discount_rate) || 0.8,
      category: row.category || '全品类',
      description: row.description || '',
      validUntil: row.valid_until || '2026-12-31',
      status: (row.status as any) || 'available',
      code: row.code || 'BENEFIT80',
      minSpend: row.min_spend || '无门槛',
      usedDate: row.used_date || undefined,
      userPhone: row.user_phone || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (err) {
    console.warn('[Supabase] network error (getCoupons):', err);
    return null;
  }
}

/**
 * Insert or upsert a coupon in Supabase
 */
export async function insertSupabaseCoupon(coupon: CouponItem): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Supabase] 📤 Inserting coupon to "coupons":', coupon.id, coupon.name);

    const payload = {
      id: coupon.id,
      name: coupon.name,
      discount: coupon.discount || '8折',
      discount_rate: coupon.discountRate || 0.8,
      category: coupon.category || '全品类',
      description: coupon.description || '',
      valid_until: coupon.validUntil,
      status: coupon.status || 'available',
      code: coupon.code,
      min_spend: coupon.minSpend || '无门槛',
      used_date: coupon.usedDate || null,
      user_phone: coupon.userPhone || null,
      created_at: coupon.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('coupons').upsert(payload, { onConflict: 'id' });

    if (error) {
      if (error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        console.warn('[Supabase] ℹ️ "coupons" table does not exist in Supabase. Storing in local cache.');
      } else {
        console.warn('[Supabase] ⚠️ insertSupabaseCoupon failed:', error.message);
      }
      return { success: false, error: error.message };
    }

    console.log('[Supabase] ✅ Coupon synced successfully:', coupon.id);
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase] ℹ️ Coupon saved to local cache (network/offline):', err?.message || err);
    return { success: false, error: err?.message || '网络连接异常' };
  }
}

/**
 * Delete a coupon from Supabase
 */
export async function deleteSupabaseCoupon(couponId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Supabase] 🗑️ Deleting coupon from "coupons":', couponId);
    const { error } = await supabase.from('coupons').delete().eq('id', couponId);

    if (error) {
      console.warn('[Supabase] ⚠️ deleteSupabaseCoupon error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Supabase] ✅ Coupon deleted from Supabase:', couponId);
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase] network error (deleteCoupon):', err);
    return { success: false, error: err?.message || '网络连接异常' };
  }
}

/**
 * Batch sync all coupons to Supabase
 */
export async function syncCouponsToSupabase(coupons: CouponItem[]): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    console.log('[Supabase] 🚀 Batch syncing coupons to Supabase, count:', coupons.length);
    let synced = 0;
    for (const c of coupons) {
      const res = await insertSupabaseCoupon(c);
      if (res.success) synced++;
    }
    return { success: true, count: synced };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || '网络异常' };
  }
}

/**
 * Reset Supabase coupons table to only contain the single 8-fold coupon
 */
export async function resetSupabaseCouponsToSingle(initialCoupon: CouponItem): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete all other coupons first
    await supabase.from('coupons').delete().neq('id', initialCoupon.id);
    // Upsert the single initial coupon
    const res = await insertSupabaseCoupon(initialCoupon);
    return res;
  } catch (err: any) {
    return { success: false, error: err?.message || '重置异常' };
  }
}

