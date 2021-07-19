import react, { useEffect, useState } from "react";
import CloseIcon from "@material-ui/icons/Close";
import PeopleIcon from "@material-ui/icons/People";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import TelegramIcon from "@material-ui/icons/Telegram";
import { handleRateChange } from "video-react/lib/actions/video";

function Messenger({ setMessenger, sendMsg, messageListState, messageList ,userMessage}) {
	const [msg, setMsg] = useState("");
		console.log(messageList);
	

	const handleChange = (event) => {
		console.log(event.target.value);
		setMsg(event.target.value);
	};
	const handleClick = () => {
		sendMsg(msg);
		setMsg("");
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
				<div>
					<div className="details">
						<span>{userMessage.user}</span>
						<small>{userMessage.time}</small>
					</div>
					<p>{userMessage.msg}</p>
				</div>

				{messageList.map((msg) => {
					console.log(msg);
					return (
						<div>
							<div className="details">
								<span>{msg.user}</span>
								<small>{msg.time}</small>
							</div>
							<p>{msg.msg}</p>
						</div>
					);
				})}
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
