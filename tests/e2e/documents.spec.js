import { expect, test } from '@playwright/test';
import { STUDENT_SESSION, getApiRequestKey, jsonResponse } from './support/api';

test('student can buy a document from the marketplace detail page', async ({ page }) => {
  let purchased = false;

  await page.route('http://localhost:3000/api/**', async (route) => {
    const key = getApiRequestKey(route.request());

    switch (key) {
      case 'POST /auth/refresh':
        return jsonResponse(route, STUDENT_SESSION);
      case 'GET /documents/doc-1':
        return jsonResponse(route, {
          data: {
            _id: 'doc-1',
            title: 'Chuyen de Ham so',
            description: 'Tong hop bai tap ham so theo muc do.',
            subject: 'Toan',
            grade: 10,
            topic: 'Ham so',
            category: 'tài_liệu',
            price: 50000,
            averageRating: 4.8,
            reviewCount: 0,
            totalDownloads: 12,
            seller: { _id: 'admin-1', fullName: 'Thay Long' },
            files: [{ filename: 'ham-so.pdf', size: 1024, mimeType: 'application/pdf' }],
            previewUrl: '',
            recommendedDocuments: [],
            bundleOffer: null,
          },
        });
      case 'GET /documents/doc-1/reviews':
        return jsonResponse(route, { data: [] });
      case 'GET /student/my-documents':
        return jsonResponse(route, {
          data: purchased ? [{
            _id: 'purchase-1',
            status: 'completed',
            createdAt: '2026-03-18T10:00:00.000Z',
            document: {
              _id: 'doc-1',
              title: 'Chuyen de Ham so',
              category: 'tài_liệu',
              price: 50000,
              files: [{ filename: 'ham-so.pdf', size: 1024, mimeType: 'application/pdf' }],
            },
          }] : [],
        });
      case 'GET /student/gamification':
        return jsonResponse(route, { xp: 3000, level: 4, streak: 5 });
      case 'POST /documents/doc-1/purchase':
        purchased = true;
        return jsonResponse(route, {
          data: {
            _id: 'purchase-1',
            status: 'completed',
            accessGranted: true,
            createdAt: '2026-03-18T10:00:00.000Z',
            document: {
              _id: 'doc-1',
              title: 'Chuyen de Ham so',
              category: 'tài_liệu',
              price: 50000,
              files: [{ filename: 'ham-so.pdf', size: 1024, mimeType: 'application/pdf' }],
            },
            followUp: {
              note: 'Tai lieu da duoc them vao thu vien. Ban co the tiep tuc voi cac tai lieu lien quan ben duoi.',
              recommendedDocuments: [],
            },
          },
        }, 201);
      default:
        return jsonResponse(route, { message: `Unhandled ${key}` }, 404);
    }
  });

  await page.goto('/student/documents/doc-1');
  await expect(page.getByText('Chuyen de Ham so')).toBeVisible();

  await page.getByRole('button', { name: 'Mua ngay' }).click();
  await expect(page.getByText('Mua tài liệu')).toBeVisible();
  await page.getByRole('button', { name: 'Xác nhận mua' }).click();

  await expect(page.getByText('Tai lieu da duoc them vao thu vien. Ban co the tiep tuc voi cac tai lieu lien quan ben duoi.')).toBeVisible();
});
