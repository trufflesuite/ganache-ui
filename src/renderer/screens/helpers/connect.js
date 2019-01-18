import { connect } from "react-redux";

// Connect a component to specific reducer names.
// e.g., connect(MyComponent, "core", "config")
export default function(component, ...reducers) {
  let connector = connect(
    state => {
      var props = {};

      reducers.forEach(name => {
        var value = state[name];

        if (!value) {
          throw new Error(
            `Tried connecting '${component.name}' to unknown state: ${name}`,
          );
        }

        props[name] = value;
      });

      return props;
    },
    dispatch => {
      return {
        dispatch,
      };
    },
  );
  return connector(component);
}
