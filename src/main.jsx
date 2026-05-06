import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Compass,
  Heart,
  MapPin,
  PencilLine,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  WalletCards,
} from 'lucide-react';
import './styles.css';

const CATEGORIES = ['自然', '街歩き', 'グルメ', '温泉', 'アート', '歴史', 'リゾート'];
const STATUSES = {
  wishlist: { label: '行きたい', icon: Heart },
  visited: { label: '行った', icon: CheckCircle2 },
};

const sampleTrips = [
  {
    id: 'sample-1',
    name: '金沢 ひがし茶屋街',
    area: '石川県金沢市',
    category: '歴史',
    status: 'wishlist',
    priority: 5,
    bestSeason: '秋〜冬',
    budget: '35,000円',
    mapQuery: '金沢 ひがし茶屋街',
    attractions: '兼六園、21世紀美術館、近江町市場',
    todos: '早朝の茶屋街を撮影、金箔ソフトを食べる、町家カフェで休憩',
    memo: '雨でも雰囲気が出るので、撮影スポットを多めに調べる。',
    visitDate: '',
  },
  {
    id: 'sample-2',
    name: '宮古島 与那覇前浜ビーチ',
    area: '沖縄県宮古島市',
    category: 'リゾート',
    status: 'visited',
    priority: 4,
    bestSeason: '5月〜10月',
    budget: '90,000円',
    mapQuery: '与那覇前浜ビーチ',
    attractions: '来間大橋、伊良部大橋、砂山ビーチ',
    todos: 'サンセットを見る、シュノーケリング、島カフェ巡り',
    memo: 'レンタカー必須。夕方は虫よけと羽織りがあると安心。',
    visitDate: '2025-07-18',
  },
];

const emptyForm = {
  name: '',
  area: '',
  category: '',
  status: 'wishlist',
  priority: 3,
  bestSeason: '',
  budget: '',
  mapQuery: '',
  attractions: '',
  todos: '',
  memo: '',
  visitDate: '',
};

function useTrips() {
  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('trip-palette-trips');
    return saved ? JSON.parse(saved) : sampleTrips;
  });

  useEffect(() => {
    localStorage.setItem('trip-palette-trips', JSON.stringify(trips));
  }, [trips]);

  return [trips, setTrips];
}

function App() {
  const [trips, setTrips] = useTrips();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [query, setQuery] = useState('');

  const categoryOptions = useMemo(() => {
    return [...new Set([...CATEGORIES, ...trips.map((trip) => trip.category).filter(Boolean)])];
  }, [trips]);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || trip.category === categoryFilter;
      const haystack = `${trip.name} ${trip.area} ${trip.attractions} ${trip.todos}`.toLowerCase();
      return matchesStatus && matchesCategory && haystack.includes(query.toLowerCase());
    });
  }, [trips, statusFilter, categoryFilter, query]);

  const stats = useMemo(() => {
    const visited = trips.filter((trip) => trip.status === 'visited').length;
    const wishlist = trips.filter((trip) => trip.status === 'wishlist').length;
    const topPriority = trips.filter((trip) => Number(trip.priority) >= 4).length;
    return { visited, wishlist, topPriority };
  }, [trips]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      name: form.name.trim(),
      area: form.area.trim(),
      category: form.category.trim() || '未分類',
      mapQuery: form.mapQuery.trim() || `${form.name} ${form.area}`.trim(),
    };

    if (!payload.name || !payload.area) return;

    if (editingId) {
      setTrips((current) => current.map((trip) => (trip.id === editingId ? { ...payload, id: editingId } : trip)));
    } else {
      setTrips((current) => [{ ...payload, id: crypto.randomUUID() }, ...current]);
    }
    setForm(emptyForm);
    setEditingId(null);
  };

  const editTrip = (trip) => {
    setForm(trip);
    setEditingId(trip.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTrip = (id) => {
    setTrips((current) => current.filter((trip) => trip.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
  };

  return (
    <main>
      <section className="hero">
        <nav className="nav">
          <div className="brand"><Compass size={28} /> Trip Palette</div>
          <span>手入力で育てる旅の行き先ノート</span>
        </nav>
        <div className="hero-grid">
          <div>
            <p className="eyebrow"><Sparkles size={18} /> Travel wishlist & memory board</p>
            <h1>行った場所も、これから行きたい場所も、美しく整理。</h1>
            <p className="lead">
              カテゴリ、周辺マップ、観光スポット、現地でやりたいことをまとめて記録できます。
              入力した内容はブラウザに保存されるので、あなた専用の旅カタログとして使えます。
            </p>
            <div className="hero-actions">
              <a href="#editor" className="primary-btn"><Plus size={18} /> 行き先を追加</a>
              <a href="#cards" className="ghost-btn">一覧を見る</a>
            </div>
          </div>
          <div className="stats-card">
            <Stat label="行った場所" value={stats.visited} icon={Camera} />
            <Stat label="行きたい場所" value={stats.wishlist} icon={Heart} />
            <Stat label="優先度高め" value={stats.topPriority} icon={Star} />
          </div>
        </div>
      </section>

      <section id="editor" className="panel editor-panel">
        <div className="section-heading">
          <p className="eyebrow"><PencilLine size={17} /> Manual editor</p>
          <h2>{editingId ? '行き先を編集' : '新しい行き先を手入力'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="trip-form">
          <Field label="場所名" name="name" value={form.name} onChange={handleChange} placeholder="例：上高地 河童橋" required />
          <Field label="エリア" name="area" value={form.area} onChange={handleChange} placeholder="例：長野県松本市" required />
          <label>
            カテゴリ
            <input name="category" list="category-suggestions" value={form.category} onChange={handleChange} placeholder="例：自然、推し旅、建築" />
            <datalist id="category-suggestions">
              {categoryOptions.map((category) => <option key={category} value={category} />)}
            </datalist>
          </label>
          <label>
            ステータス
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="wishlist">行きたい</option>
              <option value="visited">行った</option>
            </select>
          </label>
          <Field label="訪問日" name="visitDate" type="date" value={form.visitDate} onChange={handleChange} />
          <label>
            優先度
            <input name="priority" type="range" min="1" max="5" value={form.priority} onChange={handleChange} />
            <span className="range-value">★ {form.priority}</span>
          </label>
          <Field label="おすすめ時期" name="bestSeason" value={form.bestSeason} onChange={handleChange} placeholder="例：新緑の5月、紅葉の10月" />
          <Field label="予算メモ" name="budget" value={form.budget} onChange={handleChange} placeholder="例：交通費込み 45,000円" />
          <Field label="マップ検索ワード" name="mapQuery" value={form.mapQuery} onChange={handleChange} placeholder="空欄なら場所名＋エリアで表示" />
          <label className="wide">
            周辺の観光場所
            <textarea name="attractions" value={form.attractions} onChange={handleChange} placeholder="例：展望台、カフェ、美術館、温泉" />
          </label>
          <label className="wide">
            行った先でやりたいこと
            <textarea name="todos" value={form.todos} onChange={handleChange} placeholder="例：朝日を見る、名物を食べる、写真を撮る" />
          </label>
          <label className="wide">
            メモ・旅のログ
            <textarea name="memo" value={form.memo} onChange={handleChange} placeholder="宿泊候補、移動手段、持ち物、思い出など" />
          </label>
          <div className="form-actions wide">
            <button type="submit" className="primary-btn">{editingId ? '更新する' : '追加する'}</button>
            {editingId && <button type="button" className="ghost-btn" onClick={() => { setEditingId(null); setForm(emptyForm); }}>キャンセル</button>}
          </div>
        </form>
      </section>

      <section className="panel filters">
        <div className="search-box"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="場所名・観光場所・やりたいことで検索" /></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">すべてのステータス</option>
          <option value="wishlist">行きたい</option>
          <option value="visited">行った</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">すべてのカテゴリ</option>
          {categoryOptions.map((category) => <option key={category}>{category}</option>)}
        </select>
      </section>

      <section id="cards" className="cards-grid">
        {filteredTrips.map((trip) => <TripCard key={trip.id} trip={trip} onEdit={editTrip} onDelete={deleteTrip} />)}
      </section>
    </main>
  );
}

function Field({ label, ...props }) {
  return (
    <label>
      {label}
      <input {...props} />
    </label>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="stat">
      <Icon size={24} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function TripCard({ trip, onEdit, onDelete }) {
  const StatusIcon = STATUSES[trip.status].icon;
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(trip.mapQuery || `${trip.name} ${trip.area}`)}&output=embed`;

  return (
    <article className="trip-card">
      <div className="card-top">
        <span className={`status ${trip.status}`}><StatusIcon size={16} /> {STATUSES[trip.status].label}</span>
        <span className="category">{trip.category}</span>
      </div>
      <h3>{trip.name}</h3>
      <p className="area"><MapPin size={16} /> {trip.area}</p>
      <div className="meta-row">
        <span><Star size={15} /> 優先度 {trip.priority}</span>
        {trip.bestSeason && <span><CalendarDays size={15} /> {trip.bestSeason}</span>}
        {trip.budget && <span><WalletCards size={15} /> {trip.budget}</span>}
      </div>
      {trip.visitDate && <p className="visited-date">訪問日：{trip.visitDate}</p>}
      <div className="map-frame"><iframe title={`${trip.name} map`} src={mapSrc} loading="lazy" /></div>
      <InfoBlock title="周辺の観光場所" text={trip.attractions} />
      <InfoBlock title="現地でやりたいこと" text={trip.todos} highlight />
      <InfoBlock title="メモ" text={trip.memo} />
      <div className="card-actions">
        <button onClick={() => onEdit(trip)}><PencilLine size={16} /> 編集</button>
        <button className="danger" onClick={() => onDelete(trip.id)}><Trash2 size={16} /> 削除</button>
      </div>
    </article>
  );
}

function InfoBlock({ title, text, highlight }) {
  if (!text) return null;
  return (
    <div className={highlight ? 'info-block highlight' : 'info-block'}>
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
