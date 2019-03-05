const prefix = "APPSHELL";

export const SET_SCROLL_POSITION = `${prefix}/SET_SCROLL_POSITION`;
export const setScrollPosition = function(scrollPosition) {
  return { type: SET_SCROLL_POSITION, scrollPosition };
};
