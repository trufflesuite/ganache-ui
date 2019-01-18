const prefix = "NETWORK";

export const SET_INTERFACES = `${prefix}/SET_INTERFACES`;
export function setInterfaces(interfaces) {
  return { type: SET_INTERFACES, interfaces };
}
