import connect from "../../../../renderer/screens/helpers/connect";
import React, { Component } from "react";
import TransactionData from "../transaction-data";
import { setToast } from "../../../../common/redux/network/actions";

class TransactionAttachments extends Component {
  async downloadAttachment(attachment) {
    const result = await TransactionData.downloadAttachment(attachment.filename, attachment.attachment_id, attachment.database);
    if (result) {
      this.props.dispatch(setToast(result));
    }
  }
  
  render() {
    const attachments = this.props.attachments;
    let elements;
    if (attachments === null){
      elements = (<div>Loading...</div>);
    } else if (attachments.length === 0) {
      elements = (<div>No attachments</div>);
    } else {
      elements = attachments.map(attachment => {
        return (<div style={{marginBottom:".5em", cursor:"pointer"}} onClick={()=>{this.downloadAttachment(attachment)}} key={attachment.attachment_id}>{attachment.filename}</div>);
      });
    }

    return (
      <div>
        <h3 className="Label">Attachments</h3>
        <div>{elements}</div>
      </div>
    );
  }
}

export default connect(TransactionAttachments);
