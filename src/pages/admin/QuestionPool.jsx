import { useEffect, useState, useRef } from 'react';
import axiosClient from '../../api/axiosClient';
import AdminLayout from '../../components/AdminLayout';
import LatexRenderer from '../../components/LatexRenderer';

const DIFFICULTIES = [
  { value: 'easy', label: 'Dễ', color: 'bg-green-100 text-green-700' },
  { value: 'medium', label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'hard', label: 'Khó', color: 'bg-red-100 text-red-700' },
];

const MATH_TOPICS = [
  'Đại số', 'Hình học', 'Giải tích', 'Số học', 'Xác suất & Thống kê',
  'Lượng giác', 'Phương trình', 'Bất phương trình', 'Hàm số', 'Tổ hợp',
  'Hình học không gian', 'Hình học phẳng', 'Vectơ', 'Tích phân', 'Đạo hàm',
];

const EMPTY_QUESTION = {
  content: '', type: 'mcq', subject: 'Toán', topic: '', grade: '', difficulty: 'medium',
  explanation: '', mediaUrl: '',
  options: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]
};

const QuestionPool = () => {
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ subject: '', topic: '', grade: '', difficulty: '', search: '' });
  const [filterOptions, setFilterOptions] = useState({ subjects: [], topics: [], grades: [] });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_QUESTION });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [expandedId, setExpandedId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filters.subject) params.subject = filters.subject;
      if (filters.topic) params.topic = filters.topic;
      if (filters.grade) params.grade = filters.grade;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.search) params.search = filters.search;

      const res = await axiosClient.get('/questions', { params });
      setQuestions(res.data.questions);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const res = await axiosClient.get('/questions/filters');
      setFilterOptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchFilters(); }, []);
  useEffect(() => { fetchQuestions(); }, [page, filters]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showMsg('Chỉ hỗ trợ file ảnh', 'error');
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await axiosClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(prev => ({ ...prev, mediaUrl: res.data.media.url }));
      showMsg('Tải ảnh thành công');
    } catch (err) {
      showMsg('Lỗi tải ảnh', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_QUESTION, options: EMPTY_QUESTION.options.map(o => ({ ...o })) });
    setShowPreview(false);
    setShowForm(true);
  };

  const openEditForm = (q) => {
    setEditingId(q._id);
    setForm({
      content: q.content,
      type: q.type,
      subject: q.subject,
      topic: q.topic || '',
      grade: q.grade || '',
      difficulty: q.difficulty,
      explanation: q.explanation || '',
      mediaUrl: q.mediaUrl || '',
      options: q.options?.length > 0
        ? q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect }))
        : EMPTY_QUESTION.options.map(o => ({ ...o }))
    });
    setShowForm(true);
  };

  const handleOptionChange = (index, field, value) => {
    const newOpts = form.options.map((o, i) => {
      if (field === 'isCorrect') {
        return { ...o, isCorrect: i === index };
      }
      return i === index ? { ...o, [field]: value } : o;
    });
    setForm({ ...form, options: newOpts });
  };

  const addOption = () => {
    setForm({ ...form, options: [...form.options, { text: '', isCorrect: false }] });
  };

  const removeOption = (index) => {
    if (form.options.length <= 2) return;
    const newOpts = form.options.filter((_, i) => i !== index);
    if (!newOpts.some(o => o.isCorrect)) newOpts[0].isCorrect = true;
    setForm({ ...form, options: newOpts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim() || !form.topic.trim()) {
      showMsg('Vui lòng nhập nội dung và chủ đề', 'error');
      return;
    }
    if (form.type === 'mcq' && form.options.some(o => !o.text.trim())) {
      showMsg('Vui lòng nhập đầy đủ đáp án', 'error');
      return;
    }

    try {
      const data = {
        ...form,
        grade: form.grade ? Number(form.grade) : undefined,
        options: form.type === 'mcq' ? form.options : undefined
      };

      if (editingId) {
        await axiosClient.put(`/questions/${editingId}`, data);
        showMsg('Cập nhật câu hỏi thành công');
      } else {
        await axiosClient.post('/questions', data);
        showMsg('Tạo câu hỏi thành công');
      }
      setShowForm(false);
      fetchQuestions();
      fetchFilters();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Lỗi', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    try {
      await axiosClient.delete(`/questions/${id}`);
      showMsg('Đã xóa');
      fetchQuestions();
    } catch (err) {
      showMsg('Lỗi xóa', 'error');
    }
  };

  const getDiffBadge = (d) => DIFFICULTIES.find(x => x.value === d) || DIFFICULTIES[1];

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1c1917' }}>Ngân hàng câu hỏi</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>{total} câu hỏi</p>
        </div>
        <button onClick={openCreateForm}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg"
          style={{ background: '#e8850a' }}>
          + Thêm câu hỏi
        </button>
      </div>

      {/* Toast */}
      {msg.text && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-3" style={{ borderColor: '#e5ddd0' }}>
        <select value={filters.topic} onChange={e => handleFilterChange('topic', e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm" style={{ borderColor: '#d6ccc0' }}>
          <option value="">Tất cả chủ đề</option>
          {filterOptions.topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.grade} onChange={e => handleFilterChange('grade', e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm" style={{ borderColor: '#d6ccc0' }}>
          <option value="">Tất cả lớp</option>
          {filterOptions.grades.map(g => <option key={g} value={g}>Lớp {g}</option>)}
        </select>
        <select value={filters.difficulty} onChange={e => handleFilterChange('difficulty', e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm" style={{ borderColor: '#d6ccc0' }}>
          <option value="">Tất cả độ khó</option>
          {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <input
          value={filters.search} onChange={e => handleFilterChange('search', e.target.value)}
          placeholder="🔍 Tìm theo nội dung..."
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
          style={{ borderColor: '#d6ccc0' }}
        />
        {Object.values(filters).some(v => v) && (
          <button onClick={() => { setFilters({ subject: '', topic: '', grade: '', difficulty: '', search: '' }); setPage(1); }}
            className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50" style={{ borderColor: '#d6ccc0', color: '#78716c' }}>
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Question List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Đang tải...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-600">Chưa có câu hỏi nào</h3>
          <p className="text-gray-400 mt-2">Bắt đầu tạo ngân hàng câu hỏi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => {
            const diff = getDiffBadge(q.difficulty);
            const isExpanded = expandedId === q._id;
            return (
              <div key={q._id} className="bg-white rounded-xl border overflow-hidden transition-all hover:shadow-sm" style={{ borderColor: '#e5ddd0' }}>
                <div className="p-4 flex items-start gap-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : q._id)}>
                  <span className="text-xs font-mono mt-1 w-8 text-center shrink-0 rounded py-0.5" style={{ background: '#f5f0eb', color: '#78716c' }}>
                    {(page - 1) * 20 + idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 line-clamp-2"><LatexRenderer text={q.content} /></div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {q.topic && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{q.topic}</span>}
                      {q.grade && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Lớp {q.grade}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${diff.color}`}>{diff.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{q.type === 'mcq' ? 'Trắc nghiệm' : 'Tự luận'}</span>
                      {q.mediaUrl && <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-600">📷 Có ảnh</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); openEditForm(q); }}
                      className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors" title="Sửa">
                      ✏️
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(q._id); }}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Xóa">
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t pt-3" style={{ borderColor: '#f5f0eb' }}>
                    {q.mediaUrl && (
                      <div className="mb-3">
                        <img src={q.mediaUrl} alt="" className="max-w-md rounded-xl border" style={{ borderColor: '#e5ddd0' }} />
                      </div>
                    )}
                    {q.type === 'mcq' && q.options && (
                      <div className="space-y-1.5 mb-3">
                        <div className="text-xs font-semibold text-gray-500 mb-1">Đáp án:</div>
                        {q.options.map((o, i) => (
                          <div key={i} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${o.isCorrect ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'}`}>
                            <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold border ${o.isCorrect ? 'border-green-500 bg-green-100 text-green-700' : 'border-gray-300 text-gray-400'}`}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <LatexRenderer text={o.text} />
                            {o.isCorrect && <span className="ml-auto text-green-500">✓</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    {q.explanation && (
                      <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                        <span className="font-semibold">Giải thích: </span><LatexRenderer text={q.explanation} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40" style={{ borderColor: '#d6ccc0' }}>
            ← Trước
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-500">Trang {page}/{totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40" style={{ borderColor: '#d6ccc0' }}>
            Sau →
          </button>
        </div>
      )}

      {/* === CREATE/EDIT FORM MODAL === */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10" style={{ borderColor: '#e5ddd0' }}>
              <h2 className="text-lg font-bold" style={{ color: '#1c1917' }}>
                {editingId ? 'Sửa câu hỏi' : 'Tạo câu hỏi mới'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold" style={{ color: '#44403c' }}>Nội dung câu hỏi *</label>
                  <button type="button" onClick={() => setShowPreview(!showPreview)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${showPreview ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-gray-300 text-gray-500 hover:border-amber-300'}`}>
                    {showPreview ? '✎ Soạn' : '👁 Xem trước'}
                  </button>
                </div>
                {showPreview ? (
                  <div className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px] bg-gray-50" style={{ borderColor: '#d6ccc0' }}>
                    {form.content ? <LatexRenderer text={form.content} /> : <span className="text-gray-400">Chưa có nội dung</span>}
                  </div>
                ) : (
                  <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                    rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none font-mono"
                    style={{ borderColor: '#d6ccc0' }} placeholder="Hỗ trợ LaTeX: $x^2 + y^2 = r^2$ hoặc $$\\frac{a}{b}$$" />
                )}
                <p className="text-xs mt-1" style={{ color: '#a8a29e' }}>Dùng <code className="bg-gray-100 px-1 rounded">$...$</code> cho công thức inline, <code className="bg-gray-100 px-1 rounded">$$...$$</code> cho công thức block</p>
              </div>

              {/* Type & Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#44403c' }}>Loại câu hỏi</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: '#d6ccc0' }}>
                    <option value="mcq">Trắc nghiệm</option>
                    <option value="essay">Tự luận</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#44403c' }}>Độ khó</label>
                  <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: '#d6ccc0' }}>
                    {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#44403c' }}>Chủ đề *</label>
                <input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: '#d6ccc0' }}
                  placeholder="VD: Đại số, Hình học, Giải tích..." list="topic-list" />
                <datalist id="topic-list">
                  {MATH_TOPICS.map(t => <option key={t} value={t} />)}
                </datalist>
              </div>

              {/* Grade */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#44403c' }}>Lớp</label>
                <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: '#d6ccc0' }}>
                  <option value="">-- Chọn lớp --</option>
                  {[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Lớp {g}</option>)}
                </select>
              </div>

              {/* MCQ Options */}
              {form.type === 'mcq' && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#44403c' }}>Đáp án</label>
                  <div className="space-y-2">
                    {form.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button type="button" onClick={() => handleOptionChange(i, 'isCorrect', true)}
                          className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-xs font-bold shrink-0 transition-colors ${opt.isCorrect ? 'border-green-500 bg-green-100 text-green-700' : 'border-gray-300 text-gray-400 hover:border-green-400'}`}>
                          {String.fromCharCode(65 + i)}
                        </button>
                        <input value={opt.text} onChange={e => handleOptionChange(i, 'text', e.target.value)}
                          className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono" style={{ borderColor: '#d6ccc0' }}
                          placeholder={`Đáp án ${String.fromCharCode(65 + i)} (hỗ trợ LaTeX: $x^2$)`} />
                        {form.options.length > 2 && (
                          <button type="button" onClick={() => removeOption(i)}
                            className="text-red-400 hover:text-red-600 text-lg px-1">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {form.options.length < 6 && (
                    <button type="button" onClick={addOption}
                      className="mt-2 text-sm font-medium px-3 py-1.5 rounded-lg border border-dashed hover:bg-gray-50"
                      style={{ borderColor: '#d6ccc0', color: '#78716c' }}>
                      + Thêm đáp án
                    </button>
                  )}
                  <p className="text-xs mt-1" style={{ color: '#a8a29e' }}>Click vào chữ cái để chọn đáp án đúng</p>
                </div>
              )}

              {/* Image upload */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#44403c' }}>Hình ảnh (cho hình học, đồ thị...)</label>
                {form.mediaUrl ? (
                  <div className="relative inline-block">
                    <img src={form.mediaUrl} alt="" className="max-w-xs max-h-48 rounded-xl border" style={{ borderColor: '#e5ddd0' }} />
                    <button type="button" onClick={() => setForm({ ...form, mediaUrl: '' })}
                      className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs shadow-md hover:bg-red-600">✕</button>
                  </div>
                ) : (
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed text-sm transition-colors hover:border-amber-300 hover:bg-amber-50 disabled:opacity-50"
                      style={{ borderColor: '#d6ccc0', color: '#78716c' }}>
                      {uploading ? (
                        <><span className="animate-spin">⏳</span> Đang tải...</>
                      ) : (
                        <><span>📷</span> Tải ảnh lên (đồ thị, hình vẽ...)</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#44403c' }}>Giải thích (tùy chọn)</label>
                <textarea value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })}
                  rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none font-mono"
                  style={{ borderColor: '#d6ccc0' }} placeholder="Giải thích đáp án (hỗ trợ LaTeX)..." />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white hover:shadow-lg transition-all"
                  style={{ background: '#e8850a' }}>
                  {editingId ? 'Cập nhật' : 'Tạo câu hỏi'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium border hover:bg-gray-50"
                  style={{ borderColor: '#d6ccc0', color: '#78716c' }}>
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
