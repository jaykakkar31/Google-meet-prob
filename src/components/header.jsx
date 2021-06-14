import React from "react";
import HelpIcon from "@material-ui/icons/Help";
import ErrorIcon from "@material-ui/icons/Error";
import SettingsIcon from "@material-ui/icons/Settings";
function Header() {
  return (
    <div className="header">
      <div className="logo">
        <img
          alt="google meet img"
          src="https://www.gstatic.com/meet/google_meet_horizontal_wordmark_2020q4_2x_icon_124_40_292e71bcb52a56e2a9005164118f183b.png"
        ></img>
        <span>Meet</span>
      </div>
      <div className="action-icons">
        <div className="icon-block">
          <HelpIcon />
          <ErrorIcon />
          <SettingsIcon/>
        </div>
      </div>
    </div>
  );
}
export default Header;
