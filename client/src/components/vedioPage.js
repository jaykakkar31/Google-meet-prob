import react, { useState, useEffect, useReducer, useRef } from "react";

import { useParams, useHistory } from "react-router-dom";
import MeetingHeader from "./meetingHeader";
import MeetingFooter from "./meetingFooter";
import MeetingInfo from "./meetingInfo";
import styled from "styled-components";

import Messenger from "./messenger";
import Alert from "./alert";
import Peer from "simple-peer";
import io from "socket.io-client";
function VideoPage() {
	const isAdmin = window.location.hash === "#init" ? true : false;

	//#init
	// console.log(window.location.hash);

	const { id } = useParams();

	// let peer = null;
	const url = `${window.location.origin}${window.location.pathname}`;

	const [meetingInfoPopUp, setMeetingInfoPopUp] = useState(false);
	const [isMessenger, setMessenger] = useState(false);

	useEffect(() => {
		if (isAdmin) {
			setMeetingInfoPopUp(true);
		}
	},[]);

	// NEW START

	// const [peers, setPeers] = useState([]);
	// const socketRef = useRef();
	// const userVideo = useRef();
	// const peersRef = useRef([]);

	// const videoConstraints = {
	// 	height: window.innerHeight / 2,
	// 	width: window.innerWidth / 2,
	// };

	// const ref = useRef();

	// 	const Video = (props) => {
	// 		useEffect(() => {
	// 			console.log(props.peer);
	// 			props.peer.on("stream", (stream) => {
	// 				console.log(stream);
	// 				ref.current.srcObject = stream;
	// 			});
	// 		}, []);

	// 		return <StyledVideo playsInline autoPlay ref={ref} />;
	// 	};

	// useEffect(() => {
	// 	//Call every time when page renders
	// 	if (isAdmin) {
	// 		setMeetingInfoPopUp(true);
	// 	}
	// 	// initWebRTC();
	// 	// ESTABLISHING CONNECT WITH BACKEND
	// 	socketRef.current = io.connect("http://localhost:9000");
	// 	// LOGIC FOR SOMEBODY JOINING THE ROOM
	// 	navigator.mediaDevices
	// 		.getUserMedia({ video: true, audio: true })
	// 		.then((stream) => {
	// 			userVideo.current.srcObject = stream;
	// 			console.log("USERVIDEO" + stream);

	// 			// var video = document.querySelector("video");
	// 			// if ("srcObject" in video) {
	// 			//   video.srcObject = stream;
	// 			// } else {
	// 			//   video.src = window.URL.createObjectURL(stream); // for older browsers
	// 			// }
	// 			// video.play();

	// 			// LOGIC THAT USER HAS JOINED THE ROOM

	// 			//THIS EVENT Is NOT CACHED AT BACKEND
	// 			//.emit means sending  to backend
	// 			socketRef.current.emit("JOINED ROOM");
	// 			socketRef.current.emit("join room", id);
	// 			// Recieve users from backened
	// 			// if (!isAdmin) {
	// 			socketRef.current.on("all users", (users) => {
	// 				//peers is for how many videos are rendering
	// 				console.log(users.length);
	// 				const peersForVideo = [];
	// 				users.forEach((userID) => {
	// 					console.log(userID + " USER ID OF USER IN THE ROOM ");
	// 					console.log(socketRef.current);
	// 					//socketRef.current.id is the of user currently joined
	// 					//UserID  id's of all those inside the meeting

	// 					const peer = createPeer(userID, socketRef.current.id, stream);
	// 					//peersRef is for which is having connection with which
	// 					peersRef.current.push({
	// 						peerID: userID,
	// 						peer,
	// 					});

	// 					peersForVideo.push(peer);
	// 				});
	// 				setPeers(peersForVideo);
	// 				console.log(peers);
	// 			});
	// 			//PERSON IN THE ROOM GETS NOTIFIED THAT SOMEBODY HAS JOINED
	// 			//.on means recieving from backend
	// 			socketRef.current.on("user joined", (payload) => {
	// 				const peer = addPeer(payload.signal, payload.callerID, stream);

	// 				peersRef.current.push({
	// 					peerID: payload.callerID,
	// 					peer,
	// 				});
	// 				setPeers((users) => [...users, peer]);
	// 			});
	// 			socketRef.current.on("receiving returned signal", (payload) => {
	// 				// signal has been send to multiple now multiple users are sending back the signal to caller
	// 				const item = peersRef.current.find((p) => p.peerID === payload.id);
	// 				console.log(item);
	// 				item.peer.signal(payload.signal);
	// 			});
	// 			// }
	// 		});
	// }, []);

	// function createPeer(userToSignal, callerID, stream) {
	// 	console.log("CREATE PEER");
	// 	const peer = new Peer({
	// 		initiator: true,
	// 		//trickle wait for all the data to send makes it slow
	// 		trickle: false,
	// 		stream,
	// 	});
	// 	//generates signal
	// 	//sending to backend
	// 	peer.on("signal", (signal) => {
	// 		socketRef.current.emit("sending signal", {
	// 			userToSignal,
	// 			callerID,
	// 			signal,
	// 		});
	// 	});
	// 	return peer;
	// }


	return (
		<div class="videoScreen">
			<MeetingHeader
				setMessenger={setMessenger}
				// peers={peers}
				// userVideo={userVideo}
				// Video={Video}
                isAdmin={isAdmin}
				id={id}
			/>
			<MeetingFooter />
			{isAdmin && meetingInfoPopUp && (
				<MeetingInfo url={url} setMeetingInfoPopUp={setMeetingInfoPopUp} />
			)}
			{isMessenger ? (
				<Messenger
					setMessenger={setMessenger}
					// messageList={messageList}
				/>
			) : (
				<Alert />
			)}
		</div>
	);
}

export default VideoPage;
