import { showTitleScreen } from "../../common/redux/core/actions";

import { initAutoUpdates } from "./AutoUpdate";
import { initCore } from "./Core";
import { initConfig } from "./Config";
import { initLogs } from "./Logs";
import { initNetwork } from "./Network";
import { initWorkspaces } from "./Workspaces";
import { initEvents } from "./Events";

// This will be called before the very first render, so you can do whatever
// you want here. The Redux Store is available at this point, so you can
// dispatch any action you want
export function initRenderer(store) {
  // Load the first screen while we wait for the application to load
  store.dispatch(showTitleScreen());

  initCore(store);
  initConfig(store);
  initLogs(store);
  initNetwork(store);
  initAutoUpdates(store);
  initWorkspaces(store);
  initEvents(store);
}
