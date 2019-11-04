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
        result = `${el} = "${element.default}"`;
        break;
      default:
        result = `${el} = ${element.default}`;
        break;
    }
  }
  return result;
}

const writeArray = ctx => {
  const {padding, el, current, depth} = ctx;
  write(`${padding}${el} = [{`);
  generate(current.items, depth + 1, true);
  write(`${padding}}]`);
}

const writeObject = ctx => {
  const {padding, el, current, depth} = ctx;
  write(`${padding}${el} {`);
  generate(current, depth + 1);
  write(`${padding}}`);
}

const writePermissionsArray = ctx => {
  const {padding, el, current, depth} = ctx;
  if (current.type === "permissionsArray") {
    // SPECIAL CASE
    write(`${padding}${el} = [`)
    generate(current.items, depth + 1, false, true);
    write(`${padding}]`)
  } else {
    write(`${padding}${el}=${current.default}`);
  }
}

const writeDefault = ctx => {
  write(`${ctx.padding}${format(ctx.el, ctx.current, ctx.isPermissions)}`);
}

const generate = (root, depth = 0, isArray = false, isPermissions = false) => {
  const padding = " ".repeat(depth * SPACES);
  const globalContext = { padding, depth, isPermissions };
  root.required.forEach((el) => {
    const context = Object.assign({}, globalContext, {el, current: root.properties[el]});
    if (isArray) {
      writePermissionsArray(context);
    } else if (context.current.type === "object"){
      writeObject(context);
    } else if (context.current.type === "array") {
      writeArray(context);
    } else {
      writeDefault(context);
    }
  })
}

module.exports = generate;
