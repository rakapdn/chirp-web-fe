const TOKEN_KEY = "token";
const USERID_KEY = "userId";

const TokenStorage = {
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
  setUserId: (userId) => {
    localStorage.setItem(USERID_KEY, userId.toString());
  },
  getUserId: () => {
    const userId = localStorage.getItem(USERID_KEY);
    return userId ? parseInt(userId, 10) : null;
  },
  removeUserId: () => {
    localStorage.removeItem(USERID_KEY);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERID_KEY);
  },
};

export default TokenStorage;
