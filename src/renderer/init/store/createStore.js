export default process.env.NODE_ENV === "production" ? require("./createStore.production") : require("./createStore.development");
