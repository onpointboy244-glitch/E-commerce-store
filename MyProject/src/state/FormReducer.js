export function reducer(state, action) {
  switch (action.type) {
    case "TOGGLE_PASSWORD":
      return { ...state, showPassword: !state.showPassword };
    case "TOGGLE_CONFIRM_PASSWORD":
      return { ...state, showConfirmPassword: !state.showConfirmPassword };
    case "SET_ERROR":
      return { ...state, error: action.payload, shake: action.payload !== "" };
    default:
      return state;
  }
}
