import authReducer, { reset, updateUserData } from './authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
  };
  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: undefined })).toEqual(initialState);
  });
  it('should reset state', () => {
    const state = { ...initialState, isError: true, message: 'err' };
    expect(authReducer(state, reset())).toEqual(initialState);
  });
  it('should update user data', () => {
    const state = { ...initialState, user: { name: 'A' } };
    const updated = authReducer(state, updateUserData({ name: 'B', email: 'b@example.com' }));
    expect(updated.user).toEqual({ name: 'B', email: 'b@example.com' });
  });
});

