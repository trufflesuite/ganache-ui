const conf = require("./templates/node.json");

const write = console.log;

const format = (el, element) => {
  let result;
  switch (element.type) {
    case "string":
      result = `${el} = "${element.examples[0]}"`;
      break;
    default:
      result = `${el} = ${element.examples[0]}`;
      break;
  }
  return result;
}

const generate = (root, depth = 0, inline = false) => {
  const inlineArr = [];
  const padding = " ".repeat(depth * 2);
  root.required.map((el) => {
    const current = root.properties[el];
    if (inline) {
      if (current.type === "array") {
        // SPECIAL CASE
      } else {
        inlineArr.push(`${el}=${current.examples[0]}`);
      }
    } else if (current.type === "object"){
      write(`${padding}${el} {`)
      generate(current, depth + 1);
      write(`${padding}}`)
    } else if (current.type === "array") {
      write(`${padding}${el} = [`)
      generate(current.items, depth + 1, true);
      write(`${padding}]`)
    } else {
      write(padding + format(el, current));
    }
  })
  if (inline) {
    write(`${padding}{ ${inlineArr.join(", ")} }`)    
  }
}

generate(conf);
