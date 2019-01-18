import {
  setModalError,
  dismissModalError,
} from "../../../common/redux/core/actions";

export default class ModalDetails extends Error {
  static types = {
    WARNING: 0,
    ERROR: 1,
  };

  static actions = {
    setModalError,
    dismissModalError,
  };

  constructor(type, buttons, title, ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ModalDetails);
    }

    this.data = {
      type,
      buttons,
      title,
      message: params[0],
    };
  }
}
