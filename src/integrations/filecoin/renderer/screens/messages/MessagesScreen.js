import React, { Component } from "react";
import connect from "../../../../../renderer/screens/helpers/connect";
import * as Messages from "../../../common/redux/messages/actions";
import RecentMessages from "./RecentMessages";
import MessageCard from "./MessageCard";

class MessagesScreen extends Component {
  componentDidMount() {
    this.props.dispatch(Messages.requestPage());
  }

  componentWillUnmount() {
    this.props.dispatch(Messages.clearMessagesInView());
  }

  render() {
    var content;
    if (this.props.match.params.messageCid != null) {
      content = <MessageCard cid={this.props.match.params.messageCid} />;
    } else {
      content = (
        <RecentMessages scrollPosition={this.props.scrollPosition} />
      );
    }
    return <div className="MessagesScreen">{content}</div>;
  }
}

export default connect(MessagesScreen);
