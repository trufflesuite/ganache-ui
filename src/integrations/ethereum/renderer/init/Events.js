import { ipcRenderer } from "electron";

import {
  SET_SUBSCRIBED_TOPICS,
  setSubscribedTopics,
} from "../../common/redux/events/actions";

export function initEvents(store) {
  ipcRenderer.on(SET_SUBSCRIBED_TOPICS, (event, topics) => {
    store.dispatch(setSubscribedTopics(topics));
  });
}
