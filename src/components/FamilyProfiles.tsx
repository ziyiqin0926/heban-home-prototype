import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, CalendarDays, ChevronRight, MapPin, PawPrint, Pencil, Plus,
  Save, Trash2, UserRound, X
} from 'lucide-react';

type FamilyMember = {
  id: string;
  name: string;
  relation: string;
  kind: '家人' | '宠物';
  phone: string;
  birthday: string;
  location: string;
  careNotes: string;
  remarks: string;
};

const initialMembers: FamilyMember[] = [
  { id: 'mother', name: '母亲', relation: '母亲', kind: '家人', phone: '', birthday: '', location: '华西医院', careNotes: '心内科复查，行动较慢，需要记录医嘱', remarks: '优先安排女性陪诊师傅' },
  { id: 'father', name: '父亲', relation: '父亲', kind: '家人', phone: '', birthday: '', location: '同仁医院', careNotes: '慢病随访，提醒携带既往检查报告', remarks: '' },
  { id: 'snowball', name: '雪球', relation: '宠物', kind: '宠物', phone: '', birthday: '', location: '家中', careNotes: '需要定时喂食和换水，不接受陌生零食', remarks: '布偶猫' },
];

const emptyMember: FamilyMember = {
  id: '',
  name: '',
  relation: '家庭成员',
  kind: '家人',
  phone: '',
  birthday: '',
  location: '',
  careNotes: '',
  remarks: '',
};

interface FamilyProfilesProps {
  onClose: () => void;
}

export default function FamilyProfiles({ onClose }: FamilyProfilesProps) {
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = window.localStorage.getItem('heban-family-profiles');
      return saved ? JSON.parse(saved) : initialMembers;
    } catch {
      return initialMembers;
    }
  });
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  useEffect(() => {
    window.localStorage.setItem('heban-family-profiles', JSON.stringify(members));
  }, [members]);

  const saveMember = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingMember?.name.trim()) return;
    setMembers(current => editingMember.id
      ? current.map(member => member.id === editingMember.id ? editingMember : member)
      : [...current, { ...editingMember, id: `member-${Date.now()}` }]);
    setEditingMember(null);
  };

  const removeMember = (id: string) => {
    setMembers(current => current.filter(member => member.id !== id));
    setEditingMember(null);
  };

  return (
    <div className="family-profile-overlay">
      <section className="family-profile-page" role="dialog" aria-modal="true" aria-label="家庭成员档案">
        <header className="family-profile-header">
          <button type="button" onClick={onClose} aria-label="返回档期"><ArrowLeft /></button>
          <div><strong>家庭成员档案</strong><small>把常用人物和照护信息交给 AI</small></div>
          <button type="button" onClick={() => setEditingMember({ ...emptyMember })} aria-label="新增成员"><Plus /></button>
        </header>

        <main className="family-profile-content">
          <section className="family-profile-intro">
            <span><UserRound /></span>
            <div><strong>档案会用于智能排期</strong><p>发布需求或新增日程时，可一键带入人物、地点和注意事项。</p></div>
          </section>

          <div className="family-profile-section-heading"><div><strong>已建档成员</strong><small>{members.length} 位成员 · 可随时编辑</small></div><button type="button" onClick={() => setEditingMember({ ...emptyMember })}><Plus />新建成员</button></div>

          <section className="family-profile-list">
            {members.map(member => (
              <article className="family-profile-card" key={member.id}>
                <div className={`family-profile-avatar ${member.kind === '宠物' ? 'pet' : ''}`}>{member.kind === '宠物' ? <PawPrint /> : <UserRound />}</div>
                <div className="family-profile-card-main">
                  <div className="family-profile-card-title"><strong>{member.name}</strong><span>{member.relation}</span><em>{member.kind}</em></div>
                  <p><MapPin />{member.location || '未设置常用地点'}</p>
                  <small>{member.careNotes || '还没有填写注意事项'}</small>
                  <div className="family-profile-card-actions"><button type="button" onClick={() => setEditingMember({ ...member })}><Pencil />编辑档案</button><button type="button" onClick={() => removeMember(member.id)}><Trash2 />删除</button></div>
                </div>
              </article>
            ))}
            {members.length === 0 && <button type="button" className="family-profile-empty" onClick={() => setEditingMember({ ...emptyMember })}><Plus /><strong>新建第一个成员档案</strong><span>填写后可在日程和订单中一键调用</span></button>}
          </section>

          <section className="family-profile-tips">
            <CalendarDays /><div><strong>档案与日程联动</strong><p>常用地点、联系人和注意事项会在 AI 生成订单前展示给你确认。</p></div><ChevronRight />
          </section>
        </main>

        {editingMember && (
          <div className="family-profile-editor-backdrop" onClick={() => setEditingMember(null)}>
            <form className="family-profile-editor" onSubmit={saveMember} onClick={event => event.stopPropagation()}>
              <header><div><strong>{editingMember.id ? '编辑成员档案' : '新建成员档案'}</strong><small>基础信息和照护习惯都可以随时补充</small></div><button type="button" onClick={() => setEditingMember(null)} aria-label="关闭"><X /></button></header>
              <div className="family-profile-form-grid">
                <label>姓名/昵称<input value={editingMember.name} onChange={event => setEditingMember({ ...editingMember, name: event.target.value })} placeholder="例如：母亲、雪球" required /></label>
                <label>关系或身份<input value={editingMember.relation} onChange={event => setEditingMember({ ...editingMember, relation: event.target.value })} placeholder="例如：父亲、宠物" /></label>
                <label>联系电话<input value={editingMember.phone} onChange={event => setEditingMember({ ...editingMember, phone: event.target.value })} placeholder="可选，用于服务联系" /></label>
                <label>出生日期<input type="date" value={editingMember.birthday} onChange={event => setEditingMember({ ...editingMember, birthday: event.target.value })} /></label>
                <label className="wide">常用地点<input value={editingMember.location} onChange={event => setEditingMember({ ...editingMember, location: event.target.value })} placeholder="例如：华西医院、家中" /></label>
                <label className="wide">注意事项<textarea value={editingMember.careNotes} onChange={event => setEditingMember({ ...editingMember, careNotes: event.target.value })} placeholder="填写病史、习惯、禁忌或照护重点" rows={3} /></label>
                <label className="wide">备注<textarea value={editingMember.remarks} onChange={event => setEditingMember({ ...editingMember, remarks: event.target.value })} placeholder="填写需要特别提醒 AI 和服务者的信息" rows={2} /></label>
              </div>
              <footer><button type="button" className="family-profile-cancel" onClick={() => setEditingMember(null)}>取消</button><button type="submit" className="family-profile-save"><Save />保存档案</button></footer>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
