const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;
let role = null;
try {
  const roleStr = localStorage.getItem('role');
  role = roleStr ? (roleStr.startsWith('{') ? JSON.parse(roleStr) : roleStr) : null;
} catch (e) {
  role = localStorage.getItem('role');
}

const initialState = {
  isLogin: !!token,
  userId: user ? user.id : null,
  fullName: user ? user.fullName : null,
  email: user ? user.email : null,
  token: token || null,
  role: role || null
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isLogin: true,
        userId: action.userId,
        fullName: action.fullName,
        email: action.email,
        token: action.token,
        role: action.role
      };
    case 'LOGOUT':
      return {
        ...state,
        isLogin: false,
        userId: null,
        token: null,
        role: null
      };
    default:
      return state;
  }
};

export default authReducer;
