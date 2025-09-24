// Utility to get current auth token from either localStorage or sessionStorage
export const getStoredUser = () => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {}
  if (!user) {
    try { user = JSON.parse(sessionStorage.getItem('user')); } catch {}
  }
  return user;
};

export const getAuthToken = () => {
  const user = getStoredUser();
  return user && user.token ? user.token : null;
};
