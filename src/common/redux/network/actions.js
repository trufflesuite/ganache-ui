const prefix = "NETWORK";

export const SET_INTERFACES = `${prefix}/SET_INTERFACES`;
export function setInterfaces(interfaces) {
  return { type: SET_INTERFACES, interfaces };
}

export const SET_TOAST = `${prefix}/SET_TOAST`;
export function setToast(message) {
  return { type: SET_TOAST, message };
}