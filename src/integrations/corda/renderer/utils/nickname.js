import { parse } from "path";

// this is taken from braid
const VERSION_REGEX = /^(.*?)(?:-(?:(?:\d|\.)+))\.jar?$/;

export function cordaNickname(cordapp){
  const parsedCordapp = parse(cordapp);
  const filenameWithoutVersion = VERSION_REGEX.exec(parsedCordapp.base);
  return filenameWithoutVersion ?  filenameWithoutVersion[1].toLowerCase() : parsedCordapp.name;
}
