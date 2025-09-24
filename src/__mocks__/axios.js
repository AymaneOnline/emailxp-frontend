// Jest manual mock for axios to avoid ESM parsing issues in tests
const axiosMock = {
  create: () => axiosMock,
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
};
export default axiosMock;
