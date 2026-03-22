export const STUDENT_SESSION = {
  accessToken: 'student-access-token',
  token: 'student-access-token',
  role: 'student',
  fullName: 'Nguyen Hoc Vien',
  user: {
    id: 'student-1',
    username: 'student1',
    role: 'student',
    fullName: 'Nguyen Hoc Vien',
  },
};

export const jsonResponse = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json; charset=utf-8',
  body: JSON.stringify(body),
});

export const getApiRequestKey = (request) => {
  const url = new URL(request.url());
  return `${request.method()} ${url.pathname.replace('/api', '')}`;
};
