// 和伴平台统一服务分类与二级标准标签字典 (前端/管理后台/师傅技能认证共用)

export interface SubServiceItem {
  id: string;
  name: string;
  desc: string;
  tag: string;
  basePrice: {
    hour1: { min: number; max: number; def: number };
    hour2: { min: number; max: number; def: number };
    hour2_5: { min: number; max: number; def: number };
    halfDay: { min: number; max: number; def: number };
    fullDay: { min: number; max: number; def: number };
  };
}

export interface PrimaryCategory {
  id: string;
  name: string;
  fullName: string;
  tone: string;
  detail: string;
  subServices: SubServiceItem[];
}

export const PLATFORM_CATEGORIES: PrimaryCategory[] = [
  {
    id: 'medical',
    name: '医陪',
    fullName: '健康医陪',
    tone: 'blue',
    detail: '陪诊护工取药 · 专业持证',
    subServices: [
      {
        id: 'med-01',
        name: '医院全程陪诊',
        desc: '门诊看病全程陪同导诊、科室引导与医嘱记录',
        tag: '核心必备',
        basePrice: {
          hour1: { min: 60, max: 95, def: 80 },
          hour2: { min: 120, max: 180, def: 150 },
          hour2_5: { min: 150, max: 230, def: 180 },
          halfDay: { min: 200, max: 320, def: 260 },
          fullDay: { min: 380, max: 580, def: 480 }
        }
      },
      {
        id: 'med-02',
        name: '排队挂号建档',
        desc: '提早到院窗口/自助机建档、取号排队占位',
        tag: '高频代办',
        basePrice: {
          hour1: { min: 50, max: 80, def: 65 },
          hour2: { min: 90, max: 140, def: 120 },
          hour2_5: { min: 120, max: 180, def: 150 },
          halfDay: { min: 180, max: 260, def: 220 },
          fullDay: { min: 320, max: 480, def: 400 }
        }
      },
      {
        id: 'med-03',
        name: '代取药及化验报告',
        desc: '异地或行动不便患者代缴费取药、打印回执化验单',
        tag: '便民服务',
        basePrice: {
          hour1: { min: 45, max: 75, def: 60 },
          hour2: { min: 80, max: 130, def: 100 },
          hour2_5: { min: 100, max: 160, def: 130 },
          halfDay: { min: 160, max: 240, def: 200 },
          fullDay: { min: 300, max: 450, def: 360 }
        }
      },
      {
        id: 'med-04',
        name: '检查推椅与转运协助',
        desc: '老人/术后骨折行动不便者轮椅推行与多楼层检查护送',
        tag: '专业照护',
        basePrice: {
          hour1: { min: 65, max: 100, def: 85 },
          hour2: { min: 130, max: 190, def: 160 },
          hour2_5: { min: 160, max: 240, def: 200 },
          halfDay: { min: 220, max: 340, def: 280 },
          fullDay: { min: 400, max: 620, def: 520 }
        }
      },
      {
        id: 'med-05',
        name: '全流程住院陪护',
        desc: '床旁基础照料、陪夜协助、服药提醒与出院交接',
        tag: '深度陪护',
        basePrice: {
          hour1: { min: 70, max: 110, def: 90 },
          hour2: { min: 140, max: 210, def: 175 },
          hour2_5: { min: 175, max: 260, def: 220 },
          halfDay: { min: 240, max: 360, def: 300 },
          fullDay: { min: 420, max: 680, def: 560 }
        }
      }
    ]
  },
  {
    id: 'pet',
    name: '宠陪',
    fullName: '宠物陪伴',
    tone: 'green',
    detail: '各类宠物 · 上门照顾 · 安心陪伴',
    subServices: [
      {
        id: 'pet-01',
        name: '上门喂养照料',
        desc: '定时换粮加净水、清洁清洗食盆与猫砂盆、拍摄反馈视频',
        tag: '核心必备',
        basePrice: {
          hour1: { min: 35, max: 55, def: 45 },
          hour2: { min: 60, max: 95, def: 75 },
          hour2_5: { min: 75, max: 120, def: 90 },
          halfDay: { min: 120, max: 190, def: 150 },
          fullDay: { min: 220, max: 360, def: 280 }
        }
      },
      {
        id: 'pet-02',
        name: '遛宠户外陪跑',
        desc: '带犬外出运动排便、牵引防爆冲防护、足部清洁消毒',
        tag: '日常刚需',
        basePrice: {
          hour1: { min: 40, max: 65, def: 50 },
          hour2: { min: 70, max: 110, def: 90 },
          hour2_5: { min: 85, max: 135, def: 110 },
          halfDay: { min: 140, max: 210, def: 175 },
          fullDay: { min: 250, max: 400, def: 320 }
        }
      },
      {
        id: 'pet-03',
        name: '梳毛互动玩耍',
        desc: '陪伴逗宠互动解闷、毛发梳理与眼耳常规卫生护理',
        tag: '情绪呵护',
        basePrice: {
          hour1: { min: 35, max: 55, def: 45 },
          hour2: { min: 60, max: 95, def: 75 },
          hour2_5: { min: 75, max: 120, def: 90 },
          halfDay: { min: 120, max: 190, def: 150 },
          fullDay: { min: 220, max: 360, def: 280 }
        }
      },
      {
        id: 'pet-04',
        name: '宠物送医就诊陪护',
        desc: '专车/步行陪送至同城宠物医院、协助打针做检查与复诊',
        tag: '医疗专办',
        basePrice: {
          hour1: { min: 50, max: 80, def: 65 },
          hour2: { min: 90, max: 140, def: 115 },
          hour2_5: { min: 110, max: 170, def: 140 },
          halfDay: { min: 180, max: 270, def: 225 },
          fullDay: { min: 320, max: 500, def: 410 }
        }
      },
      {
        id: 'pet-05',
        name: '洗护接送与短期看护',
        desc: '代送宠物洗澡美容、或短期家中上门看照',
        tag: '生活代劳',
        basePrice: {
          hour1: { min: 45, max: 70, def: 55 },
          hour2: { min: 80, max: 125, def: 100 },
          hour2_5: { min: 95, max: 150, def: 120 },
          halfDay: { min: 160, max: 240, def: 195 },
          fullDay: { min: 280, max: 440, def: 350 }
        }
      }
    ]
  },
  {
    id: 'life',
    name: '生活便捷',
    fullName: '生活便捷',
    tone: 'red',
    detail: '即时代办 · 任务跑腿',
    subServices: [
      {
        id: 'life-01',
        name: '代取代送',
        desc: '文件钥匙、重要物品、生鲜同城加急递送',
        tag: '极速代送',
        basePrice: {
          hour1: { min: 30, max: 50, def: 40 },
          hour2: { min: 55, max: 85, def: 70 },
          hour2_5: { min: 70, max: 110, def: 88 },
          halfDay: { min: 110, max: 170, def: 135 },
          fullDay: { min: 200, max: 320, def: 250 }
        }
      },
      {
        id: 'life-02',
        name: '排队办事',
        desc: '政务大厅、商圈餐厅、银行网点现场排号占位',
        tag: '省时办事',
        basePrice: {
          hour1: { min: 35, max: 60, def: 45 },
          hour2: { min: 65, max: 100, def: 80 },
          hour2_5: { min: 80, max: 125, def: 100 },
          halfDay: { min: 130, max: 190, def: 160 },
          fullDay: { min: 240, max: 360, def: 300 }
        }
      },
      {
        id: 'life-03',
        name: '物品搬运',
        desc: '轻量行李搬动、居家大件重物移动协助',
        tag: '体力支援',
        basePrice: {
          hour1: { min: 45, max: 75, def: 60 },
          hour2: { min: 85, max: 130, def: 110 },
          hour2_5: { min: 105, max: 165, def: 135 },
          halfDay: { min: 170, max: 250, def: 210 },
          fullDay: { min: 300, max: 480, def: 390 }
        }
      },
      {
        id: 'life-04',
        name: '临时跑腿',
        desc: '个性化日常琐事、就近采购与突发代办事项',
        tag: '随需应变',
        basePrice: {
          hour1: { min: 30, max: 55, def: 40 },
          hour2: { min: 60, max: 95, def: 75 },
          hour2_5: { min: 75, max: 120, def: 95 },
          halfDay: { min: 120, max: 180, def: 150 },
          fullDay: { min: 220, max: 340, def: 275 }
        }
      }
    ]
  },
  {
    id: 'travel',
    name: '旅陪',
    fullName: '旅陪服务',
    tone: 'amber',
    detail: '出行陪同 · 行程协助',
    subServices: [
      {
        id: 'travel-01',
        name: '车站接送陪同',
        desc: '高铁站/机场接送机引路、托运行李搬运与安检协助',
        tag: '出行护送',
        basePrice: {
          hour1: { min: 50, max: 80, def: 65 },
          hour2: { min: 95, max: 150, def: 120 },
          hour2_5: { min: 120, max: 185, def: 150 },
          halfDay: { min: 190, max: 280, def: 235 },
          fullDay: { min: 350, max: 520, def: 420 }
        }
      },
      {
        id: 'travel-02',
        name: '旅途全程随行',
        desc: '长途列车/飞机全程跟随照看、旅途解闷与安全防护',
        tag: '全天安心',
        basePrice: {
          hour1: { min: 60, max: 95, def: 80 },
          hour2: { min: 120, max: 180, def: 150 },
          hour2_5: { min: 150, max: 230, def: 185 },
          halfDay: { min: 240, max: 360, def: 300 },
          fullDay: { min: 420, max: 660, def: 520 }
        }
      },
      {
        id: 'travel-03',
        name: '行程规划协助',
        desc: '量身定制出行路线、酒店车票预订及行程管家协调',
        tag: '智能规划',
        basePrice: {
          hour1: { min: 40, max: 65, def: 50 },
          hour2: { min: 75, max: 120, def: 95 },
          hour2_5: { min: 95, max: 150, def: 120 },
          halfDay: { min: 150, max: 230, def: 190 },
          fullDay: { min: 280, max: 420, def: 340 }
        }
      }
    ]
  },
  {
    id: 'tour',
    name: '游陪',
    fullName: '游陪服务',
    tone: 'violet',
    detail: '休闲出游 · 轻松陪伴',
    subServices: [
      {
        id: 'tour-01',
        name: '景点景区陪游',
        desc: '名胜古迹陪走导览、拍照留影、路线引导与避坑建议',
        tag: '同城漫步',
        basePrice: {
          hour1: { min: 50, max: 80, def: 65 },
          hour2: { min: 95, max: 150, def: 120 },
          hour2_5: { min: 120, max: 185, def: 150 },
          halfDay: { min: 190, max: 280, def: 235 },
          fullDay: { min: 350, max: 540, def: 430 }
        }
      },
      {
        id: 'tour-02',
        name: '展会活动陪同',
        desc: '艺术展览、演唱会、话剧现场搭子式陪伴与排队检票',
        tag: '文化休闲',
        basePrice: {
          hour1: { min: 55, max: 85, def: 70 },
          hour2: { min: 100, max: 160, def: 130 },
          hour2_5: { min: 125, max: 195, def: 160 },
          halfDay: { min: 200, max: 300, def: 250 },
          fullDay: { min: 380, max: 580, def: 460 }
        }
      },
      {
        id: 'tour-03',
        name: '城市慢游搭子',
        desc: '特色街区打卡、咖啡探店、美食打卡与轻松聊天陪伴',
        tag: '情绪伙伴',
        basePrice: {
          hour1: { min: 45, max: 70, def: 55 },
          hour2: { min: 85, max: 135, def: 110 },
          hour2_5: { min: 105, max: 165, def: 135 },
          halfDay: { min: 170, max: 250, def: 210 },
          fullDay: { min: 310, max: 480, def: 380 }
        }
      }
    ]
  }
];

export function getSubServicesByCategory(catId: string): string[] {
  const cat = PLATFORM_CATEGORIES.find(c => c.id === catId || c.fullName === catId || c.name === catId);
  return cat ? cat.subServices.map(s => s.name) : [];
}

export function calculatePlatformPriceRange(
  catId: string,
  dur: string,
  serviceCount: number = 1
) {
  const cat = PLATFORM_CATEGORIES.find(c => c.id === catId || c.fullName === catId || c.name === catId) || PLATFORM_CATEGORIES[0];
  const count = Math.max(1, serviceCount);

  let key: 'hour1' | 'hour2' | 'hour2_5' | 'halfDay' | 'fullDay' = 'hour2_5';
  if (dur.includes('1 小时')) key = 'hour1';
  else if (dur.includes('2.0 小时')) key = 'hour2';
  else if (dur.includes('2.5 小时')) key = 'hour2_5';
  else if (dur.includes('4.0') || dur.includes('半天')) key = 'halfDay';
  else if (dur.includes('8.0') || dur.includes('全天')) key = 'fullDay';

  const base = cat.subServices[0].basePrice[key];
  const totalMin = Math.round(base.min + (count - 1) * (base.min * 0.65));
  const totalMax = Math.round(base.max + (count - 1) * (base.max * 0.65));
  const totalDef = Math.round(base.def + (count - 1) * (base.def * 0.65));

  return {
    min: totalMin,
    max: totalMax,
    def: String(totalDef),
    label: totalMin + ' ~ ' + totalMax + ' 元'
  };
}


export function calculateCustomServicesPriceRange(
  serviceNames: string[],
  dur: string,
  fallbackCatId: string = 'medical'
) {
  let key: 'hour1' | 'hour2' | 'hour2_5' | 'halfDay' | 'fullDay' = 'hour2_5';
  if (dur.includes('1 小时')) key = 'hour1';
  else if (dur.includes('2.0 小时')) key = 'hour2';
  else if (dur.includes('2.5 小时')) key = 'hour2_5';
  else if (dur.includes('4.0') || dur.includes('半天')) key = 'halfDay';
  else if (dur.includes('8.0') || dur.includes('全天')) key = 'fullDay';

  const allSubServices: SubServiceItem[] = [];
  PLATFORM_CATEGORIES.forEach(c => allSubServices.push(...c.subServices));

  // 找到匹配的小项
  const matched = serviceNames
    .map(name => allSubServices.find(s => s.name === name))
    .filter(Boolean) as SubServiceItem[];

  if (matched.length === 0) {
    // 回退到默认分类第一项
    return calculatePlatformPriceRange(fallbackCatId, dur, 1);
  }

  // 累加逻辑：第一项按原价，后续项叠加（每多选一项，增加其区间价的 70% 作为增项组合优惠，最低价与最高价均精确累加）
  let totalMin = 0;
  let totalMax = 0;
  let totalDef = 0;

  matched.forEach((item, index) => {
    const p = item.basePrice[key];
    if (index === 0) {
      totalMin += p.min;
      totalMax += p.max;
      totalDef += p.def;
    } else {
      totalMax += Math.round(p.max * 0.7);
      totalDef += Math.round(p.def * 0.7);
    }
  });

  return {
    min: totalMin,
    max: totalMax,
    def: String(totalDef),
    label: `${totalMin} ~ ${totalMax} 元`
  };
}
