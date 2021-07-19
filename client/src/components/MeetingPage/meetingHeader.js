import react, { useEffect, useState, useRef } from "react";
import PeopleIcon from "@material-ui/icons/People";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import Room from "./Room";
//use for time
import moment from "moment";
import io from "socket.io-client";
import Peer from "simple-peer";

function MeetingHeader({ setMessenger, setMessageAlert,messageAlert }) {
	const formatDate = () => {
		return moment().format("LT");
	};

	const [currentTime, setCurrentTime] = useState(() => {
		formatDate();
	});
	useEffect(() => {
		setInterval(() => setCurrentTime(formatDate()), 1000);
		console.log(currentTime);
	}, []);

	const vidStyle = {
		// height: "calc(50vh -90px)",
		// borderRadius:"10px"
		height: "45%",
		width: "45%",

		padding: "10px",
		paddingBottom: "5px",
	};

	return (
		<div>
			<div class="frame-header">
				<div class="header-items icon-block">
					<PeopleIcon />
				</div>
				<div
					class="header-items "
					onClick={() => {
						setMessenger(true);
						setMessageAlert({
							alert: false,
							isPopup: false,
							payload: {},
						});
					}}
				>
					<ChatBubbleIcon />

				{messageAlert.alert &&	<span className="alert-icon"></span>}
				</div>
				<div class="header-items date-block">{currentTime}</div>
				<div class="header-items icon-block">
					<AccountCircleIcon />
				</div>
			</div>
		</div>
	);
}

export default MeetingHeader;
