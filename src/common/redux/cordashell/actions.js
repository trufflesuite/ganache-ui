const prefix = "CORDASHELL";

export const GET_TERMINAL = `${prefix}/GET_TERMINAL`;
export const getTerminal = function(safeName) {
  return { type: GET_TERMINAL, safeName };
};
