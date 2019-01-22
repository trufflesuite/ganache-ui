import { hashHistory } from "react-router";

export default async function() {
  return new Promise(resolve => {
    resolve(hashHistory);
  });
}
