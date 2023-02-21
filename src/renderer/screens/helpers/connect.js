import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";

// Connect a component to specific reducer names.
// e.g., connect(MyComponent, "core", "config")
export default function(component, ...reducers) {
  let connector = connect(
    state => {
      var props = {};
      reducers.forEach(reducer => {
        let name = reducer;
        let propName = reducer;
        if (Array.isArray(reducer)) {
          name = reducer[0];
          propName = reducer[1];
        }

        const reducerTree = name.split(".");
        let value = state;
        for (let i = 0; i < reducerTree.length; i++) {
          value = value[reducerTree[i]];

          if (!value) {
            throw new Error(
              `Tried connecting '${component.name}' to unknown state: ${name}`,
            );
          }
        }

        props[propName] = value;
      });

      return props;
    }
  );
  return compose(withRouter, connector)(component);
}
