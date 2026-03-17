import { Link, useParams } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import LatexRenderer from '../../components/LatexRenderer';
import { useChatQuestionSourceQuery } from '../../features/chat/hooks';

const DIFFICULTY_LABELS = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó',
};

const buildTopicChatHref = (question) => (
  `/student/chat?${new URLSearchParams({
    contextType: 'topic',
    contextLabel: question?.topic || 'Chủ đề liên quan',
  }).toString()}`
);

const ChatQuestionSource = () => {
  const { questionId } = useParams();
  const questionSourceQuery = useChatQuestionSourceQuery(questionId);
  const question = questionSourceQuery.data;

  if (questionSourceQuery.isPending) {
    return (
      <StudentLayout>
        <div className="py-20 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl card">
            <svg className="animate-spin w-5 h-5" style={{ color: 'var(--amber)' }} viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Đang tải nguồn tham khảo...</span>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!question) {
    return (
      <StudentLayout>
        <div className="py-20 text-center fade-in-up">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--danger-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: 'var(--danger)' }}>
              <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Không tìm thấy nguồn tham khảo</h3>
          <Link to="/student/chat" className="btn-secondary inline-flex items-center gap-1.5 mt-4 py-2 px-5 text-sm">
            Quay lại EduBot
          </Link>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-5">
          <Link
            to="/student/chat"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-all rounded-lg px-2 py-1 -ml-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            ← Quay lại EduBot
          </Link>
        </div>

        <div className="card rounded-2xl p-6 md:p-8 fade-in-up">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Câu hỏi tham khảo
              </h1>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Nguồn này chỉ hiển thị nội dung an toàn cho học viên, không bao gồm đáp án đúng hoặc lời giải ẩn.
              </p>
            </div>
            {question.topic && (
              <Link to={buildTopicChatHref(question)} className="btn-secondary py-2.5 px-4 text-sm">
                Hỏi EduBot về chủ đề này
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {question.subject ? <span className="badge badge-blue">{question.subject}</span> : null}
            {question.topic ? <span className="badge badge-purple">{question.topic}</span> : null}
            {question.grade ? <span className="badge badge-amber">Lớp {question.grade}</span> : null}
            {question.difficulty ? (
              <span className="badge badge-gray">{DIFFICULTY_LABELS[question.difficulty] || question.difficulty}</span>
            ) : null}
          </div>

          <div className="rounded-2xl p-5 md:p-6 mb-5" style={{ background: 'var(--bg-secondary)' }}>
            <div className="text-sm leading-7" style={{ color: 'var(--text-primary)' }}>
              <LatexRenderer text={question.content} />
            </div>
          </div>

          {question.mediaUrl ? (
            <div className="mb-5">
              <img
                src={question.mediaUrl}
                alt=""
                className="max-w-full rounded-2xl border"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
          ) : null}

          {question.type === 'mcq' && question.options?.length > 0 ? (
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div
                  key={`${question._id}-option-${index}`}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl border"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    <LatexRenderer text={option.text} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </StudentLayout>
  );
};

export default ChatQuestionSource;
