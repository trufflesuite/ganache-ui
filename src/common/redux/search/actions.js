import { web3Request } from "../web3/helpers/Web3ActionCreator";
import { push } from "react-router-redux";

export const query = function(message) {
  return async function(dispatch, getState) {
    // do nothing if user submits empty search string
    if (message === "") return;

    let web3Instance = getState().web3.web3Instance;
    // This will request the block by either its has or number
    try {
      let block = await web3Request("getBlock", [message, true], web3Instance);
      dispatch(push(`/blocks/${block.number}`));
      return;
    } catch (err) {
      console.log("Block search error: ", err);
    }

    try {
      let transaction = await web3Request(
        "getTransaction",
        [message],
        web3Instance,
      );
      dispatch(push(`/transactions/${transaction.hash}`));
    } catch (err) {
      console.log("Transaction search error: ", err);
      dispatch(push("/notfound"));
    }
  };
};
