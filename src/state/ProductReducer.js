export function reducer(state, action) {
  switch (action.type) {
    case "SET_ADDED":
      return {
        ...state,
        isAdded: true,
        localQty: 1,
      };
    case "SET_QTY":
      return {
        ...state,
        localQty: action.payload.quantity,
      };
    case "STOP": {
      return {
        ...state,
        isAdded: false,
        showModal: false,
      };
    }
    case "SHOW_MODAL":
      return {
        ...state,
        showModal: true,
      };
    case "HIDE_MODAL":
      return {
        ...state,
        showModal: false,
      };
  }
}
