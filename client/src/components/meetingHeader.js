import react, { useEffect, useState, useRef } from "react";
import PeopleIcon from "@material-ui/icons/People";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import Room from "./Room";
//use for time
import moment from "moment";

function MeetingHeader({ setMessenger,id }) {


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

	return (
		<div>
			<Room id={id} />
	

			<div class="frame-header">
				<div class="header-items icon-block">
					<PeopleIcon />
				</div>
				<div
					class="header-items icon-block"
					onClick={() => {
						setMessenger(true);
					}}
				>
					<ChatBubbleIcon />
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