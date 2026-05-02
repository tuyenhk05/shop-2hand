const initialState = {
  isLogin: false,
  userId: null,
  fullName: null,
  email: null,
  token: null,
  role: null,
  isLoading: true // To show splash screen while checking async storage
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'RESTORE_AUTH':
      return {
        ...state,
        isLogin: !!action.token,
        userId: action.userId || null,
        fullName: action.fullName || null,
        email: action.email || null,
        token: action.token || null,
        role: action.role || null,
        isLoading: false
      };
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
        fullName: null,
        email: null,
        token: null,
        role: null
      };
    default:
      return state;
  }
};

export default authReducer;
