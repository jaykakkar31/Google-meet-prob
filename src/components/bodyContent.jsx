import React from "react";
import { useHistory } from "react-router-dom";
import KeyboardIcon from "@material-ui/icons/Keyboard";
import VideocamIcon from "@material-ui/icons/Videocam";
const shortid = require("shortid");
function BodyContent() {

  const history=useHistory()

  const startMeeting=()=>{
    const meetingId=shortid.generate()
    history.push(`${meetingId}#init`)
  }

  return (
    <div className="body-content">
      <div className="left-side">
        <div className="content">
          <h2>Premium video meetings. Now free for everyone.</h2>
          <p>
            We re-engineered the service we built for secure business meetings,
            Google Meet, to make it free and available for all.
          </p>
        </div>
        <div className="action-btn">
          <button className="btn" onClick={startMeeting}>
            <VideocamIcon />
            New Meeting
          </button>

          <div className="input-block">
            <div className="input-section">
              <KeyboardIcon />
              <input placeholder="Enter a code or link" />
            </div>
            <button className="join-btn">Join</button>
          </div>
        </div>
        <div className="footer">
          <a className="green" href="/">
            Learn more
          </a>{" "}
          about Google Meet
        </div>
      </div>
      <div className="right-side">
        <div className="content">
          <img
            src="https://www.gstatic.com/meet/google_meet_marketing_ongoing_meeting_grid_427cbb32d746b1d0133b898b50115e96.jpg"
            alt="meet-img"
          ></img>
        </div>
      </div>
    </div>
  );
}

export default BodyContent;
