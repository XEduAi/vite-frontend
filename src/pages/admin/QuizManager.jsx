import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../api/errors';
import AdminLayout from '../../components/AdminLayout';
import { useAdminClassesQuery } from '../../features/admin/lookups';
import {
  useAdminQuizAttemptsQuery,
  useAdminQuizListQuery,
  useDeleteQuizMutation,
  useQuestionFiltersQuery,
  useSaveQuizMutation,
} from '../../features/quiz/hooks';

const DIFFICULTIES = [
  { value: 'easy', label: 'Dễ' },
  { value: 'medium', label: 'TB' },
  { value: 'hard', label: 'Khó' },
];

const EMPTY_FORM = {
  title: '',
  duration: 45,
  classIds: [],
  startTime: '',
  endTime: '',
  fixedQuestions: [],
  randomConfig: [{ subject: '', topic: '', grade: '', difficulty: '', count: 10 }],
};

const QuizManager = () => {
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const adminQuizzesQuery = useAdminQuizListQuery();
  const adminClassesQuery = useAdminClassesQuery();
  const questionFiltersQuery = useQuestionFiltersQuery();
  const quizAttemptsQuery = useAdminQuizAttemptsQuery(selectedQuizId);
  const saveQuizMutation = useSaveQuizMutation();
  const deleteQuizMutation = useDeleteQuizMutation();

  const quizzes = adminQuizzesQuery.data || [];
  const classes = adminClassesQuery.data || [];
  const filterOptions = questionFiltersQuery.data || { subjects: [], topics: [], grades: [] };
  const selectedQuiz = quizzes.find((quiz) => quiz._id === selectedQuizId) || null;
  const attempts = quizAttemptsQuery.data || [];
  const loading = adminQuizzesQuery.isPending || adminClassesQuery.isPending || questionFiltersQuery.isPending;

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  useEffect(() => {
    if (selectedQuizId && !selectedQuiz) {
      setSelectedQuizId(null);
    }
  }, [selectedQuiz, selectedQuizId]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      classIds: [],
      randomConfig: [{ subject: '', topic: '', grade: '', difficulty: '', count: 10 }],
    });
    setShowForm(true);
  };

  const openEditForm = (quiz) => {
    setEditingId(quiz._id);
    setForm({
      title: quiz.title,
      duration: quiz.duration,
      classIds: quiz.classIds?.map((item) => item._id || item) || [],
      startTime: quiz.startTime ? new Date(quiz.startTime).toISOString().slice(0, 16) : '',
      endTime: quiz.endTime ? new Date(quiz.endTime).toISOString().slice(0, 16) : '',
      fixedQuestions: quiz.fixedQuestions || [],
      randomConfig: quiz.randomConfig?.length > 0
        ? quiz.randomConfig.map((item) => ({
            subject: item.subject || '',
            topic: item.topic || '',
            grade: item.grade || '',
            difficulty: item.difficulty || '',
            count: item.count,
          }))
        : [{ subject: '', topic: '', grade: '', difficulty: '', count: 10 }],
    });
    setShowForm(true);
  };

  const toggleClassId = (id) => {
    setForm((previousForm) => ({
      ...previousForm,
      classIds: previousForm.classIds.includes(id)
        ? previousForm.classIds.filter((classId) => classId !== id)
        : [...previousForm.classIds, id],
    }));
  };

  const updateRandomConfig = (index, field, value) => {
    const nextRandomConfig = [...form.randomConfig];
    nextRandomConfig[index] = { ...nextRandomConfig[index], [field]: value };
    setForm({ ...form, randomConfig: nextRandomConfig });
  };

  const addRandomCriteria = () => {
    setForm({
      ...form,
      randomConfig: [...form.randomConfig, { subject: '', topic: '', grade: '', difficulty: '', count: 5 }],
    });
  };

  const removeRandomCriteria = (index) => {
    if (form.randomConfig.length <= 1) return;
    setForm({ ...form, randomConfig: form.randomConfig.filter((_, itemIndex) => itemIndex !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showMsg('Nhập tên quiz', 'error');
      return;
    }

    try {
      await saveQuizMutation.mutateAsync({
        quizId: editingId,
        payload: {
          title: form.title,
          duration: Number(form.duration),
          classIds: form.classIds,
          startTime: form.startTime || undefined,
          endTime: form.endTime || undefined,
          randomConfig: form.randomConfig.map((item) => ({
            ...item,
            grade: item.grade ? Number(item.grade) : undefined,
            count: Number(item.count),
          })),
        },
      });

      showMsg(editingId ? 'Cập nhật quiz thành công' : 'Tạo quiz thành công');
      setShowForm(false);
    } catch (err) {
      showMsg(getApiErrorMessage(err, 'Lỗi khi lưu quiz'), 'error');
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Xóa quiz này? Tất cả bài làm sẽ bị xóa.')) return;

    try {
      await deleteQuizMutation.mutateAsync(quizId);
      if (selectedQuizId === quizId) {
        setSelectedQuizId(null);
      }
      showMsg('Đã xóa quiz');
    } catch (err) {
      showMsg(getApiErrorMessage(err, 'Lỗi khi xóa quiz'), 'error');
    }
  };

  const totalQuestions = (quiz) => {
    let count = quiz.fixedQuestions?.length || 0;
    quiz.randomConfig?.forEach((item) => {
      count += item.count;
    });
    return count;
  };

  const averageScore = attempts.length > 0
    ? Math.round(
        attempts
          .filter((attempt) => attempt.status === 'submitted')
          .reduce((sum, attempt) => sum + attempt.percentage, 0) /
          (attempts.filter((attempt) => attempt.status === 'submitted').length || 1)
      )
    : 0;

  const queryErrors = [
    adminQuizzesQuery.isError ? { key: 'quizzes', message: getApiErrorMessage(adminQuizzesQuery.error, 'Không thể tải danh sách quiz') } : null,
    adminClassesQuery.isError ? { key: 'classes', message: getApiErrorMessage(adminClassesQuery.error, 'Không thể tải danh sách lớp') } : null,
    questionFiltersQuery.isError ? { key: 'filters', message: getApiErrorMessage(questionFiltersQuery.error, 'Không thể tải bộ lọc câu hỏi') } : null,
  ].filter(Boolean);

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1c1917' }}>Quản lý Quiz</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>{quizzes.length} bài kiểm tra</p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg"
          style={{ background: '#e8850a' }}
        >
          + Tạo quiz mới
        </button>
      </div>

      {msg.text && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {msg.text}
        </div>
      )}

      {queryErrors.length > 0 && (
        <div className="mb-4 px-4 py-3 rounded-lg border bg-amber-50 border-amber-200">
          <div className="space-y-2">
            {queryErrors.map((error) => (
              <div key={error.key} className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p className="text-sm font-medium text-amber-900">{error.message}</p>
                <button
                  onClick={() => {
                    if (error.key === 'quizzes') adminQuizzesQuery.refetch();
                    if (error.key === 'classes') adminClassesQuery.refetch();
                    if (error.key === 'filters') questionFiltersQuery.refetch();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-amber-300 text-amber-800"
                >
                  Thử lại
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">Đang tải...</div>
      ) : (
        <div className="flex gap-6 flex-col lg:flex-row">
          <div className="lg:w-1/2 space-y-3">
            {quizzes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border" style={{ borderColor: '#e5ddd0' }}>
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-600">Chưa có quiz nào</h3>
              </div>
            ) : quizzes.map((quiz) => (
              <div
                key={quiz._id}
                onClick={() => setSelectedQuizId(quiz._id)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${selectedQuizId === quiz._id ? 'ring-2' : ''}`}
                style={{ borderColor: '#e5ddd0', ringColor: '#e8850a' }}
              >
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
                        {quiz.classIds.map((item) => (
                          <span key={item._id || item} className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                            {item.name || item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditForm(quiz);
                      }}
                      className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(quiz._id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
                    <div className="text-2xl font-bold text-green-600">{attempts.filter((attempt) => attempt.status === 'submitted').length}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#78716c' }}>Đã nộp</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: '#eff6ff' }}>
                    <div className="text-2xl font-bold text-blue-600">{averageScore}%</div>
                    <div className="text-xs mt-0.5" style={{ color: '#78716c' }}>TB điểm</div>
                  </div>
                </div>

                {selectedQuiz.randomConfig?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 mb-2">CẤU HÌNH RANDOM:</h4>
                    <div className="space-y-1">
                      {selectedQuiz.randomConfig.map((item, index) => (
                        <div key={index} className="text-sm bg-gray-50 rounded-lg px-3 py-2 flex flex-wrap gap-2">
                          {item.subject && <span className="text-blue-700">{item.subject}</span>}
                          {item.topic && <span className="text-purple-700">• {item.topic}</span>}
                          {item.grade && <span className="text-gray-600">• Lớp {item.grade}</span>}
                          {item.difficulty && <span className="text-amber-700">• {DIFFICULTIES.find((difficulty) => difficulty.value === item.difficulty)?.label || item.difficulty}</span>}
                          <span className="ml-auto font-semibold">{item.count} câu</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h4 className="text-xs font-semibold text-gray-500 mb-2">KẾT QUẢ HỌC VIÊN:</h4>
                {quizAttemptsQuery.isPending ? (
                  <p className="text-sm text-gray-400 text-center py-4">Đang tải kết quả...</p>
                ) : quizAttemptsQuery.isError ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <p className="text-sm font-medium text-amber-900">
                        {getApiErrorMessage(quizAttemptsQuery.error, 'Không thể tải kết quả học viên')}
                      </p>
                      <button
                        onClick={() => quizAttemptsQuery.refetch()}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-amber-300 text-amber-800"
                      >
                        Thử lại
                      </button>
                    </div>
                  </div>
                ) : attempts.length === 0 ? (
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
                        {attempts.map((attempt) => (
                          <tr key={attempt._id} className="border-b" style={{ borderColor: '#f5f0eb' }}>
                            <td className="py-2">
                              <span className="font-medium text-gray-800">{attempt.student?.fullName}</span>
                              {attempt.student?.grade && <span className="text-xs text-gray-400 ml-1">({attempt.student.grade})</span>}
                            </td>
                            <td className="text-center">{attempt.score}/{attempt.totalQuestions}</td>
                            <td className="text-center">
                              <span className={`font-semibold ${attempt.percentage >= 80 ? 'text-green-600' : attempt.percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                {attempt.percentage}%
                              </span>
                            </td>
                            <td className="text-center">
                              {attempt.status === 'submitted' ? (
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
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#44403c' }}>Tên quiz *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    style={{ borderColor: '#d6ccc0' }}
                    placeholder="VD: Kiểm tra Toán chương 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#44403c' }}>Thời gian (phút)</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    style={{ borderColor: '#d6ccc0' }}
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#44403c' }}>Giao cho lớp</label>
                <div className="flex flex-wrap gap-2">
                  {classes.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => toggleClassId(item._id)}
                      className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${form.classIds.includes(item._id) ? 'border-amber-400 bg-amber-50 text-amber-700 font-medium' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
                {classes.length === 0 && <p className="text-xs text-gray-400">Chưa có lớp nào</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#44403c' }}>Bắt đầu (tùy chọn)</label>
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    style={{ borderColor: '#d6ccc0' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#44403c' }}>Kết thúc (tùy chọn)</label>
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    style={{ borderColor: '#d6ccc0' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#44403c' }}>
                  Cấu hình random câu hỏi
                </label>
                <div className="space-y-3">
                  {form.randomConfig.map((item, index) => (
                    <div key={index} className="border rounded-xl p-3 space-y-2" style={{ borderColor: '#e5ddd0' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400">Tiêu chí #{index + 1}</span>
                        {form.randomConfig.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRandomCriteria(index)}
                            className="text-red-400 hover:text-red-600 text-xs px-2"
                          >
                            ✕ Xóa
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <input
                          value={item.topic}
                          onChange={(e) => updateRandomConfig(index, 'topic', e.target.value)}
                          className="border rounded-lg px-2 py-1.5 text-sm"
                          style={{ borderColor: '#d6ccc0' }}
                          placeholder="Chủ đề"
                          list={`topic-rc-${index}`}
                        />
                        <datalist id={`topic-rc-${index}`}>
                          {filterOptions.topics.map((topic) => <option key={topic} value={topic} />)}
                        </datalist>
                        <select
                          value={item.grade}
                          onChange={(e) => updateRandomConfig(index, 'grade', e.target.value)}
                          className="border rounded-lg px-2 py-1.5 text-sm"
                          style={{ borderColor: '#d6ccc0' }}
                        >
                          <option value="">Lớp</option>
                          {filterOptions.grades.map((grade) => <option key={grade} value={grade}>Lớp {grade}</option>)}
                        </select>
                        <select
                          value={item.difficulty}
                          onChange={(e) => updateRandomConfig(index, 'difficulty', e.target.value)}
                          className="border rounded-lg px-2 py-1.5 text-sm"
                          style={{ borderColor: '#d6ccc0' }}
                        >
                          <option value="">Độ khó</option>
                          {DIFFICULTIES.map((difficulty) => <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Số câu:</label>
                        <input
                          type="number"
                          value={item.count}
                          onChange={(e) => updateRandomConfig(index, 'count', e.target.value)}
                          className="ml-2 w-20 border rounded-lg px-2 py-1 text-sm"
                          style={{ borderColor: '#d6ccc0' }}
                          min={1}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addRandomCriteria}
                  className="mt-2 text-sm font-medium px-3 py-1.5 rounded-lg border border-dashed hover:bg-gray-50"
                  style={{ borderColor: '#d6ccc0', color: '#78716c' }}
                >
                  + Thêm tiêu chí
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saveQuizMutation.isPending}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white hover:shadow-lg transition-all disabled:opacity-60"
                  style={{ background: '#e8850a' }}
                >
                  {saveQuizMutation.isPending ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo quiz'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium border hover:bg-gray-50"
                  style={{ borderColor: '#d6ccc0', color: '#78716c' }}
                >
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
