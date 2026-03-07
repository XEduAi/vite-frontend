import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import StudentLayout from '../../components/StudentLayout';
import LatexRenderer from '../../components/LatexRenderer';

const DIFFICULTIES = ['', 'easy', 'medium', 'hard'];
const DIFF_LABEL = { '': 'Tất cả', easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
const DIFF_COLOR = { easy: '#059669', medium: '#d97706', hard: '#dc2626' };

const Flashcards = () => {
  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState({}); // { cardIdx: 'got_it' | 'need_review' }
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  // Filter state
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [count, setCount] = useState(20);
  const [topics, setTopics] = useState([]);

  // Fetch available topics for the filter
  useEffect(() => {
    axiosClient.get('/questions/topics').then(res => {
      setTopics(res.data.topics || []);
    }).catch(() => {});
  }, []);

  const startSession = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (topic) params.set('topic', topic);
      if (difficulty) params.set('difficulty', difficulty);
      params.set('count', count);
      const res = await axiosClient.get(`/student/flashcards?${params}`);
      const fetched = res.data.cards || [];
      if (fetched.length === 0) {
        alert('Không tìm thấy câu hỏi nào phù hợp với bộ lọc đã chọn.');
        return;
      }
      setCards(fetched);
      setCurrent(0);
      setFlipped(false);
      setResults({});
      setDone(false);
      setStarted(true);
    } catch (err) {
      alert('Lỗi tải flashcard');
    } finally {
      setLoading(false);
    }
  };

  const rate = async (rating) => {
    const card = cards[current];
    setResults(r => ({ ...r, [current]: rating }));

    // Fire and forget — save result to backend
    axiosClient.post('/student/flashcards/result', {
      questionId: card._id,
      selfRating: rating,
    }).catch(() => {});

    if (current + 1 >= cards.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setFlipped(false);
    }
  };

  const needReviewCount = Object.values(results).filter(r => r === 'need_review').length;
  const gotItCount = Object.values(results).filter(r => r === 'got_it').length;

  // ── Setup screen ──────────────────────────────────────────────
  if (!started) {
    return (
      <StudentLayout>
        <div className="max-w-md mx-auto fade-in-up">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🃏 Flashcards</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Ôn tập nhanh kiến thức với thẻ lật
            </p>
          </div>

          <div className="card rounded-2xl p-6 space-y-5">
            {/* Topic */}
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>CHỦ ĐỀ</label>
              <select value={topic} onChange={e => setTopic(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm"
                style={{ borderColor: 'var(--border)', background: 'var(--white)', color: 'var(--text-primary)' }}>
                <option value="">Tất cả chủ đề</option>
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>ĐỘ KHÓ</label>
              <div className="flex gap-2 flex-wrap">
                {DIFFICULTIES.map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                    style={{
                      borderColor: difficulty === d ? (DIFF_COLOR[d] || 'var(--amber-warm)') : 'var(--border)',
                      background: difficulty === d ? (d ? `${DIFF_COLOR[d]}15` : 'var(--amber-soft)') : 'transparent',
                      color: difficulty === d ? (DIFF_COLOR[d] || 'var(--amber-warm)') : 'var(--text-secondary)',
                    }}>
                    {DIFF_LABEL[d]}
                  </button>
                ))}
              </div>
            </div>

            {/* Count */}
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                SỐ THẺ: {count}
              </label>
              <input type="range" min={5} max={50} step={5} value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full accent-amber-500" />
              <div className="flex justify-between text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                <span>5</span><span>50</span>
              </div>
            </div>

            <button onClick={startSession} disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Đang tải...' : '🚀 Bắt đầu học'}
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // ── Summary screen ────────────────────────────────────────────
  if (done) {
    const total = cards.length;
    const pct = total > 0 ? Math.round((gotItCount / total) * 100) : 0;
    return (
      <StudentLayout>
        <div className="max-w-sm mx-auto text-center fade-in-up">
          <div className="card rounded-2xl p-8 mt-8">
            <div className="text-5xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📖'}</div>
            <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Xong phiên học!
            </h2>
            <div className="flex justify-center gap-8 mt-6">
              <div>
                <div className="font-display text-3xl font-bold" style={{ color: '#059669' }}>{gotItCount}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>✅ Biết rồi</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold" style={{ color: '#d97706' }}>{needReviewCount}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>🔄 Cần ôn lại</div>
              </div>
            </div>
            {needReviewCount > 0 && (
              <p className="text-sm mt-4 rounded-xl px-4 py-3" style={{ background: '#fef3c7', color: '#92400e' }}>
                Hệ thống sẽ ưu tiên {needReviewCount} thẻ cần ôn lại trong phiên tiếp theo.
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStarted(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                Thay đổi bộ lọc
              </button>
              <button onClick={startSession}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                Học lại
              </button>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // ── Card screen ───────────────────────────────────────────────
  const card = cards[current];
  const correctOption = card?.options?.find(o => o.isCorrect);

  return (
    <StudentLayout>
      <div className="max-w-md mx-auto">
        {/* Progress bar */}
        <div className="mb-5 fade-in">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <button onClick={() => setStarted(false)} className="font-medium" style={{ color: 'var(--text-muted)' }}>
              ← Thoát
            </button>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Thẻ {current + 1} / {cards.length}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${((current) / cards.length) * 100}%`, background: 'linear-gradient(90deg,#f59e0b,#d97706)' }} />
          </div>
          <div className="flex gap-3 mt-1.5 text-[11px]">
            <span style={{ color: '#059669' }}>✅ {gotItCount}</span>
            <span style={{ color: '#d97706' }}>🔄 {needReviewCount}</span>
          </div>
        </div>

        {/* Card flip */}
        <div
          onClick={() => setFlipped(f => !f)}
          className="cursor-pointer select-none"
          style={{ perspective: '1000px', minHeight: 260 }}>
          <div style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            position: 'relative',
            minHeight: 260,
          }}>
            {/* Front — question */}
            <div className="card rounded-2xl p-6 flex flex-col items-center justify-center text-center absolute inset-0"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
              <div className="text-xs font-semibold mb-4 flex gap-2 flex-wrap justify-center">
                {card.subject && <span className="badge badge-blue">{card.subject}</span>}
                {card.topic && <span className="badge badge-purple">{card.topic}</span>}
                {card.difficulty && (
                  <span className="badge" style={{ background: `${DIFF_COLOR[card.difficulty]}15`, color: DIFF_COLOR[card.difficulty] }}>
                    {DIFF_LABEL[card.difficulty]}
                  </span>
                )}
              </div>
              <div className="text-base font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                <LatexRenderer text={card.content} />
              </div>
              {card.mediaUrl && (
                <img src={card.mediaUrl} alt="" className="mt-4 max-w-full rounded-xl border max-h-40 object-contain"
                  style={{ borderColor: 'var(--border)' }} />
              )}
              <p className="text-xs mt-6" style={{ color: 'var(--text-muted)' }}>👆 Nhấp để xem đáp án</p>
            </div>

            {/* Back — answer */}
            <div className="card rounded-2xl p-6 flex flex-col items-center justify-center text-center absolute inset-0"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>ĐÁP ÁN</div>
              {card.type === 'mcq' && card.options ? (
                <div className="w-full space-y-2 text-left">
                  {card.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                      style={{
                        background: opt.isCorrect ? '#d1fae5' : 'transparent',
                        border: `1px solid ${opt.isCorrect ? '#a7f3d0' : 'var(--border)'}`,
                        color: opt.isCorrect ? '#065f46' : 'var(--text-secondary)',
                      }}>
                      <span className="w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0"
                        style={{ background: opt.isCorrect ? '#a7f3d0' : '#e2e8f0', color: opt.isCorrect ? '#065f46' : '#94a3b8' }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <LatexRenderer text={opt.text} />
                      {opt.isCorrect && <span className="ml-auto text-xs font-bold">✓</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                  <LatexRenderer text={correctOption?.text || card.correctAnswer || '—'} />
                </div>
              )}
              {card.explanation && (
                <div className="mt-4 rounded-xl px-4 py-3 text-sm text-left w-full" style={{ background: 'var(--info-light)', color: '#1e40af' }}>
                  <strong>Giải thích: </strong><LatexRenderer text={card.explanation} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rating buttons — only shown after flip */}
        <div className={`mt-5 flex gap-3 transition-all duration-300 ${flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <button onClick={() => rate('need_review')}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2"
            style={{ borderColor: '#d97706', color: '#d97706', background: '#fef3c7' }}>
            🔄 Cần ôn lại
          </button>
          <button onClick={() => rate('got_it')}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
            ✅ Biết rồi
          </button>
        </div>

        {!flipped && (
          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            Xem đáp án trước khi đánh giá
          </p>
        )}
      </div>
    </StudentLayout>
  );
};

export default Flashcards;
