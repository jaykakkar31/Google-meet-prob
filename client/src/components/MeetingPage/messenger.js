import react, { useState } from "react";
import CloseIcon from "@material-ui/icons/Close";
import PeopleIcon from "@material-ui/icons/People";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import TelegramIcon from "@material-ui/icons/Telegram";
import { handleRateChange } from "video-react/lib/actions/video";

function Messenger({ setMessenger, sendMsg, messageListState }) {
	const [msg, setMsg] = useState("");

	const handleChange = (event) => {
		console.log(event.target.value);
		setMsg(event.target.value);
	};
	const handleClick = () => {
		sendMsg(msg);
	};
	return (
		<div className="messenger-container">
			<div className="messenger-header">
				<h3>Meeting details</h3>
				<CloseIcon
					onClick={() => {
						setMessenger(false);
					}}
				/>
			</div>
			<div className="messenger-header-tab">
				<div className="people">
					<PeopleIcon /> People
				</div>
				<div className="chat">
					<ChatBubbleIcon />
					Chat
				</div>
			</div>
			<div className="messenger-chat-area">
				{/* {messageListState.map((messg)=>{
    return 
})} */}
				<div>
					<span>Name</span>
				</div>
			</div>
			<div className="messenger-input">
				<input
					placeholder="Send a message to everyone"
					value={msg}
					onChange={handleChange}
				/>
				<TelegramIcon onClick={handleClick} />
			</div>
		</div>
	);
}

export default Messenger;
