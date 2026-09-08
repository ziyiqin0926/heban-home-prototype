import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Edit3,
  Lightbulb,
  ShieldCheck,
  Timer,
  Info,
  Mic,
  PlusCircle,
  HelpCircle,
  Coins,
  Menu
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { parseUserRequest } from '../utils/aiParser';
import { DraftOrder } from '../types';

interface AiAgentProps {
  onNavigateToCommunity: () => void;
  onNavigateToProfile?: () => void;
}

const SERVICE_TIME_OPTIONS = [
  '今天 上午 08:30',
  '今天 上午 09:00',
  '今天 上午 10:00',
  '今天 下午 14:00',
  '今天 下午 15:30',
  '今天 傍晚 16:30 前',
  '明天 上午 08:00',
  '明天 上午 08:30',
  '明天 上午 09:00',
  '明天 上午 09:30',
  '明天 上午 10:00',
  '明天 下午 14:00',
  '明天 下午 15:30',
  '明天 下午 16:30 前',
  '后天 上午 08:30',
  '后天 上午 09:00',
  '后天 上午 10:00',
  '后天 下午 14:30',
  '本周六 上午 09:00',
  '本周六 上午 09:30',
  '本周日 上午 09:00',
  '下周一 上午 08:30',
  '下周一 上午 09:00',
  '尽快出发 (1小时内)',
];

export default function AiAgent({ onNavigateToCommunity, onNavigateToProfile }: AiAgentProps) {
  const {
    chatMessages,
    addChatMessage,
    updateChatMessage,
    clearChat,
    addOrder,
    userPhone,
    prefilledPrompt,
    setPrefilledPrompt,
  } = useAppContext();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editingDraft, setEditingDraft] = useState<{ msgId: string; draft: DraftOrder } | null>(null);
  const [activeVoice, setActiveVoice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync prefilled prompt if user clicked "我也要发类似需求" in community
  useEffect(() => {
    if (prefilledPrompt) {
      setInput(prefilledPrompt);
      setPrefilledPrompt('');
      inputRef.current?.focus();
    }
  }, [prefilledPrompt, setPrefilledPrompt]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    setInput('');

    // Find latest draft if any for context update
    const lastDraftMsg = [...chatMessages].reverse().find(m => m.draftOrder && !m.isOrderCreated);
    const prevDraft = lastDraftMsg ? lastDraftMsg.draftOrder : null;

    // 1. Add user message
    addChatMessage({
      sender: 'user',
      content: text,
    });

    setIsTyping(true);

    // 2. Simulate AI Processing & NLP Extraction
    setTimeout(() => {
      const result = parseUserRequest(text, prevDraft, userPhone);

      addChatMessage({
        sender: 'assistant',
        content: result.reply,
        draftOrder: result.draftOrder,
      });

      setIsTyping(false);
    }, 600);
  };

  const handlePublishOrder = (msgId: string, draft: DraftOrder) => {
    const newOrder = addOrder(draft);

    // Update the message state to reflect order created
    updateChatMessage(msgId, {
      isOrderCreated: true,
      createdOrderId: newOrder.id,
    });

    // Add assistant confirmation response
    addChatMessage({
      sender: 'assistant',
      content: `🎉 **需求订单已成功发布！**\n\n订单号：\`${newOrder.id}\`\n服务类型：**${newOrder.type}**\n服务时间：**${newOrder.time}**\n服务地点：**${newOrder.location}**\n\n您的订单已保存至【个人中心 - 我的订单】，系统正在为您就近匹配合资格的专业陪护师。`,
    });
  };

  const handleSaveEditDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDraft) return;

    updateChatMessage(editingDraft.msgId, {
      draftOrder: editingDraft.draft,
    });

    addChatMessage({
      sender: 'assistant',
      content: `已为您更新需求单信息！请核对最新需求卡片后点击发布。`,
      draftOrder: editingDraft.draft,
    });

    setEditingDraft(null);
  };

  const voiceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
      }
    };
  }, []);

  const simulateVoiceInput = () => {
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
    }
    setActiveVoice(true);
    const sample = '明天上午8点半去市人民医院陪我父亲看骨科，需要帮忙推轮椅和拿化验单，电话13800138000';
    let i = 0;
    setInput('');
    voiceTimerRef.current = setInterval(() => {
      if (i < sample.length) {
        setInput(sample.slice(0, i + 1));
        i++;
      } else {
        if (voiceTimerRef.current) {
          clearInterval(voiceTimerRef.current);
          voiceTimerRef.current = null;
        }
        setActiveVoice(false);
      }
    }, 45);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Top Header */}
      <header className="bg-white px-4 py-3 md:px-6 md:py-3.5 sticky top-0 z-30 border-b border-slate-200/80 shadow-xs flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-sm md:text-base font-bold text-slate-800">AI 智能发布需求</h1>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200/80">
                AI生成
              </span>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-200/60">
                在线服务中
              </span>
            </div>
            <p className="text-[11px] text-slate-400">同城陪伴 · 人工智能生成与需求解析 · 快速撮合</p>
          </div>
        </div>

        {/* Right Header Quick Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            title="清空对话"
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>
          <button
            onClick={onNavigateToCommunity}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
          >
            <span>同城社区</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Chat Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-w-4xl mx-auto w-full">
        {chatMessages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
            </div>

            {/* Bubble Content */}
            <div className="flex flex-col space-y-1.5 max-w-[90%] sm:max-w-[82%]">
              {msg.sender === 'assistant' && (
                <div className="flex items-center space-x-1 px-1">
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-600 border border-blue-200/80 text-[10px] font-bold">
                    AI生成
                  </span>
                  <span className="text-[10px] text-slate-400">
                    人工智能生成内容
                  </span>
                </div>
              )}
              <div
                className={`p-4 md:p-5 rounded-2xl text-sm sm:text-base md:text-[16.5px] leading-relaxed tracking-normal ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs shadow-sm font-medium'
                    : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/80 shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {/* Interactive Requirement Order Card */}
              {msg.draftOrder && (
                <div className="bg-white rounded-2xl border border-blue-200 shadow-md p-4 sm:p-5 space-y-4 mt-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs">
                        {msg.draftOrder.type}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 font-medium">
                        AI 智能需求单 <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-100">AI生成</span>
                      </span>
                    </div>
                    {msg.isOrderCreated ? (
                      <span className="flex items-center text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> 已保存至个人中心
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md font-medium border border-amber-200/50">
                        待确认发布
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800">
                    {msg.draftOrder.title}
                  </h3>

                  {/* Key Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm md:text-[15px] text-slate-600 bg-slate-50/90 p-3.5 sm:p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
                      <span>时间：<strong className="text-slate-800">{msg.draftOrder.time}</strong></span>
                    </div>
                    <div className="flex items-center">
                      <Timer className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
                      <span>预估：<strong className="text-slate-800">{msg.draftOrder.estimatedDuration || '2 小时'}</strong></span>
                    </div>
                    <div className="flex items-center">
                      <Coins className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-amber-500 flex-shrink-0" />
                      <span>期望金额：<strong className="text-amber-600 font-bold">{msg.draftOrder.budget || '150 元'}</strong> <span className="text-xs text-slate-400 font-normal">(线下协商)</span></span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
                      <span>联系电话：<strong className="text-slate-800">{msg.draftOrder.phone}</strong></span>
                    </div>
                    <div className="flex items-center sm:col-span-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
                      <span>地点：<strong className="text-slate-800">{msg.draftOrder.location}</strong></span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="text-xs sm:text-sm md:text-[15px] text-slate-600 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/70">
                    <div className="text-xs sm:text-sm font-bold text-slate-400 mb-1.5">需求详情与说明：</div>
                    <p className="leading-relaxed">{msg.draftOrder.description}</p>
                  </div>

                  {/* Smart Tips */}
                  {msg.draftOrder.tips && msg.draftOrder.tips.length > 0 && (
                    <div className="text-xs sm:text-sm text-amber-800 bg-amber-50/80 p-3.5 rounded-xl border border-amber-200/50 space-y-1.5">
                      <div className="font-bold flex items-center text-amber-900">
                        <Lightbulb className="w-4 h-4 mr-1.5 text-amber-600 flex-shrink-0" />
                        和伴贴心建议：
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-amber-700 leading-relaxed">
                        {msg.draftOrder.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-1">
                    {msg.isOrderCreated ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={onNavigateToProfile || onNavigateToCommunity}
                          className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base flex items-center justify-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <span>前往个人中心查看我的订单</span>
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2.5">
                        <button
                          onClick={() => setEditingDraft({ msgId: msg.id, draft: { ...msg.draftOrder! } })}
                          className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm sm:text-base flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>调整</span>
                        </button>
                        <button
                          onClick={() => handlePublishOrder(msg.id, msg.draftOrder!)}
                          className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-md transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>确认一键发布订单</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <span className="text-[11px] sm:text-xs text-slate-400 px-1">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* AI Typing indicator */}
        {isTyping && (
          <div className="flex items-start space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-xs border border-slate-200/80 shadow-xs flex items-center space-x-2">
              <span className="text-sm sm:text-base text-slate-500 font-medium">和伴正在智能分析并提取需求...</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Bottom Input Form - Stacked Multi-line Layout */}
      <div className="bg-white border-t border-slate-200/80 p-3 sm:p-4 sticky bottom-0 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <div className="max-w-4xl mx-auto w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-xs space-y-2"
          >
            {/* Top: Multi-line Input Box (上下堆叠，完整展示输入文本) */}
            <div className="w-full">
              <textarea
                ref={inputRef}
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="直接输入您的陪护需求（如：明天上午陪母亲去医院门诊、下楼遛狗、长者散步等）..."
                className="w-full bg-transparent border-0 p-1 sm:p-1.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 resize-none min-h-[64px] sm:min-h-[76px] max-h-[180px] leading-relaxed"
              />
            </div>

            {/* Bottom: Stacked Action Toolbar */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100/80">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={simulateVoiceInput}
                  title="语音/快速填入示例需求"
                  className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activeVoice
                      ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                  <span>{activeVoice ? '语音识别中...' : '语音/示例填入'}</span>
                </button>

                {input.trim() && (
                  <button
                    type="button"
                    onClick={() => setInput('')}
                    className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 transition-colors cursor-pointer"
                  >
                    清空
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <span className="hidden sm:inline text-[11px] text-slate-400">
                  按 Enter 发送 · Shift+Enter 换行
                </span>

                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className={`px-5 sm:px-6 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
                    input.trim() && !isTyping
                      ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>发送</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>

          {/* 微信小程序深度合成合规显著声明：AI生成 · 人工智能生成 */}
          <div className="pt-2 px-1 space-y-1">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200/80 font-bold text-[11px]">
                  AI生成
                </span>
                <span className="text-[11px] sm:text-xs text-slate-600 font-medium">
                  本服务内容及回答由人工智能AI生成（深度合成），仅供参考
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>智能保护隐私 · 真实信息撮合</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Edit Draft Modal */}
      {editingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center">
                <Edit3 className="w-4 h-4 mr-1.5 text-blue-600" />
                调整需求订单详情
              </h3>
              <button
                onClick={() => setEditingDraft(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditDraft} className="space-y-4 text-sm sm:text-base">
              <div>
                <label className="block font-bold text-slate-700 mb-1 text-sm sm:text-base">需求标题</label>
                <input
                  required
                  value={editingDraft.draft.title}
                  onChange={(e) => setEditingDraft({
                    ...editingDraft,
                    draft: { ...editingDraft.draft, title: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-sm sm:text-base">服务类型</label>
                  <select
                    value={editingDraft.draft.type}
                    onChange={(e) => setEditingDraft({
                      ...editingDraft,
                      draft: { ...editingDraft.draft, type: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base"
                  >
                    <option>医疗陪诊</option>
                    <option>宠物陪伴</option>
                    <option>同城陪伴</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-sm sm:text-base">预估耗时</label>
                  <input
                    value={editingDraft.draft.estimatedDuration || ''}
                    onChange={(e) => setEditingDraft({
                      ...editingDraft,
                      draft: { ...editingDraft.draft, estimatedDuration: e.target.value }
                    })}
                    placeholder="如: 2.5小时"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-sm sm:text-base">服务时间</label>
                <select
                  value={
                    SERVICE_TIME_OPTIONS.includes(editingDraft.draft.time)
                      ? editingDraft.draft.time
                      : (editingDraft.draft.time ? editingDraft.draft.time : SERVICE_TIME_OPTIONS[0])
                  }
                  onChange={(e) => setEditingDraft({
                    ...editingDraft,
                    draft: { ...editingDraft.draft, time: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base cursor-pointer"
                >
                  {!SERVICE_TIME_OPTIONS.includes(editingDraft.draft.time) && editingDraft.draft.time && (
                    <option value={editingDraft.draft.time}>
                      当前已识别：{editingDraft.draft.time}
                    </option>
                  )}
                  {SERVICE_TIME_OPTIONS.map((timeOpt) => (
                    <option key={timeOpt} value={timeOpt}>
                      {timeOpt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 text-sm sm:text-base">期望金额</label>
                  <span className="text-xs text-slate-400">线下向服务人员结清</span>
                </div>
                <input
                  value={editingDraft.draft.budget || ''}
                  onChange={(e) => setEditingDraft({
                    ...editingDraft,
                    draft: { ...editingDraft.draft, budget: e.target.value }
                  })}
                  placeholder="如: 150 元 或 面议/线下协商"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base"
                />
                {/* Quick Budget Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['50 元', '100 元', '150 元', '200 元', '300 元', '面议 / 线下协商'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditingDraft({
                        ...editingDraft,
                        draft: { ...editingDraft.draft, budget: preset }
                      })}
                      className={`text-xs sm:text-sm px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        editingDraft.draft.budget === preset
                          ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-sm sm:text-base">集合/服务地点</label>
                <input
                  required
                  value={editingDraft.draft.location}
                  onChange={(e) => setEditingDraft({
                    ...editingDraft,
                    draft: { ...editingDraft.draft, location: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-sm sm:text-base">联系手机号</label>
                <input
                  required
                  value={editingDraft.draft.phone}
                  onChange={(e) => setEditingDraft({
                    ...editingDraft,
                    draft: { ...editingDraft.draft, phone: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-sm sm:text-base">需求详情与注意事项</label>
                <textarea
                  required
                  rows={3}
                  value={editingDraft.draft.description}
                  onChange={(e) => setEditingDraft({
                    ...editingDraft,
                    draft: { ...editingDraft.draft, description: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDraft(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer text-sm sm:text-base"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer text-sm sm:text-base"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

