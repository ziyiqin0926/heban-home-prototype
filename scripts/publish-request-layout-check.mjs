import fs from 'node:fs';

const css = fs.readFileSync(new URL('../src/pages/PublishRequest.css', import.meta.url), 'utf8');
const tsx = fs.readFileSync(new URL('../src/pages/PublishRequest.tsx', import.meta.url), 'utf8');
const communityTsx = fs.readFileSync(new URL('../src/pages/Community.tsx', import.meta.url), 'utf8');
const communityCss = fs.readFileSync(new URL('../src/pages/Community.css', import.meta.url), 'utf8');
const schedule = fs.readFileSync(new URL('../src/pages/publishRequestSchedule.ts', import.meta.url), 'utf8');

if (!/\.publish-request\s*\{[^}]*height:\s*100dvh;[^}]*overflow-y:\s*auto;/s.test(css)) {
  throw new Error('独立发布页缺少可滚动容器');
}
if (!/\.publish-request\.embedded\s*\{[^}]*overflow:\s*visible;/s.test(css)) {
  throw new Error('嵌入发布页缺少关闭嵌套滚动的规则');
}
if (!tsx.includes('生成订单，推送匹配大厅')) {
  throw new Error('提交按钮未明确指向匹配大厅');
}
for (const token of ['语音输入', '体验参考区间', '正式市场价待服务价格规则接入后展示', '联系人昵称', '联系电话需为11位手机号', 'maxLength={11}', 'publish-input-invalid', '高曝光率高速匹配通道', '调整需求再发一条', 'publish-order-status', '分享订单', 'onNavigateToProfile', 'publish-date-strip', 'getDateValueMonthsLater', 'max={maxSelectableDate}', 'publish-period-tabs']) {
  if (!tsx.includes(token)) throw new Error(`发布页缺少：${token}`);
}
if (!['上午', '下午', '夜间'].every(label => schedule.includes(`label: '${label}'`))) {
  throw new Error('服务时间未按上午、下午、夜间划分');
}
if (!css.includes('.publish-budget-panel') || !css.includes('grid-template-columns: minmax(0, 1fr) 112px')) {
  throw new Error('预算模块缺少适配手机的分层布局');
}
for (const token of ['community-card-order', 'community-order-badge', 'isOrder']) {
  if (!communityTsx.includes(token) && !communityCss.includes(token)) throw new Error(`社区订单高亮缺少：${token}`);
}

console.log('publish-request layout checks passed');
