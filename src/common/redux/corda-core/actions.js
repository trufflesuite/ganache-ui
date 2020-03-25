const prefix = "CORDA_CORE"; 

export const REFRESH_CORDAPP = `${prefix}/REFRESH_CORDAPP`;
export const refreshCordapp = function(cordapps) {
  return { type: REFRESH_CORDAPP, cordapps };
};
