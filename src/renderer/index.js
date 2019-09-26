import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import { Provider } from "react-redux";
import { Router, hashHistory } from "react-router";
import RootReducer from "../common/redux/reducer";
import createStore from "./init/store/createStore";
import { initRenderer } from "./init/index";
import { ipcRenderer } from "electron";
import routes from "./routes";
import "./css";

const store = createStore(RootReducer);
initRenderer(store);

ipcRenderer.on("navigate", (_, path) => {
  hashHistory.push(path);
});

const render = () => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <Router history={hashHistory} routes={routes} />
      </Provider>
    </AppContainer>,
    document.getElementById("app"),
  );
};

store.subscribe(render);

render();

if (module.hot) {
  module.hot.accept(render);
}
