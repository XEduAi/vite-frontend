import { useState } from 'react';
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

const scoreColor = (pct) => {
  if (pct >= 80) return 'var(--olive)';
  if (pct >= 50) return 'var(--amber-warm)';
  return 'var(--terracotta)';
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
  const resolvedSelectedQuizId = adminQuizzesQuery.data?.some((quiz) => quiz._id === selectedQuizId)
    ? selectedQuizId
    : null;
  const quizAttemptsQuery = useAdminQuizAttemptsQuery(resolvedSelectedQuizId);
  const saveQuizMutation = useSaveQuizMutation();
  const deleteQuizMutation = useDeleteQuizMutation();

  const quizzes = adminQuizzesQuery.data || [];
  const classes = adminClassesQuery.data || [];
  const filterOptions = questionFiltersQuery.data || { subjects: [], topics: [], grades: [] };
  const selectedQuiz = quizzes.find((quiz) => quiz._id === resolvedSelectedQuizId) || null;
  const attempts = quizAttemptsQuery.data || [];
  const loading = adminQuizzesQuery.isPending || adminClassesQuery.isPending || questionFiltersQuery.isPending;

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

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
          <div className="bento-label" style={{ color: 'var(--amber-warm)' }}>Kiểm tra</div>
          <h1 className="bento-hero-title mt-1" style={{ color: 'var(--text-primary)' }}>Quản lý Quiz</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{quizzes.length} bài kiểm tra</p>
        </div>
        <button onClick={openCreateForm} className="btn-primary px-5 py-2.5">
          + Tạo quiz mới
        </button>
      </div>

      {msg.text && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
          style={{
            background: msg.type === 'error' ? 'var(--terracotta-soft)' : 'var(--olive-soft)',
            color: msg.type === 'error' ? 'var(--terracotta)' : 'var(--olive)',
          }}
        >
          {msg.text}
        </div>
      )}

      {queryErrors.length > 0 && (
        <div
          className="mb-4 px-4 py-3 rounded-lg border"
          style={{ background: 'var(--amber-soft)', borderColor: 'var(--border)' }}
        >
          <div className="space-y-2">
            {queryErrors.map((error) => (
              <div key={error.key} className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p className="text-sm font-medium" style={{ color: 'var(--amber-warm)' }}>{error.message}</p>
                <button
                  onClick={() => {
                    if (error.key === 'quizzes') adminQuizzesQuery.refetch();
                    if (error.key === 'classes') adminClassesQuery.refetch();
                    if (error.key === 'filters') questionFiltersQuery.refetch();
                  }}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  Thử lại
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>Đang tải...</div>
      ) : (
        <div className="flex gap-6 flex-col lg:flex-row">
          <div className="lg:w-1/2 space-y-3">
            {quizzes.length === 0 ? (
              <div className="bento-tile bento-tile-surface py-16 text-center">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Chưa có quiz nào</h3>
              </div>
            ) : quizzes.map((quiz) => {
              const isSelected = selectedQuizId === quiz._id;
              return (
                <div
                  key={quiz._id}
                  onClick={() => setSelectedQuizId(quiz._id)}
                  className="bento-tile bento-tile-surface p-4 cursor-pointer transition-all hover:opacity-90"
                  style={isSelected ? { boxShadow: '0 0 0 2px var(--amber-warm)' } : undefined}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{quiz.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}>
                          ⏱ {quiz.duration} phút
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--olive-soft)', color: 'var(--olive)' }}>
                          📝 {totalQuestions(quiz)} câu
                        </span>
                        {quiz.isActive ? (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--olive-soft)', color: 'var(--olive)' }}>Đang mở</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--border-light)', color: 'var(--text-muted)' }}>Đã đóng</span>
                        )}
                      </div>
                      {quiz.classIds?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {quiz.classIds.map((item) => (
                            <span key={item._id || item} className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}>
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
                        className="p-1.5 rounded-lg transition-colors text-sm"
                        style={{ color: 'var(--amber-warm)' }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(quiz._id);
                        }}
                        className="p-1.5 rounded-lg transition-colors text-sm"
                        style={{ color: 'var(--terracotta)' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:w-1/2">
            {selectedQuiz ? (
              <div className="bento-tile bento-tile-surface p-5">
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{selectedQuiz.title}</h2>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="text-center p-3 rounded-lg" style={{ background: 'var(--amber-soft)' }}>
                    <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--amber-warm)' }}>{totalQuestions(selectedQuiz)}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Câu hỏi</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: 'var(--olive-soft)' }}>
                    <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--olive)' }}>
                      {attempts.filter((attempt) => attempt.status === 'submitted').length}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Đã nộp</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: 'var(--amber-soft)' }}>
                    <div className="text-2xl font-bold tabular-nums" style={{ color: scoreColor(averageScore) }}>{averageScore}%</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>TB điểm</div>
                  </div>
                </div>

                {selectedQuiz.randomConfig?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Cấu hình random</h4>
                    <div className="space-y-1">
                      {selectedQuiz.randomConfig.map((item, index) => (
                        <div
                          key={index}
                          className="text-sm rounded-lg px-3 py-2 flex flex-wrap gap-2"
                          style={{ background: 'var(--cream-warm)', color: 'var(--text-secondary)' }}
                        >
                          {item.subject && <span style={{ color: 'var(--text-primary)' }}>{item.subject}</span>}
                          {item.topic && <span>• {item.topic}</span>}
                          {item.grade && <span>• Lớp {item.grade}</span>}
                          {item.difficulty && <span style={{ color: 'var(--amber-warm)' }}>• {DIFFICULTIES.find((d) => d.value === item.difficulty)?.label || item.difficulty}</span>}
                          <span className="ml-auto font-semibold" style={{ color: 'var(--text-primary)' }}>{item.count} câu</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h4 className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Kết quả học viên</h4>
                {quizAttemptsQuery.isPending ? (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>Đang tải kết quả...</p>
                ) : quizAttemptsQuery.isError ? (
                  <div className="rounded-lg border px-4 py-3" style={{ background: 'var(--amber-soft)', borderColor: 'var(--border)' }}>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <p className="text-sm font-medium" style={{ color: 'var(--amber-warm)' }}>
                        {getApiErrorMessage(quizAttemptsQuery.error, 'Không thể tải kết quả học viên')}
                      </p>
                      <button onClick={() => quizAttemptsQuery.refetch()} className="btn-secondary px-3 py-1.5 text-xs">
                        Thử lại
                      </button>
                    </div>
                  </div>
                ) : attempts.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>Chưa có ai làm bài</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                          <th className="text-left py-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Học viên</th>
                          <th className="text-center py-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Điểm</th>
                          <th className="text-center py-2 font-semibold" style={{ color: 'var(--text-muted)' }}>%</th>
                          <th className="text-center py-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.map((attempt) => (
                          <tr key={attempt._id} className="border-b" style={{ borderColor: 'var(--border-light)' }}>
                            <td className="py-2">
                              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{attempt.student?.fullName}</span>
                              {attempt.student?.grade && (
                                <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>({attempt.student.grade})</span>
                              )}
                            </td>
                            <td className="text-center tabular-nums" style={{ color: 'var(--text-secondary)' }}>{attempt.score}/{attempt.totalQuestions}</td>
                            <td className="text-center">
                              <span className="font-semibold tabular-nums" style={{ color: scoreColor(attempt.percentage) }}>
                                {attempt.percentage}%
                              </span>
                            </td>
                            <td className="text-center">
                              {attempt.status === 'submitted' ? (
                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--olive-soft)', color: 'var(--olive)' }}>Đã nộp</span>
                              ) : (
                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}>Đang làm</span>
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
              <div className="bento-tile bento-tile-surface p-8 text-center">
                <div className="text-4xl mb-3">👈</div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chọn một quiz để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 modal-overlay">
          <div
            className="rounded-2xl w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl"
            style={{ background: 'var(--white)', border: '1px solid var(--border)' }}
          >
            <div
              className="sticky top-0 px-6 py-4 border-b flex items-center justify-between z-10"
              style={{ background: 'var(--white)', borderColor: 'var(--border)' }}
            >
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {editingId ? 'Sửa quiz' : 'Tạo quiz mới'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-xl"
                style={{ color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tên quiz *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input"
                    placeholder="VD: Kiểm tra Toán chương 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Thời gian (phút)</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="input"
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Giao cho lớp</label>
                <div className="flex flex-wrap gap-2">
                  {classes.map((item) => {
                    const selected = form.classIds.includes(item._id);
                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => toggleClassId(item._id)}
                        className="text-sm px-3 py-1.5 rounded-lg border font-medium transition-colors"
                        style={selected
                          ? { borderColor: 'var(--amber-warm)', background: 'var(--amber-soft)', color: 'var(--amber-warm)' }
                          : { borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                      >
                        {item.name}
                      </button>
                    );
                  })}
                </div>
                {classes.length === 0 && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Chưa có lớp nào</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Bắt đầu (tùy chọn)</label>
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Kết thúc (tùy chọn)</label>
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Cấu hình random câu hỏi
                </label>
                <div className="space-y-3">
                  {form.randomConfig.map((item, index) => (
                    <div key={index} className="border rounded-xl p-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Tiêu chí #{index + 1}</span>
                        {form.randomConfig.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRandomCriteria(index)}
                            className="text-xs px-2"
                            style={{ color: 'var(--terracotta)' }}
                          >
                            ✕ Xóa
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <input
                          value={item.topic}
                          onChange={(e) => updateRandomConfig(index, 'topic', e.target.value)}
                          className="input text-sm py-1.5"
                          placeholder="Chủ đề"
                          list={`topic-rc-${index}`}
                        />
                        <datalist id={`topic-rc-${index}`}>
                          {filterOptions.topics.map((topic) => <option key={topic} value={topic} />)}
                        </datalist>
                        <select
                          value={item.grade}
                          onChange={(e) => updateRandomConfig(index, 'grade', e.target.value)}
                          className="input text-sm py-1.5"
                        >
                          <option value="">Lớp</option>
                          {filterOptions.grades.map((grade) => <option key={grade} value={grade}>Lớp {grade}</option>)}
                        </select>
                        <select
                          value={item.difficulty}
                          onChange={(e) => updateRandomConfig(index, 'difficulty', e.target.value)}
                          className="input text-sm py-1.5"
                        >
                          <option value="">Độ khó</option>
                          {DIFFICULTIES.map((difficulty) => <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Số câu:</label>
                        <input
                          type="number"
                          value={item.count}
                          onChange={(e) => updateRandomConfig(index, 'count', e.target.value)}
                          className="input w-20 text-sm py-1"
                          min={1}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addRandomCriteria}
                  className="mt-2 text-sm font-medium px-3 py-1.5 rounded-lg border border-dashed"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  + Thêm tiêu chí
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saveQuizMutation.isPending}
                  className="btn-primary px-6 py-2.5"
                >
                  {saveQuizMutation.isPending ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo quiz'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary px-6 py-2.5"
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
