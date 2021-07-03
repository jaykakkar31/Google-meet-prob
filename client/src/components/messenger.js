import react from "react";
import CloseIcon from "@material-ui/icons/Close";
import PeopleIcon from "@material-ui/icons/People";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import TelegramIcon from "@material-ui/icons/Telegram";

function Messenger({setMessenger}) {
  return (
    <div className="messenger-container">
      <div className="messenger-header">
        <h3>Meeting details</h3>
        <CloseIcon onClick={()=>{setMessenger(false)}}/>
      </div>
      <div className="messenger-header-tab">
        <div className="people">
          <PeopleIcon /> People
        </div>
        <div className="chat" >
          <ChatBubbleIcon />
           Chat
        </div>
      </div>
      <div className="messenger-chat-area"></div>
      <div className="messenger-input">
        <input placeholder="Send a message to everyone" />
        <TelegramIcon />
      </div>
    </div>
  );
}

export default Messenger;
