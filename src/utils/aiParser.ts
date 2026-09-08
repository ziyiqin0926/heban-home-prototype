import { DraftOrder } from '../types';

export interface ParseResult {
  reply: string;
  draftOrder?: DraftOrder;
  isUpdate?: boolean;
}

// Smart NLP parsing and response generator for Care & Escort assistant
export function parseUserRequest(
  text: string,
  previousDraft?: DraftOrder | null,
  userPhone: string = '13800138000'
): ParseResult {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // Check if it's just a general greeting or short inquiry
  if (/^(你好|您好|hi|hello|在吗|哈喽|早上好|下午好|晚上好)$/i.test(trimmed)) {
    return {
      reply: '您好！我是和伴 AI 陪护管家。请随时告诉我您的需求（如：老人就医陪诊、跑腿代办取药、轮椅看护等），我会为您智能分析并生成标准化服务需求单！',
      draftOrder: previousDraft || undefined,
    };
  }

  // Check if it's an update to previous draft
  if (previousDraft) {
    let updated = { ...previousDraft };
    let hasChanged = false;
    let changeDescription = '';

    // Check phone update
    const phoneMatch = trimmed.match(/(?:1[3-9]\d{9})/);
    if (phoneMatch && (trimmed.includes('电话') || trimmed.includes('手机') || trimmed.includes('改'))) {
      updated.phone = phoneMatch[0];
      hasChanged = true;
      changeDescription += `手机号更新为 ${updated.phone}；`;
    }

    // Check budget / price update
    if (trimmed.includes('金额') || trimmed.includes('预算') || trimmed.includes('报酬') || trimmed.includes('费用') || trimmed.includes('元') || trimmed.includes('块')) {
      const budgetMatch = extractBudget(trimmed);
      if (budgetMatch) {
        updated.budget = budgetMatch;
        hasChanged = true;
        changeDescription += `期望金额更新为 ${updated.budget}；`;
      }
    }

    // Check time update
    if (trimmed.includes('改') && (trimmed.includes('点') || trimmed.includes('分') || trimmed.includes('上午') || trimmed.includes('下午') || trimmed.includes('明天') || trimmed.includes('后天') || trimmed.includes('今天') || trimmed.includes('周'))) {
      const extractedTime = extractTime(trimmed);
      if (extractedTime) {
        updated.time = extractedTime;
        hasChanged = true;
        changeDescription += `服务时间更新为 ${updated.time}；`;
      }
    }

    // Check location update
    if ((trimmed.includes('地点') || trimmed.includes('位置') || trimmed.includes('医院') || trimmed.includes('去')) && (trimmed.includes('改') || trimmed.includes('换成') || trimmed.includes('设为'))) {
      const locMatch = trimmed.match(/(?:改成|换成|设为|地点在|在)\s*([^，。！？,!\n]+)/);
      if (locMatch && locMatch[1]) {
        updated.location = locMatch[1].trim();
        hasChanged = true;
        changeDescription += `地点更新为 ${updated.location}；`;
      }
    }

    // Check extra note/detail addition
    if (trimmed.includes('补充') || trimmed.includes('备注') || trimmed.includes('加一下') || trimmed.includes('需要轮椅') || trimmed.includes('需要带')) {
      updated.description += ` 【补充说明：${trimmed.replace(/^(补充|备注|加一下)[：:]?\s*/, '')}】`;
      hasChanged = true;
      changeDescription += `已添加补充要求；`;
    }

    if (hasChanged) {
      return {
        reply: `已根据您的指示更新需求信息（${changeDescription}）。请查看下方最新的需求卡片，确认无误后可一键发布。`,
        draftOrder: updated,
        isUpdate: true,
      };
    }
  }

  // Extract service type
  let type = '医疗陪诊';
  if (trimmed.includes('猫') || trimmed.includes('狗') || trimmed.includes('宠') || trimmed.includes('喂粮') || trimmed.includes('铲屎') || trimmed.includes('遛狗')) {
    type = '宠物陪伴';
  } else if (trimmed.includes('散步') || trimmed.includes('老人') || trimmed.includes('长者') || trimmed.includes('聊天') || trimmed.includes('解闷') || trimmed.includes('同城') || trimmed.includes('陪伴')) {
    type = '同城陪伴';
  } else if (trimmed.includes('检查') || trimmed.includes('胃镜') || trimmed.includes('ct') || trimmed.includes('门诊') || trimmed.includes('复查') || trimmed.includes('挂号') || trimmed.includes('出院') || trimmed.includes('就医') || trimmed.includes('医院') || trimmed.includes('陪诊')) {
    type = '医疗陪诊';
  }

  // Extract time
  const time = extractTime(trimmed) || '明天上午 09:00';

  // Extract location
  let location = extractLocation(trimmed) || (type === '宠物陪伴' ? '海棠花园西区南门' : type === '同城陪伴' ? '社区公园/就近绿道' : '市人民医院门诊部');

  // Extract phone
  const phoneMatch = trimmed.match(/(?:1[3-9]\d{9})/);
  const phone = phoneMatch ? phoneMatch[0] : userPhone;

  // Generate Title
  let title = '';
  if (type === '医疗陪诊') {
    if (trimmed.includes('胃镜')) title = '胃镜检查全程陪诊与照护';
    else if (trimmed.includes('复查')) title = '医院门诊复查与就医陪同';
    else if (trimmed.includes('出院')) title = '协助办理出院与出行护送';
    else if (trimmed.includes('眼科') || trimmed.includes('白内障')) title = '眼科门诊陪诊与引导看护';
    else if (trimmed.includes('挂号') || trimmed.includes('排队')) title = '门诊协助排队挂号与就医';
    else title = `${location.replace(/门诊部?|住院部?/, '')} 就医陪同与陪诊服务`;
  } else if (type === '宠物陪伴') {
    if (trimmed.includes('猫') || trimmed.includes('铲屎')) title = '上门猫咪喂粮换水与互动照料';
    else if (trimmed.includes('狗') || trimmed.includes('遛')) title = '爱犬定时遛狗散步与喂养陪伴';
    else title = '宠物日常照料与爱心陪伴';
  } else {
    title = '长者户外散步与同城温馨陪伴';
  }

  // Generate detailed description & checklist
  let description = trimmed;
  if (description.length < 15) {
    description = `用户发布需求：${trimmed}。要求服务人员守时耐心，熟悉流程，并全程保持电话畅通。`;
  }

  // Generate helpful tips based on category
  const tips: string[] = [];
  if (type === '医疗陪诊') {
    tips.push('请提醒就医者带好身份证、医保卡及以往病历资料');
    if (trimmed.includes('检查') || trimmed.includes('抽血') || trimmed.includes('胃镜')) {
      tips.push('涉及空腹检查项目，请确认是否需要前一晚禁食禁水');
    }
    tips.push('建议提前15分钟到达集合地点碰面沟通');
  } else if (type === '宠物陪伴') {
    tips.push('请提前告知宠物的性格习性、禁忌食物与牵引绳位置');
    tips.push('服务期间建议拍照或拍摄小视频反馈宠物状态');
  } else {
    tips.push('请提前与服务人员确认长者身体状况与注意事项');
    tips.push('外出请随身携带水杯与常用应急药物');
  }

  // Extract city if explicitly stated
  const cityMatch = trimmed.match(/(北京|西安|上海|成都|福州|昆明|乌鲁木齐)/);
  const detectedCity = cityMatch ? cityMatch[1] : previousDraft?.city;

  const draft: DraftOrder = {
    title,
    type,
    city: detectedCity,
    location,
    time,
    phone,
    description,
    estimatedDuration: getEstimatedDuration(trimmed, type),
    budget: extractBudget(trimmed) || getDefaultBudget(type),
    tips,
  };

  const reply = `我已为您智能识别需求信息！为您规划了 **${type}** 专属服务单，预估服务耗时约 **${draft.estimatedDuration}**，期望金额约 **${draft.budget}**。

请核对下方生成的订单卡片，您也可以直接对我说“时间改成下午2点”或“预算改成200元”进行调整，确认无误后点击【一键发布订单】即可！`;

  return {
    reply,
    draftOrder: draft,
  };
}

function extractBudget(text: string): string | null {
  if (text.includes('面议') || text.includes('协商')) {
    return '面议 / 线下协商';
  }

  // Remove phone numbers and timestamps to avoid false matches
  const cleanText = text
    .replace(/(?:1[3-9]\d{9})/g, '')
    .replace(/\d{1,2}[:：点时]\d{0,2}/g, '')
    .replace(/\d{4}年/g, '');

  // 1. Match explicit currency unit like "150元", "150块", "预算200"
  const explicitMatch = cleanText.match(/(?:预算|报酬|金额|费用|给|付|出)?\s*(\d{2,4})\s*(?:元|块|RMB|rmb)/i) ||
                        cleanText.match(/(?:预算|报酬|金额|费用)\s*(?:为|是|：|:|约)?\s*(\d{2,4})/);
  if (explicitMatch && explicitMatch[1]) {
    const num = parseInt(explicitMatch[1], 10);
    if (num >= 10 && num <= 5000) {
      return `${num} 元`;
    }
  }

  return null;
}

function getDefaultBudget(type: string): string {
  if (type === '医疗陪诊') return '150 元';
  if (type === '宠物陪伴') return '60 元';
  if (type === '同城陪伴') return '100 元';
  return '100 元';
}

function extractTime(text: string): string | null {
  // Try pattern matching for Chinese date and time
  const fullMatch = text.match(/(今天|明天|后天|大后天|本周[一二三四五六日天]|下周[一二三四五六日天]|周[一二三四五六日天]|\d{1,2}月\d{1,2}日?)\s*(上午|下午|中午|早上|晚上|夜间)?\s*(\d{1,2}[:：点时]\d{0,2}分?|\d{1,2}点半|\d{1,2}点)?/);
  if (fullMatch && (fullMatch[1] || fullMatch[2] || fullMatch[3])) {
    let day = fullMatch[1] || '明天';
    let period = fullMatch[2] || (text.includes('下午') ? '下午' : '上午');
    let timePoint = fullMatch[3] ? fullMatch[3].replace('：', ':').replace('时', '点') : '09:00';
    if (!timePoint.includes(':') && !timePoint.includes('点')) {
      timePoint += ':00';
    }
    return `${day} ${period} ${timePoint}`.trim();
  }

  if (text.includes('明天')) return '明天上午 09:00';
  if (text.includes('后天')) return '后天上午 09:00';
  if (text.includes('今天下午')) return '今天下午 14:30';
  if (text.includes('今天')) return '今天下午 15:00';
  if (text.includes('周六')) return '周六上午 09:30';
  if (text.includes('周日')) return '周日上午 09:30';

  return null;
}

function extractLocation(text: string): string | null {
  const hospitalMatch = text.match(/(?:去|在|到|地址|地点)?\s*([\u4e00-\u9fa5A-Za-z0-9]+(?:医院|卫生院|诊所|中心院区|门诊部|分院|病区|大楼|科室))/);
  if (hospitalMatch && hospitalMatch[1]) {
    return hospitalMatch[1];
  }

  const genericLocMatch = text.match(/(?:去|在|到|地点在|集合在|地址)\s*([\u4e00-\u9fa5A-Za-z0-9（）()#-]+(?:小区|大厦|广场|公园|站|门|街|路|栋|号))/);
  if (genericLocMatch && genericLocMatch[1]) {
    return genericLocMatch[1];
  }

  if (text.includes('人民医院')) return '市人民医院门诊大厅';
  if (text.includes('中医院')) return '市中医院门诊部';
  if (text.includes('妇幼')) return '市妇幼保健院';
  if (text.includes('公园')) return '中心公园南门入口';
  if (text.includes('社区') || text.includes('小区')) return '所在小区正门入口';

  return null;
}

function getEstimatedDuration(text: string, type: string): string {
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:个)?(?:小时|小时左右|hr|h)/);
  if (hourMatch) {
    return `${hourMatch[1]} 小时`;
  }
  if (type === '医院陪护') return '2.5 - 3 小时';
  if (type === '跑腿代办') return '1 小时内';
  if (type === '临时看护') return '2 - 4 小时';
  return '2 小时';
}
