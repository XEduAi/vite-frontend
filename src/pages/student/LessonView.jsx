import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StudentLayout from '../../components/StudentLayout';

const TYPE_ICON = {
  video: '▶️',
  pdf: '📄',
  document: '📝',
  link: '🔗',
};

const buildLessonChatHref = (lesson) => (
  `/student/chat?${new URLSearchParams({
    contextType: 'lesson',
    contextId: lesson._id,
    contextLabel: lesson.title || 'Bài học',
  }).toString()}`
);

const LessonView = () => {
  const { classId } = useParams();
  const [searchParams] = useSearchParams();
  const [lessons, setLessons] = useState([]);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null); // lesson _id
  const [saving, setSaving] = useState({}); // { lessonId_itemIdx: true }
  const citedLessonId = searchParams.get('lessonId') || '';
  const citedItemIndex = Number(searchParams.get('itemIndex'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [lessRes, clsRes] = await Promise.all([
          axiosClient.get(`/student/lessons?classId=${classId}`),
          axiosClient.get(`/classes/${classId}`),
        ]);
        const fetched = lessRes.data.lessons || [];
        setLessons(fetched);
        setClassName(clsRes.data.class?.name || '');
        if (fetched.length > 0) {
          const citedLesson = citedLessonId
            ? fetched.find((lesson) => lesson._id === citedLessonId)
            : null;
          setExpanded(citedLesson?._id || fetched[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [citedLessonId, classId]);

  useEffect(() => {
    if (loading || !citedLessonId) {
      return;
    }

    const target = document.getElementById(`lesson-${citedLessonId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [citedLessonId, loading, lessons.length]);

  const toggleExpand = (lessonId) => {
    setExpanded(e => (e === lessonId ? null : lessonId));
  };

  const handleItemClick = async (lesson, itemIdx, item) => {
    // Open external link or media in new tab
    const url = item.externalUrl || item.mediaUrl;
    if (url) window.open(url, '_blank', 'noopener');

    // Mark complete optimistically
    if (lesson.completedItems?.includes(itemIdx)) return; // already done
    const key = `${lesson._id}_${itemIdx}`;
    setSaving(s => ({ ...s, [key]: true }));

    setLessons(prev => prev.map(l => l._id === lesson._id
      ? { ...l, completedItems: [...(l.completedItems || []), itemIdx] }
      : l));

    try {
      await axiosClient.post(`/student/lessons/${lesson._id}/progress`, { itemIndex: itemIdx });
    } catch {
      // Rollback on error
      setLessons(prev => prev.map(l => l._id === lesson._id
        ? { ...l, completedItems: (l.completedItems || []).filter(i => i !== itemIdx) }
        : l));
    } finally {
      setSaving(s => { const n = { ...s }; delete n[key]; return n; });
    }
  };

  // Overall progress across all lessons
  const totalItems = lessons.reduce((s, l) => s + (l.items?.length || 0), 0);
  const completedItems = lessons.reduce((s, l) => s + (l.completedItems?.length || 0), 0);
  const overallPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to={`/student/class/${classId}`} className="text-sm" style={{ color: 'var(--text-muted)' }}>
            ← {className}
          </Link>
          <h1 className="font-display text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            📚 Bài học
          </h1>

          {/* Overall progress bar */}
          {!loading && totalItems > 0 && (
            <div className="mt-3 card rounded-xl px-4 py-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Tiến độ tổng thể
                </span>
                <span className="font-bold" style={{ color: overallPct === 100 ? '#059669' : 'var(--amber-warm)' }}>
                  {overallPct}% ({completedItems}/{totalItems})
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${overallPct}%`, background: overallPct === 100 ? 'linear-gradient(90deg,#10b981,#059669)' : 'linear-gradient(90deg,#f59e0b,#d97706)' }} />
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card rounded-2xl p-5 space-y-2">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && lessons.length === 0 && (
          <div className="card rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Lớp học chưa có bài học nào.</p>
          </div>
        )}

        <div className="space-y-3">
          {lessons.map((lesson) => {
            const lessonItems = lesson.items || [];
            const completed = lesson.completedItems || [];
            const pct = lessonItems.length > 0 ? Math.round((completed.length / lessonItems.length) * 100) : 0;
            const isOpen = expanded === lesson._id;

            return (
              <div
                key={lesson._id}
                id={`lesson-${lesson._id}`}
                className="card rounded-2xl overflow-hidden fade-in-up"
                style={lesson._id === citedLessonId ? { boxShadow: '0 0 0 2px rgba(245,158,11,0.25)' } : undefined}
              >
                {/* Lesson header */}
                <button
                  onClick={() => toggleExpand(lesson._id)}
                  className="w-full flex items-center gap-4 p-5 text-left transition-all hover:opacity-80"
                >
                  {/* Order badge */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: pct === 100 ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                    {pct === 100 ? '✓' : lesson.order}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{lesson.title}</div>
                    {lesson.description && (
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{lesson.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      {/* Mini progress bar */}
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: pct === 100 ? '#10b981' : '#f59e0b' }} />
                      </div>
                      <span className="text-[11px] font-semibold shrink-0"
                        style={{ color: pct === 100 ? '#059669' : 'var(--text-muted)' }}>
                        {completed.length}/{lessonItems.length}
                      </span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 transition-transform duration-200"
                    style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Items list */}
                {isOpen && (
                  <div className="border-t" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="px-5 pt-4 pb-2 flex justify-end">
                      <Link
                        to={buildLessonChatHref(lesson)}
                        className="btn-secondary py-2 px-4 text-sm"
                      >
                        Hỏi EduBot về bài này
                      </Link>
                    </div>
                    {lessonItems.length === 0 ? (
                      <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>Bài học chưa có nội dung.</p>
                    ) : (
                      lessonItems.map((item, idx) => {
                        const isDone = completed.includes(idx);
                        const key = `${lesson._id}_${idx}`;
                        const isSaving = saving[key];

                        return (
                          <button
                            key={idx}
                            onClick={() => handleItemClick(lesson, idx, item)}
                            disabled={isSaving}
                            className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-all hover:opacity-80 border-b last:border-b-0"
                            style={{
                              borderColor: 'var(--border-light)',
                              background: isDone
                                ? 'rgba(16,185,129,0.04)'
                                : lesson._id === citedLessonId && idx === citedItemIndex
                                  ? 'var(--amber-soft)'
                                  : 'transparent'
                            }}
                          >
                            {/* Type icon */}
                            <span className="text-lg shrink-0 w-6 text-center">{TYPE_ICON[item.type] || '📄'}</span>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate"
                                style={{ color: isDone ? '#059669' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.8 : 1 }}>
                                {item.title}
                              </p>
                              {item.duration && (
                                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                  ⏱ {item.duration} phút
                                </p>
                              )}
                            </div>

                            {/* Status */}
                            <span className="shrink-0">
                              {isSaving ? (
                                <svg className="animate-spin w-4 h-4" style={{ color: 'var(--amber-warm)' }} viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : isDone ? (
                                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: '#059669' }}>
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" style={{ color: 'var(--border)' }}>
                                  <circle cx="10" cy="10" r="8" />
                                </svg>
                              )}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </StudentLayout>
  );
};

export default LessonView;
