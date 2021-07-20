import  { useState, useEffect } from "react";

import Room from "./MeetingPage/Room";
import { useParams } from "react-router-dom";

function VideoPage() {
	const isAdmin = window.location.hash === "#init" ? true : false;
	const { id } = useParams();
	const url = `${window.location.origin}${window.location.pathname}`;

	const [meetingInfoPopUp, setMeetingInfoPopUp] = useState(false);


	

	// window.onpopstate = (event, ev) => {
	// console.log("CALED OnPOP");
	// console.log(history.action);
	// };
	// }, []);

	// console.log(window.location);

	useEffect(() => {
		if (isAdmin) {
			setMeetingInfoPopUp(true);
		}
	}, []);

	return (
		<Room
			id={id}
			isAdmin={isAdmin}
			setMeetingInfoPopUp={setMeetingInfoPopUp}
			meetingInfoPopUp={meetingInfoPopUp}
			url={url}
		/>
	);
}

export default VideoPage;
