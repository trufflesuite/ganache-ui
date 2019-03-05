import * as GoogleAnalytics from "./engines/GoogleAnalytics";

const engines = [GoogleAnalytics];

export function processAction({ getState }) {
  return next => action => {
    engines.forEach(engine => {
      engine.process(action, getState());
    });

    const returnValue = next(action);

    return returnValue;
  };
}

export function processPage(path, state) {
  engines.forEach(engine => {
    engine.processPage(path, state);
  });
}
