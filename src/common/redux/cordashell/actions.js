const prefix = "CORDASHELL";

export const GET_TERMINAL = `${prefix}/GET_TERMINAL`;
export const getTerminal = function(safeName) {
  return { type: GET_TERMINAL, safeName };
};

export const SSH_DATA = `${prefix}/SSH_DATA`;
export const CLEAR_TERM = `${prefix}/CLEAR_TERM`;

export const SSH_RESIZE = `${prefix}/SSH_RESIZE`;

export const FIT_TERMINAL = `${prefix}/FIT_TERMINAL`;
export const fitTerminal = function(safeName) {
  return { type: FIT_TERMINAL, safeName };
};
