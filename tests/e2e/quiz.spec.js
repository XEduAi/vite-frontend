import { expect, test } from '@playwright/test';
import { STUDENT_SESSION, getApiRequestKey, jsonResponse } from './support/api';

test('student can start an official quiz from the quiz catalog', async ({ page }) => {
  await page.route('http://localhost:3000/api/**', async (route) => {
    const key = getApiRequestKey(route.request());

    switch (key) {
      case 'POST /auth/refresh':
        return jsonResponse(route, STUDENT_SESSION);
      case 'GET /my-quizzes':
        return jsonResponse(route, {
          officialQuizzes: [{
            _id: 'quiz-1',
            title: 'Quiz Dai so',
            duration: 30,
            classIds: [{ _id: 'class-1', name: 'Toan 10A' }],
            isActive: true,
          }],
          practiceQuizzes: [],
          attempts: {},
        });
      case 'GET /questions/filters':
        return jsonResponse(route, { subjects: ['Toan'], topics: ['Dai so'], grades: [10] });
      case 'GET /my-performance':
        return jsonResponse(route, { topicStats: [] });
      case 'POST /quizzes/quiz-1/start':
        return jsonResponse(route, {
          attempt: { _id: 'attempt-1' },
        });
      case 'GET /attempts/attempt-1':
        return jsonResponse(route, {
          remainingSeconds: 1800,
          attempt: {
            _id: 'attempt-1',
            status: 'in_progress',
            startedAt: '2026-03-18T10:00:00.000Z',
            lastSavedAt: '2026-03-18T10:00:00.000Z',
            quiz: { title: 'Quiz Dai so' },
            questions: [
              {
                question: {
                  _id: 'question-1',
                  type: 'mcq',
                  content: '2 + 2 = ?',
                  subject: 'Toan',
                  topic: 'So hoc',
                  options: [
                    { text: '4' },
                    { text: '5' },
                  ],
                },
                selectedOption: -1,
              },
            ],
          },
        });
      default:
        return jsonResponse(route, { message: `Unhandled ${key}` }, 404);
    }
  });

  await page.goto('/student/quizzes');
  await expect(page.getByRole('heading', { name: 'Bài kiểm tra' })).toBeVisible();

  await page.getByRole('button', { name: 'Bắt đầu làm bài' }).click();

  await expect(page).toHaveURL(/\/student\/quiz\/attempt-1$/);
  await expect(page.getByText('Quiz Dai so')).toBeVisible();
  await expect(page.getByText('2 + 2 = ?')).toBeVisible();
});
