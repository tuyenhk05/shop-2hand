const initialState = {
  isLogin: false,
  userId: null
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isLogin: true,
        userId: action.userId
      };
    case 'LOGOUT':
      return {
        ...state,
        isLogin: false,
        userId: null
      };
    default:
      return state;
  }
};

export default authReducer;
