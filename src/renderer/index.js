import { showTitleScreen } from "../common/redux/core/actions";

import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import { Provider } from "react-redux";
import createRootReducer from "../common/redux/reducer";
import { createHashHistory } from "history";
import createStore from "./init/store/createStore";
import { initRenderer } from "./init/index";
import { ipcRenderer } from "electron";
import App from "./App";
import "./css";

const hashHistory = createHashHistory();
const rootReducer = createRootReducer(hashHistory);
const store = createStore(rootReducer, hashHistory);
initRenderer(store);

ipcRenderer.on("navigate", (_, path) => {
  hashHistory.push(path);
});

const render = () => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <App history={hashHistory} />
      </Provider>
    </AppContainer>,
    document.getElementById("app"),
  );
};

render();

store.dispatch(showTitleScreen());


if (module.hot) {
  module.hot.accept('./App', () => {
    render()
  });

  module.hot.accept('../common/redux/reducer', () => {
    store.replaceReducer(rootReducer(history))
  })
}
