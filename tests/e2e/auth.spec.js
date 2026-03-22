import { expect, test } from '@playwright/test';
import { STUDENT_SESSION, getApiRequestKey, jsonResponse } from './support/api';

test('student can log in and reach the dashboard recommendation flow', async ({ page }) => {
  await page.route('http://localhost:3000/api/**', async (route) => {
    const key = getApiRequestKey(route.request());

    switch (key) {
      case 'POST /auth/refresh':
        return jsonResponse(route, { message: 'No active session' }, 401);
      case 'POST /login':
        return jsonResponse(route, STUDENT_SESSION);
      case 'GET /my-classes':
        return jsonResponse(route, { classes: [] });
      case 'GET /student/dashboard-summary':
        return jsonResponse(route, {
          upcomingQuizzes: [],
          weeklyStats: {
            quizzesCompleted: 0,
            avgScore: 0,
            questionsAnswered: 0,
          },
          recentActivity: [],
          recommendedNextAction: {
            title: 'On lai hinh hoc co ban',
            description: 'Tap trung vao tam giac dong dang va cac dang bai sai nhieu nhat.',
            href: '/student/performance',
          },
          masteryHighlights: {
            overallScore: 72,
            weakTopics: [{ topic: 'Tam giac dong dang', masteryScore: 48 }],
            overdueFlashcards: 2,
          },
        });
      case 'GET /announcements':
        return jsonResponse(route, { announcements: [] });
      case 'GET /student/gamification':
        return jsonResponse(route, { xp: 120, level: 2, streak: 3 });
      default:
        return jsonResponse(route, { message: `Unhandled ${key}` }, 404);
    }
  });

  await page.goto('/login');
  await page.getByPlaceholder('Nhập tên đăng nhập').fill('student1');
  await page.getByPlaceholder('Nhập mật khẩu').fill('secret123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  await expect(page).toHaveURL(/\/student\/dashboard$/);
  await expect(page.getByText('Bước tiếp theo được đề xuất')).toBeVisible();
  await expect(page.getByText('On lai hinh hoc co ban')).toBeVisible();
});
