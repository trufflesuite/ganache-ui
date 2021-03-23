import React, { Component } from "react";
import MDSpinner from "react-md-spinner";

import MiniMessageCard from "./MiniMessageCard";

class MessageList extends Component {
  render() {
    var content;
    if (this.props.messages.length > 0) {
      content = this.props.messages.map(message => {
        return (
          <MiniMessageCard
            message={message}
            key={`message-${message.cid["/"]}`}
          />
        );
      });
    } else {
      if (this.props.loading) {
        content = (
          <div className="Waiting">
            <MDSpinner
              singleColor="var(--primary-color)"
              size={30}
              borderSize={3}
              className="spinner"
              duration={2666}
            />
          </div>
        );
      } else {
        content = <div className="Waiting">No messages</div>;
      }
    }

    return <div className="MessageList">{content}</div>;
  }
}

export default MessageList;
