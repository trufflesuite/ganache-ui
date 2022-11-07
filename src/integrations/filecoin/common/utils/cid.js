export function abbreviateCid(cid, numChars) {
  return `${cid.slice(0, numChars)}…${cid.slice(cid.length - numChars)}`;
}
