import { web3Request } from "../../../integrations/ethereum/common/redux/web3/helpers/Web3ActionCreator";
import { lotusRequest } from "../../../integrations/filecoin/common/redux/lotus/helpers/LotusActionCreator";
import { push } from "connected-react-router";
import { addTipsetsToView } from "../../../integrations/filecoin/common/redux/tipsets/actions";

export const query = function(message, flavor) {
  return async function(dispatch, getState) {
    // do nothing if user submits empty search string
    if (message === "") return;

    if (flavor === "ethereum") {
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
    } else if (flavor === "filecoin") {
      const state = getState();
      const lotusInstance = state.filecoin.lotus.lotusInstance;

      if (/^[0-9]+$/.exec(message)) {
        // this is a number, not a hash/cid, we must be looking for tipsets by height
        const height = parseInt(message, 10);
        if (height <= state.filecoin.core.latestTipset) {
          try {
            dispatch(addTipsetsToView(height, height));
            dispatch(push(`/filecoin/tipsets/${height}`));
            return;
          } catch (err) {
            console.log("Tipset search error: ", err);
          }
        }

        dispatch(push("/notfound"));
        return;
      }

      // is it a block?
      try {
        const block = await lotusRequest("ChainGetBlock", [{ "/": message }], lotusInstance);

        if (block) {
          // if we succeeded, blocks are filled in via the tipset
          dispatch(addTipsetsToView(block.Height, block.Height));
          dispatch(push(`/filecoin/tipsets/blocks/${message}`));
          return;
        }
      } catch (err) {
        console.log("Block search error: ", err);
      }

      // is it a message?
      try {
        const blockMessage = await lotusRequest("ChainGetMessage", [{ "/": message }], lotusInstance);

        if (blockMessage) {
          // if we succeeded, just navigate to the page
          dispatch(push(`/filecoin/messages/${message}`));
          return;
        }
      } catch (err) {
        console.log("Message search error: ", err);
      }

      // couldn't find anything
      dispatch(push("/notfound"));
    }
  };
};
