import React from "react";
import Header from "./header";
import {Link} from "react-router-dom"
function Nomatch() {
  return (
    <div>
      <Header />
      <div className="no-match-content">
        <h2>Invalid video call name.</h2>
        <div className="action-btn">
          <button classname="green">
            <Link className="return-text" to="/">Return to home screen</Link>
          </button>
        </div>
      </div>
    </div>
  );
}
export default Nomatch;
