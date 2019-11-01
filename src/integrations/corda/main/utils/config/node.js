const conf = require("./templates/node.json");
const SPACES = 4;
const write = console.log;

const format = (el, element, isPermissions) => {
  let result;
  if (isPermissions) {
    switch (element.type) {
      case "string":
        result = `"${el}"`;
        break;
      default:
        result = `${el}`;
        break;
    }
  } else {
    switch (element.type) {
      case "string":
        result = `${el} = "${element.examples[0]}"`;
        break;
      default:
        result = `${el} = ${element.examples[0]}`;
        break;
    }
  }
  return result;
}

const generate = (root, depth = 0, isArray = false, isPermissions = false) => {
  const padding = " ".repeat(depth * SPACES);
  root.required.forEach((el) => {
    const current = root.properties[el];
    if (isArray) {
      if (current.type === "permissionsArray") {
        // SPECIAL CASE
        write(`${padding}${el} = [`)
        generate(current.items, depth + 1, false, true);
        write(`${padding}]`)
      } else {
        write(`${padding}${el}=${current.examples[0]}`)    
      }
    } else if (current.type === "object"){
      write(`${padding}${el} {`)
      generate(current, depth + 1);
      write(`${padding}}`)
    } else if (current.type === "array") {
      write(`${padding}${el} = [{`)
      generate(current.items, depth + 1, true);
      write(`${padding}}]`)
    } else {
      write(`${padding}${format(el, current, isPermissions)}`);
    }
  })
}

generate(conf);
