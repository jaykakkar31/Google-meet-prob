import react from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentAlt } from "@fortawesome/free-solid-svg-icons";

function Alert() {
  return (
    <div className="message-alert-popup">
      <div className="alert-header">
        <FontAwesomeIcon className="icon" icon={faCommentAlt} />
        <h3>user</h3>
      </div>
      <p className="alert-msg">Hello</p>
    </div>
  );
}

export default Alert;
