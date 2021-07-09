import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import MeetingHeader from "./meetingHeader";
import MeetingFooter from "./meetingFooter";
import MeetingInfo from "./meetingInfo";
import Alert from "./alert";
import Messenger from "./messenger";

const vidStyle = {
	height: `264.15px`,
	width: "639.9px",
	padding: "10px",
	paddingBottom: "5px",
	objectFit: "fill",
};

const Video = (props) => {
	const ref = useRef();
	console.log("VIDEO CALLED");
	useEffect(() => {
		props.peer.on("stream", (stream) => {
			console.log("ENTE0RD" + stream);
			ref.current.srcObject = stream;
		})
	}, []);


	return <video style={vidStyle} muted ref={ref} autoPlay controls />;
};

let peer = null;

const videoConstraints = {
	height: window.innerHeight / 2,
	width: window.innerWidth / 2,
};

const Room = ({ id, isAdmin, setMeetingInfoPopUp, url, meetingInfoPopUp }) => {
	const [isMessenger, setMessenger] = useState(false);

	const numUsers = useRef();
	const [peers, setPeers] = useState([]);
	const socketRef = useRef();
	const userVideo = useRef();
	const peersRef = useRef([]);
	const screenStream = useRef();
	const roomID = id;
	const [streamObj, setStreamObj] = useState();
	const [screenCastStream, setScreenCastStream] = useState();
	const [isPresenting, setIsPresenting] = useState();

	useEffect(() => {
		socketRef.current = io.connect("/");
		navigator.mediaDevices
			.getUserMedia({ video: videoConstraints, audio: true })
			.then((stream) => {
				setStreamObj(stream);
				userVideo.current.srcObject = stream;
				console.log("USERVIDEO" + stream);
				// LOGIC THAT USER HAS JOINED THE ROOM

				//THIS EVENT Is NOT CACHED AT BACKEND
				//.emit means sending  to backend
				socketRef.current.emit("JOINED ROOM");
				socketRef.current.emit("join room", roomID);
				// Recieve users from backened
				// if (!props.isAdmin) {

				socketRef.current.on("all users", (users) => {
					//peers is for how many videos are rendering

					const peersForVideo = [];
					users.forEach((userID) => {
						console.log(userID + " USER ID OF USER IN THE ROOM ");
						console.log(socketRef.current);
						//socketRef.current.id is the of user currently joined
						// UserID  id's of all those inside the meeting

						const peer = createPeer(userID, socketRef.current.id, stream);
						//peersRef is for which is having connection with which
						peersRef.current.push({
							peerID: userID,
							peer,
						});

						peersForVideo.push(peer);
					});
					setPeers(peersForVideo);
					console.log(peers);
				});
				//PERSON IN THE ROOM GETS NOTIFIED THAT SOMEBODY HAS JOINED
				//.on means recieving from backend
				socketRef.current.on("user joined", (payload) => {
					const peer = addPeer(payload.signal, payload.callerID, stream);

					peersRef.current.push({
						peerID: payload.callerID,
						peer,
					});

					setPeers((users) => [...users, peer]);
				});
				socketRef.current.on("receiving returned signal", (payload) => {
					// signal has been send to multiple now multiple users are sending back the signal to caller
					const item = peersRef.current.find((p) => p.peerID === payload.id);
					console.log(item);

					item.peer.signal(payload.signal);
				});
				// }
			});
	}, []);

	function createPeer(userToSignal, callerID, stream) {
		console.log("CREATE PEER");
		const peer = new Peer({
			initiator: true,
			//trickle wait for all the data to send makes it slow
			trickle: false,
			stream,
		});
		//generates signal
		//sending to backend
		peer.on("signal", (signal) => {
			socketRef.current.emit("sending signal", {
				userToSignal,
				callerID,
				signal,
			});
		});
		return peer;
	}

	function addPeer(incomingSignal, callerID, stream) {
		console.log("Add Peer");
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream,
		});
		// 1 accepting the incoming signal that this will return the signal
		peer.signal(incomingSignal);

		peer.on("signal", (signal) => {
			socketRef.current.emit("returning signal", { signal, callerID });
		});
		return peer;
	}

	const screenShare = () => {
		console.log(peer);
		navigator.mediaDevices
			.getDisplayMedia({cursor:true})
			.then((screenStream) => {
				console.log("SCREEN STREAM", screenStream);
				peers.map((peer, index) => {
					peer.replaceTrack(
						streamObj.getVideoTracks()[0],
						screenStream.getVideoTracks()[0],
						streamObj
					);

					//WHEN SHARING STOPS RETURN TO NORMAl STATE
                    //RESPONSIBLE FOR WORKING OF STOP BUTTON
					setScreenCastStream(screenStream);
					// screenStream.getTracks()[0].onended = () => {
					// 	peer.replaceTrack(
					// 		screenStream.getVideoTracks()[0],
					// 		streamObj.getVideoTracks()[0],
					// 		streamObj
					// 	);
					// };
					setIsPresenting(true);
				});
			});
	};
	const stopScreenShare = () => {
		// screenCastStream.getVideoTracks().forEach(function (track) {
		// 	track.stop();
		// });
        // Replace with video tracks
		peers.map((peer, index) => {
			peer.replaceTrack(
				screenCastStream.getVideoTracks()[0],
				streamObj.getVideoTracks()[0],
				streamObj
			);
			setIsPresenting(false);
		});
	};

	console.log(peers.callerID);
	return (
		<div class="videoScreen">
			{/* {isPresenting ? (
				<video
					// style={{ height: "calc(100vh -90px)", width: "100%" }}
				/>
			) : ( */}
			<div className="container">
				<video style={vidStyle} muted ref={userVideo} autoPlay controls />
				{peers.map((peer, index) => {
					return <Video key={index} peer={peer} numUsers={numUsers.current} />;
				})}
			</div>
			{/* )} */}
			<MeetingHeader setMessenger={setMessenger} id={id} />
			<MeetingFooter
				isPresenting={isPresenting}
				screenShare={screenShare}
				stopScreenShare={stopScreenShare}
			/>
			{isAdmin && meetingInfoPopUp && (
				<MeetingInfo url={url} setMeetingInfoPopUp={setMeetingInfoPopUp} />
			)}
			{isMessenger ? <Messenger setMessenger={setMessenger} /> : <Alert />}
		</div>
	);
};

export default Room;
