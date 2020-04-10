import { initAutoUpdates } from "./AutoUpdate";
import { initCore } from "./Core";
import { initConfig } from "./Config";
import { initLogs } from "./Logs";
import { initNetwork } from "./Network";
import { initWorkspaces } from "./Workspaces";
import { initEvents } from "../../integrations/ethereum/renderer/init/Events";
import { initCordaShutdown } from "./CordaShutdown";

// This will be called before the very first render, so you can do whatever
// you want here. The Redux Store is available at this point, so you can
// dispatch any action you want
export function initRenderer(store) {
  initCore(store);
  initConfig(store);
  initLogs(store);
  initNetwork(store);
  initAutoUpdates(store);
  initWorkspaces(store);
  initEvents(store);
  initCordaShutdown(store);
}
