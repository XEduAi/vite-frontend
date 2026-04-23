import { useDeferredValue, useState, useRef } from 'react';
import { getApiErrorMessage } from '../../api/errors';
import AdminQueryErrors from '../../components/AdminQueryErrors';
import AdminLayout from '../../components/AdminLayout';
import AdminToast from '../../components/AdminToast';
import LatexRenderer from '../../components/LatexRenderer';
import { useQuestionFiltersQuery } from '../../features/quiz/hooks';
import {
  useDeleteQuestionMutation,
  useQuestionPoolQuery,
  useSaveQuestionMutation,
  useUploadQuestionImageMutation,
} from '../../features/questions/hooks';

const DIFFICULTIES = [
  { value: 'easy', label: 'Dễ', badge: 'badge-green' },
  { value: 'medium', label: 'Trung bình', badge: 'badge-amber' },
  { value: 'hard', label: 'Khó', badge: 'badge-red' },
];

const MATH_TOPICS = [
  'Đại số', 'Hình học', 'Giải tích', 'Số học', 'Xác suất & Thống kê',
  'Lượng giác', 'Phương trình', 'Bất phương trình', 'Hàm số', 'Tổ hợp',
  'Hình học không gian', 'Hình học phẳng', 'Vectơ', 'Tích phân', 'Đạo hàm',
];

const EMPTY_QUESTION = {
  content: '',
  type: 'mcq',
  subject: 'Toán',
  topic: '',
  grade: '',
  difficulty: 'medium',
  explanation: '',
  mediaUrl: '',
  options: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
};

const QuestionPool = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ subject: '', topic: '', grade: '', difficulty: '', search: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_QUESTION });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [expandedId, setExpandedId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);
  const deferredSearch = useDeferredValue(filters.search);

  const questionFiltersQuery = useQuestionFiltersQuery();
  const questionPoolQuery = useQuestionPoolQuery({
    ...filters,
    search: deferredSearch,
    page,
    limit: 20,
  });
  const saveQuestionMutation = useSaveQuestionMutation();
  const deleteQuestionMutation = useDeleteQuestionMutation();
  const uploadQuestionImageMutation = useUploadQuestionImageMutation();

  const questions = questionPoolQuery.data?.questions || [];
  const total = questionPoolQuery.data?.total || 0;
  const totalPages = questionPoolQuery.data?.totalPages || 1;
  const loading = questionPoolQuery.isPending;
  const uploading = uploadQuestionImageMutation.isPending;
  const filterOptions = questionFiltersQuery.data || { subjects: [], topics: [], grades: [] };

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showMsg('Chỉ hỗ trợ file ảnh', 'error');
      return;
    }

    try {
      const mediaUrl = await uploadQuestionImageMutation.mutateAsync(file);
      setForm((previousForm) => ({ ...previousForm, mediaUrl }));
      showMsg('Tải ảnh thành công');
    } catch (err) {
      showMsg(getApiErrorMessage(err, 'Lỗi tải ảnh'), 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_QUESTION, options: EMPTY_QUESTION.options.map((option) => ({ ...option })) });
    setShowPreview(false);
    setShowForm(true);
  };

  const openEditForm = (question) => {
    setEditingId(question._id);
    setForm({
      content: question.content,
      type: question.type,
      subject: question.subject,
      topic: question.topic || '',
      grade: question.grade || '',
      difficulty: question.difficulty,
      explanation: question.explanation || '',
      mediaUrl: question.mediaUrl || '',
      options: question.options?.length > 0
        ? question.options.map((option) => ({ text: option.text, isCorrect: option.isCorrect }))
        : EMPTY_QUESTION.options.map((option) => ({ ...option })),
    });
    setShowForm(true);
  };

  const handleOptionChange = (index, field, value) => {
    const nextOptions = form.options.map((option, optionIndex) => {
      if (field === 'isCorrect') {
        return { ...option, isCorrect: optionIndex === index };
      }
      return optionIndex === index ? { ...option, [field]: value } : option;
    });
    setForm({ ...form, options: nextOptions });
  };

  const addOption = () => {
    setForm({ ...form, options: [...form.options, { text: '', isCorrect: false }] });
  };

  const removeOption = (index) => {
    if (form.options.length <= 2) return;
    const nextOptions = form.options.filter((_, optionIndex) => optionIndex !== index);
    if (!nextOptions.some((option) => option.isCorrect)) nextOptions[0].isCorrect = true;
    setForm({ ...form, options: nextOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim() || !form.topic.trim()) {
      showMsg('Vui lòng nhập nội dung và chủ đề', 'error');
      return;
    }
    if (form.type === 'mcq' && form.options.some((option) => !option.text.trim())) {
      showMsg('Vui lòng nhập đầy đủ đáp án', 'error');
      return;
    }

    try {
      await saveQuestionMutation.mutateAsync({
        questionId: editingId,
        payload: {
          ...form,
          grade: form.grade ? Number(form.grade) : undefined,
          options: form.type === 'mcq' ? form.options : undefined,
        },
      });

      showMsg(editingId ? 'Cập nhật câu hỏi thành công' : 'Tạo câu hỏi thành công');
      setShowForm(false);
    } catch (err) {
      showMsg(getApiErrorMessage(err, 'Lỗi khi lưu câu hỏi'), 'error');
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Xóa câu hỏi này?')) return;

    try {
      await deleteQuestionMutation.mutateAsync(questionId);
      showMsg('Đã xóa');
    } catch (err) {
      showMsg(getApiErrorMessage(err, 'Lỗi xóa câu hỏi'), 'error');
    }
  };

  const getDiffBadge = (difficulty) => DIFFICULTIES.find((item) => item.value === difficulty) || DIFFICULTIES[1];

  const queryErrors = [
    questionPoolQuery.isError
      ? {
          key: 'questions',
          message: getApiErrorMessage(questionPoolQuery.error, 'Không thể tải danh sách câu hỏi'),
          onRetry: () => questionPoolQuery.refetch(),
        }
      : null,
    questionFiltersQuery.isError
      ? {
          key: 'filters',
          message: getApiErrorMessage(questionFiltersQuery.error, 'Không thể tải bộ lọc câu hỏi'),
          onRetry: () => questionFiltersQuery.refetch(),
        }
      : null,
  ].filter(Boolean);

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="bento-label" style={{ color: 'var(--amber-warm)' }}>Nội dung</div>
          <h1 className="bento-hero-title mt-1" style={{ color: 'var(--text-primary)' }}>Ngân hàng câu hỏi</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{total} câu hỏi</p>
        </div>
        <button onClick={openCreateForm} className="btn-primary px-5 py-2.5">
          + Thêm câu hỏi
        </button>
      </div>

      <AdminToast className="mb-4" message={msg.text} type={msg.type} />

      <AdminQueryErrors errors={queryErrors} />

      <div className="card p-4 mb-6 flex flex-wrap gap-3">
        <select value={filters.topic} onChange={(e) => handleFilterChange('topic', e.target.value)} className="input w-auto">
          <option value="">Tất cả chủ đề</option>
          {filterOptions.topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
        </select>
        <select value={filters.grade} onChange={(e) => handleFilterChange('grade', e.target.value)} className="input w-auto">
          <option value="">Tất cả lớp</option>
          {filterOptions.grades.map((grade) => <option key={grade} value={grade}>Lớp {grade}</option>)}
        </select>
        <select value={filters.difficulty} onChange={(e) => handleFilterChange('difficulty', e.target.value)} className="input w-auto">
          <option value="">Tất cả độ khó</option>
          {DIFFICULTIES.map((difficulty) => <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>)}
        </select>
        <input
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="🔍 Tìm theo nội dung..."
          className="input flex-1 min-w-[200px]"
        />
        {Object.values(filters).some(Boolean) && (
          <button
            onClick={() => {
              setFilters({ subject: '', topic: '', grade: '', difficulty: '', search: '' });
              setPage(1);
            }}
            className="btn-secondary text-sm"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>Đang tải...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Chưa có câu hỏi nào</h3>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>Bắt đầu tạo ngân hàng câu hỏi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => {
            const difficulty = getDiffBadge(question.difficulty);
            const isExpanded = expandedId === question._id;
            return (
              <div key={question._id} className="card overflow-hidden transition-all hover:shadow-md">
                <div className="p-4 flex items-start gap-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : question._id)}>
                  <span className="text-xs font-mono mt-1 w-8 text-center shrink-0 rounded py-0.5" style={{ background: 'var(--cream-warm)', color: 'var(--text-secondary)' }}>
                    {(page - 1) * 20 + index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium line-clamp-2" style={{ color: 'var(--text-primary)' }}><LatexRenderer text={question.content} /></div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {question.topic && <span className="badge badge-purple">{question.topic}</span>}
                      {question.grade && <span className="badge badge-gray">Lớp {question.grade}</span>}
                      <span className={`badge ${difficulty.badge}`}>{difficulty.label}</span>
                      <span className="badge badge-gray">{question.type === 'mcq' ? 'Trắc nghiệm' : 'Tự luận'}</span>
                      {question.mediaUrl && <span className="badge badge-teal">📷 Có ảnh</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditForm(question);
                      }}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: 'var(--amber-warm)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--amber-soft)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      title="Sửa"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(question._id);
                      }}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: 'var(--danger)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger-light)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t pt-3" style={{ borderColor: 'var(--border-light)' }}>
                    {question.mediaUrl && (
                      <div className="mb-3">
                        <img src={question.mediaUrl} alt="" className="max-w-md rounded-xl border" style={{ borderColor: 'var(--border)' }} />
                      </div>
                    )}
                    {question.type === 'mcq' && question.options && (
                      <div className="space-y-1.5 mb-3">
                        <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Đáp án:</div>
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg"
                            style={{
                              background: option.isCorrect ? 'var(--success-light)' : 'transparent',
                              color: option.isCorrect ? 'var(--success)' : 'var(--text-secondary)',
                              fontWeight: option.isCorrect ? 500 : 400,
                            }}
                          >
                            <span
                              className="w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold border"
                              style={{
                                borderColor: option.isCorrect ? 'var(--success)' : 'var(--border)',
                                background: option.isCorrect ? 'var(--success-light)' : 'transparent',
                                color: option.isCorrect ? 'var(--success)' : 'var(--text-muted)',
                              }}
                            >
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <LatexRenderer text={option.text} />
                            {option.isCorrect && <span className="ml-auto" style={{ color: 'var(--success)' }}>✓</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    {question.explanation && (
                      <div className="rounded-lg p-3 text-sm" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                        <span className="font-semibold">Giải thích: </span><LatexRenderer text={question.explanation} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-secondary text-sm disabled:opacity-40">
            ← Trước
          </button>
          <span className="px-3 py-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>Trang {page}/{totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn-secondary text-sm disabled:opacity-40">
            Sau →
          </button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 modal-overlay">
          <div className="rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl modal-content" style={{ background: 'var(--white)' }}>
            <div className="sticky top-0 px-6 py-4 border-b flex items-center justify-between z-10" style={{ background: 'var(--white)', borderColor: 'var(--border)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {editingId ? 'Sửa câu hỏi' : 'Tạo câu hỏi mới'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-xl transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Nội dung câu hỏi *</label>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs px-2.5 py-1 rounded-full border transition-colors"
                    style={{
                      borderColor: showPreview ? 'var(--amber-warm)' : 'var(--border)',
                      background: showPreview ? 'var(--amber-soft)' : 'transparent',
                      color: showPreview ? 'var(--amber-warm)' : 'var(--text-muted)',
                    }}
                  >
                    {showPreview ? '✎ Soạn' : '👁 Xem trước'}
                  </button>
                </div>
                {showPreview ? (
                  <div className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px]" style={{ borderColor: 'var(--border)', background: 'var(--cream)', color: 'var(--text-primary)' }}>
                    {form.content ? <LatexRenderer text={form.content} /> : <span style={{ color: 'var(--text-muted)' }}>Chưa có nội dung</span>}
                  </div>
                ) : (
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={3}
                    className="input resize-none font-mono"
                    placeholder="Hỗ trợ LaTeX: $x^2 + y^2 = r^2$"
                  />
                )}
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Dùng <code className="px-1 rounded" style={{ background: 'var(--cream-warm)' }}>$...$</code> cho công thức inline, <code className="px-1 rounded" style={{ background: 'var(--cream-warm)' }}>$$...$$</code> cho công thức block</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Loại câu hỏi</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
                    <option value="mcq">Trắc nghiệm</option>
                    <option value="essay">Tự luận</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Độ khó</label>
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="input">
                    {DIFFICULTIES.map((difficulty) => <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Chủ đề *</label>
                <input
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="input"
                  placeholder="VD: Đại số, Hình học, Giải tích..."
                  list="topic-list"
                />
                <datalist id="topic-list">
                  {MATH_TOPICS.map((topic) => <option key={topic} value={topic} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Lớp</label>
                <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="input">
                  <option value="">-- Chọn lớp --</option>
                  {[6, 7, 8, 9, 10, 11, 12].map((grade) => <option key={grade} value={grade}>Lớp {grade}</option>)}
                </select>
              </div>

              {form.type === 'mcq' && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Đáp án</label>
                  <div className="space-y-2">
                    {form.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOptionChange(index, 'isCorrect', true)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border-2 text-xs font-bold shrink-0 transition-colors"
                          style={{
                            borderColor: option.isCorrect ? 'var(--success)' : 'var(--border)',
                            background: option.isCorrect ? 'var(--success-light)' : 'transparent',
                            color: option.isCorrect ? 'var(--success)' : 'var(--text-muted)',
                          }}
                        >
                          {String.fromCharCode(65 + index)}
                        </button>
                        <input
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                          className="input flex-1 font-mono"
                          placeholder={`Đáp án ${String.fromCharCode(65 + index)} (hỗ trợ LaTeX: $x^2$)`}
                        />
                        {form.options.length > 2 && (
                          <button type="button" onClick={() => removeOption(index)} className="text-lg px-1 transition-colors" style={{ color: 'var(--danger)' }}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {form.options.length < 6 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="mt-2 text-sm font-medium px-3 py-1.5 rounded-lg border border-dashed transition-colors"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--cream-warm)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      + Thêm đáp án
                    </button>
                  )}
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Click vào chữ cái để chọn đáp án đúng</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Hình ảnh (cho hình học, đồ thị...)</label>
                {form.mediaUrl ? (
                  <div className="relative inline-block">
                    <img src={form.mediaUrl} alt="" className="max-w-xs max-h-48 rounded-xl border" style={{ borderColor: 'var(--border)' }} />
                    <button type="button" onClick={() => setForm({ ...form, mediaUrl: '' })} className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs shadow-md hover:bg-red-600">✕</button>
                  </div>
                ) : (
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed text-sm transition-colors disabled:opacity-50"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--amber-warm)'; e.currentTarget.style.background = 'var(--amber-soft)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      {uploading ? <><span className="animate-spin">⏳</span> Đang tải...</> : <><span>📷</span> Tải ảnh lên (đồ thị, hình vẽ...)</>}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Giải thích (hiển thị cho học sinh sau khi nộp bài)</label>
                <textarea
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  rows={2}
                  className="input resize-none font-mono"
                  placeholder="Giải thích đáp án (hỗ trợ LaTeX)..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saveQuestionMutation.isPending} className="btn-primary disabled:opacity-60">
                  {saveQuestionMutation.isPending ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo câu hỏi'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default QuestionPool;
