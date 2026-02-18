import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import AdminLayout from '../../components/AdminLayout';

const DIFFICULTIES = [
  { value: 'easy', label: 'Dễ' },
  { value: 'medium', label: 'TB' },
  { value: 'hard', label: 'Khó' },
];

const QuizManager = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ subjects: [], topics: [], grades: [] });
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const EMPTY_FORM = {
    title: '', duration: 45, classIds: [], startTime: '', endTime: '',
    fixedQuestions: [],
    randomConfig: [{ subject: '', topic: '', grade: '', difficulty: '', count: 10 }]
  };
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [qRes, cRes, fRes] = await Promise.all([
        axiosClient.get('/quizzes'),
        axiosClient.get('/classes'),
        axiosClient.get('/questions/filters')
      ]);
      setQuizzes(qRes.data.quizzes);
      setClasses(cRes.data.classes);
      setFilterOptions(fRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const selectQuiz = async (quiz) => {
    setSelectedQuiz(quiz);
    try {
      const res = await axiosClient.get(`/quizzes/${quiz._id}/attempts`);
      setAttempts(res.data.attempts);
    } catch (err) {
      setAttempts([]);
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, classIds: [], randomConfig: [{ subject: '', topic: '', grade: '', difficulty: '', count: 10 }] });
    setShowForm(true);
  };

  const openEditForm = (q) => {
    setEditingId(q._id);
    setForm({
      title: q.title,
      duration: q.duration,
      classIds: q.classIds?.map(c => c._id || c) || [],
      startTime: q.startTime ? new Date(q.startTime).toISOString().slice(0, 16) : '',
      endTime: q.endTime ? new Date(q.endTime).toISOString().slice(0, 16) : '',
      fixedQuestions: q.fixedQuestions || [],
      randomConfig: q.randomConfig?.length > 0
        ? q.randomConfig.map(r => ({ subject: r.subject || '', topic: r.topic || '', grade: r.grade || '', difficulty: r.difficulty || '', count: r.count }))
        : [{ subject: '', topic: '', grade: '', difficulty: '', count: 10 }]
    });
    setShowForm(true);
  };

  const toggleClassId = (id) => {
    setForm(prev => ({
      ...prev,
      classIds: prev.classIds.includes(id) ? prev.classIds.filter(c => c !== id) : [...prev.classIds, id]
    }));
  };

  const updateRandomConfig = (index, field, value) => {
    const newConfig = [...form.randomConfig];
    newConfig[index] = { ...newConfig[index], [field]: value };
    setForm({ ...form, randomConfig: newConfig });
  };

  const addRandomCriteria = () => {
    setForm({ ...form, randomConfig: [...form.randomConfig, { subject: '', topic: '', grade: '', difficulty: '', count: 5 }] });
  };

  const removeRandomCriteria = (index) => {
    if (form.randomConfig.length <= 1) return;
    setForm({ ...form, randomConfig: form.randomConfig.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showMsg('Nhập tên quiz', 'error'); return; }

    try {
      const data = {
        title: form.title,
        duration: Number(form.duration),
        classIds: form.classIds,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        randomConfig: form.randomConfig.map(r => ({
          ...r,
          grade: r.grade ? Number(r.grade) : undefined,
          count: Number(r.count)
        }))
      };

      if (editingId) {
        await axiosClient.put(`/quizzes/${editingId}`, data);
        showMsg('Cập nhật quiz thành công');
      } else {
        await axiosClient.post('/quizzes', data);
        showMsg('Tạo quiz thành công');
      }
      setShowForm(false);
      fetchAll();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Lỗi', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa quiz này? Tất cả bài làm sẽ bị xóa.')) return;
    try {
      await axiosClient.delete(`/quizzes/${id}`);
      showMsg('Đã xóa quiz');
      if (selectedQuiz?._id === id) setSelectedQuiz(null);
      fetchAll();
    } catch (err) {
      showMsg('Lỗi', 'error');
    }
  };

  const totalQuestions = (quiz) => {
    let count = quiz.fixedQuestions?.length || 0;
    quiz.randomConfig?.forEach(r => count += r.count);
    return count;
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1c1917' }}>Quản lý Quiz</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>{quizzes.length} bài kiểm tra</p>
        </div>
        <button onClick={openCreateForm}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg"
          style={{ background: '#e8850a' }}>
          + Tạo quiz mới
        </button>
      </div>

      {msg.text && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">Đang tải...</div>
      ) : (
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* LEFT: Quiz list */}
          <div className="lg:w-1/2 space-y-3">
            {quizzes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border" style={{ borderColor: '#e5ddd0' }}>
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-600">Chưa có quiz nào</h3>
              </div>
            ) : quizzes.map(quiz => (
              <div key={quiz._id}
                onClick={() => selectQuiz(quiz)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${selectedQuiz?._id === quiz._id ? 'ring-2' : ''}`}
                style={{ borderColor: '#e5ddd0', ringColor: '#e8850a' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm" style={{ color: '#1c1917' }}>{quiz.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        ⏱ {quiz.duration} phút
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                        📝 {totalQuestions(quiz)} câu
                      </span>
                      {quiz.isActive ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">Đang mở</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Đã đóng</span>
                      )}
                    </div>
                    {quiz.classIds?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {quiz.classIds.map(c => (
                          <span key={c._id || c} className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                            {c.name || c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0 ml-2">
                    <button onClick={(e) => { e.stopPropagation(); openEditForm(quiz); }}
                      className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors text-sm">✏️</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(quiz._id); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors text-sm">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Selected quiz stats */}
          <div className="lg:w-1/2">
            {selectedQuiz ? (
              <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#e5ddd0' }}>
                <h2 className="text-lg font-bold mb-4" style={{ color: '#1c1917' }}>{selectedQuiz.title}</h2>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="text-center p-3 rounded-lg" style={{ background: '#fef8ee' }}>
                    <div className="text-2xl font-bold" style={{ color: '#e8850a' }}>{totalQuestions(selectedQuiz)}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#78716c' }}>Câu hỏi</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: '#f0fdf4' }}>
                    <div className="text-2xl font-bold text-green-600">{attempts.filter(a => a.status === 'submitted').length}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#78716c' }}>Đã nộp</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: '#eff6ff' }}>
                    <div className="text-2xl font-bold text-blue-600">
                      {attempts.length > 0 ? Math.round(attempts.filter(a => a.status === 'submitted').reduce((sum, a) => sum + a.percentage, 0) / (attempts.filter(a => a.status === 'submitted').length || 1)) : 0}%
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#78716c' }}>TB điểm</div>
                  </div>
                </div>

                {/* Random config display */}
                {selectedQuiz.randomConfig?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 mb-2">CẤU HÌNH RANDOM:</h4>
                    <div className="space-y-1">
                      {selectedQuiz.randomConfig.map((r, i) => (
                        <div key={i} className="text-sm bg-gray-50 rounded-lg px-3 py-2 flex flex-wrap gap-2">
                          {r.subject && <span className="text-blue-700">{r.subject}</span>}
                          {r.topic && <span className="text-purple-700">• {r.topic}</span>}
                          {r.grade && <span className="text-gray-600">• Lớp {r.grade}</span>}
                          {r.difficulty && <span className="text-amber-700">• {DIFFICULTIES.find(d => d.value === r.difficulty)?.label || r.difficulty}</span>}
                          <span className="ml-auto font-semibold">{r.count} câu</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attempts table */}
                <h4 className="text-xs font-semibold text-gray-500 mb-2">KẾT QUẢ HỌC VIÊN:</h4>
                {attempts.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Chưa có ai làm bài</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b" style={{ borderColor: '#e5ddd0' }}>
                          <th className="text-left py-2 font-semibold text-gray-500">Học viên</th>
                          <th className="text-center py-2 font-semibold text-gray-500">Điểm</th>
                          <th className="text-center py-2 font-semibold text-gray-500">%</th>
                          <th className="text-center py-2 font-semibold text-gray-500">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.map(a => (
                          <tr key={a._id} className="border-b" style={{ borderColor: '#f5f0eb' }}>
                            <td className="py-2">
                              <span className="font-medium text-gray-800">{a.student?.fullName}</span>
                              {a.student?.grade && <span className="text-xs text-gray-400 ml-1">({a.student.grade})</span>}
                            </td>
                            <td className="text-center">{a.score}/{a.totalQuestions}</td>
                            <td className="text-center">
                              <span className={`font-semibold ${a.percentage >= 80 ? 'text-green-600' : a.percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                {a.percentage}%
                              </span>
                            </td>
                            <td className="text-center">
                              {a.status === 'submitted' ? (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">Đã nộp</span>
                              ) : (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">Đang làm</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border p-8 text-center" style={{ borderColor: '#e5ddd0' }}>
                <div className="text-4xl mb-3">👈</div>
                <p className="text-sm text-gray-400">Chọn một quiz để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === CREATE/EDIT FORM MODAL === */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10" style={{ borderColor: '#e5ddd0' }}>
              <h2 className="text-lg font-bold" style={{ color: '#1c1917' }}>
                {editingId ? 'Sửa quiz' : 'Tạo quiz mới'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title & Duration */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#44403c' }}>Tên quiz *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: '#d6ccc0' }}
                    placeholder="VD: Kiểm tra Toán chương 1" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#44403c' }}>Thời gian (phút)</label>
                  <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: '#d6ccc0' }} min={1} />
                </div>
              </div>

              {/* Assign to classes */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#44403c' }}>Giao cho lớp</label>
                <div className="flex flex-wrap gap-2">
                  {classes.map(c => (
                    <button key={c._id} type="button" onClick={() => toggleClassId(c._id)}
                      className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${form.classIds.includes(c._id) ? 'border-amber-400 bg-amber-50 text-amber-700 font-medium' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
                {classes.length === 0 && <p className="text-xs text-gray-400">Chưa có lớp nào</p>}
              </div>

              {/* Time window */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#44403c' }}>Bắt đầu (tùy chọn)</label>
                  <input type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: '#d6ccc0' }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#44403c' }}>Kết thúc (tùy chọn)</label>
                  <input type="datetime-local" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: '#d6ccc0' }} />
                </div>
              </div>

              {/* Random config */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#44403c' }}>
                  Cấu hình random câu hỏi
                </label>
                <div className="space-y-3">
                  {form.randomConfig.map((rc, i) => (
                    <div key={i} className="border rounded-xl p-3 space-y-2" style={{ borderColor: '#e5ddd0' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400">Tiêu chí #{i + 1}</span>
                        {form.randomConfig.length > 1 && (
                          <button type="button" onClick={() => removeRandomCriteria(i)}
                            className="text-red-400 hover:text-red-600 text-xs px-2">✕ Xóa</button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <input value={rc.topic} onChange={e => updateRandomConfig(i, 'topic', e.target.value)}
                          className="border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: '#d6ccc0' }}
                          placeholder="Chủ đề" list={`topic-rc-${i}`} />
                        <datalist id={`topic-rc-${i}`}>
                          {filterOptions.topics.map(t => <option key={t} value={t} />)}
                        </datalist>
                        <select value={rc.grade} onChange={e => updateRandomConfig(i, 'grade', e.target.value)}
                          className="border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: '#d6ccc0' }}>
                          <option value="">Lớp</option>
                          {filterOptions.grades.map(g => <option key={g} value={g}>Lớp {g}</option>)}
                        </select>
                        <select value={rc.difficulty} onChange={e => updateRandomConfig(i, 'difficulty', e.target.value)}
                          className="border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: '#d6ccc0' }}>
                          <option value="">Độ khó</option>
                          {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Số câu:</label>
                        <input type="number" value={rc.count} onChange={e => updateRandomConfig(i, 'count', e.target.value)}
                          className="ml-2 w-20 border rounded-lg px-2 py-1 text-sm" style={{ borderColor: '#d6ccc0' }} min={1} />
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addRandomCriteria}
                  className="mt-2 text-sm font-medium px-3 py-1.5 rounded-lg border border-dashed hover:bg-gray-50"
                  style={{ borderColor: '#d6ccc0', color: '#78716c' }}>
                  + Thêm tiêu chí
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white hover:shadow-lg transition-all"
                  style={{ background: '#e8850a' }}>
                  {editingId ? 'Cập nhật' : 'Tạo quiz'}
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

export default QuizManager;
