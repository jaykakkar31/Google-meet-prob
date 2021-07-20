import React, { useEffect, useRef, useState, useReducer } from "react";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";
import MeetingHeader from "./meetingHeader";
import MeetingFooter from "./meetingFooter";
import MeetingInfo from "./meetingInfo";
import Alert from "./alert";
import Messenger from "./messenger";

import moment from "moment";

const vidStyle = {
	height: `264.15px`,
	width: "639.9px",
	padding: "10px",
	paddingBottom: "5px",
	objectFit: "fill",
};

const Video = (props) => {
	const ref = useRef();
	// console.log("VIDEO CALLED" + JSON.stringify(props.peer));
	useEffect(() => {
		props.peer.on("stream", (stream) => {
			console.log("ENTE0RD" + stream);
			ref.current.srcObject = stream;
		});
	}, []);

	return (
		<video
			style={vidStyle}
			muted={!props.isAudio}
			ref={ref}
			autoPlay
			controls
		/>
	);
};



const Room = ({ id, isAdmin, setMeetingInfoPopUp, url, meetingInfoPopUp }) => {
	const [isMessenger, setMessenger] = useState(false);

	const numUsers = useRef();
	let history = useHistory();
	const [peers, setPeers] = useState([]);
	const socketRef = useRef();
	const userVideo = useRef();
	const peersRef = useRef([]);
	const currentPeer = useRef();
	const adminPeer = useRef();
	const screenStream = useRef();
	const roomID = id;
	const [isAudio, setIsAudio] = useState(false);
	const [streamObj, setStreamObj] = useState();
	const [screenCastStream, setScreenCastStream] = useState();
	const [isPresenting, setIsPresenting] = useState();
	const [isVideo, setIsVideo] = useState(true);
	
	// const messageList=useRef()
	const [messageList, setMessageList] = useState([]);
	const [messageAlert, setMessageAlert] = useState({});
	const [prevMessage, setPrevMessage] = useState();
	let alertTimeout = null;

	const formatDate = () => {
		return moment().format("LT");
	};

	useEffect(() => {
		socketRef.current = io.connect("/");
		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				setStreamObj(stream);
				userVideo.current.srcObject = stream;

				console.log(userVideo.current);

				// LOGIC THAT USER HAS JOINED THE ROOM

				//THIS EVENT Is NOT CACHED AT BACKEND
				//.emit means sending  to backend
				socketRef.current.emit("JOINED ROOM");
				socketRef.current.emit("join room", roomID);
				// Recieve users from backened
				// if (!props.isAdmin) {

				socketRef.current.on("all users", (users) => {
					//peers is for how many videos are rendering
					console.log(users);
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
					if (peers.length <= 4) {
						setPeers(peersForVideo);
					}
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
					// currentPeer.current = item.peer;
					// returningSignal()
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
		currentPeer.current = peer;

		//generates signal
		//sending to backend
		console.log(userToSignal + "  " + callerID);
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
		adminPeer.current = peer;
		// 1 accepting the incoming signal that this will return the signal
		peer.signal(incomingSignal);

		peer.on("signal", (signal) => {
			socketRef.current.emit("returning signal", { signal, callerID });
		});

		
		return peer;
	}

	const screenShare = () => {
		navigator.mediaDevices
			//Cursor True is means sending cursor also of the person sharing screen to the person recieving the screen
			.getDisplayMedia({ cursor: true })
			.then((screenStream) => {
				console.log("SCREEN STREAM", screenStream);
				console.log(userVideo.current);

				peers.map((peer, index) => {
					console.log(peer);
					peer.replaceTrack(
						//0th track is the screen track
						streamObj.getVideoTracks()[0],
						screenStream.getVideoTracks()[0],
						streamObj
					);
				});
				setIsPresenting(true);

				//WHEN SHARING STOPS RETURN TO NORMAl STATE
				//RESPONSIBLE FOR WORKING OF STOP BUTTON
				setScreenCastStream(screenStream);

				screenStream.getTracks()[0].onended = () => {
					peers.map((peer, index) => {
						console.log("CALLED");
						peer.replaceTrack(
							screenStream.getVideoTracks()[0],
							streamObj.getVideoTracks()[0],
							streamObj
						);
					});
					setIsPresenting(false);
				};
			});
	};
	const stopScreenShare = () => {
		screenCastStream.getVideoTracks().forEach(function (track) {
			track.stop();
		});
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

	const toggleVideo = (value) => {
		if (value) {
			userVideo.current.play();
			navigator.mediaDevices
				.getUserMedia({ video: true, audio: true })
				.then((stream) => {
					userVideo.current.srcObject = stream;
				});
		} else {
			navigator.mediaDevices
				.getUserMedia({ video: true, audio: true })
				.then((stream) => {
					userVideo.current.srcObject = stream.stop;
				});
		}

		setIsVideo(value);
	};

	const disconnect = () => {
		console.log("Clicked");
		socketRef.current.disconnect();
		history.push("/");
	};


	const sendMsg = (msg) => {
		//Send From one peer to another

		if (currentPeer.current) {
			currentPeer.current.send(msg);
		}
		if (adminPeer.current) {
			adminPeer.current.send(msg);
		}
        socketRef.current.emit("prevMessage",prevMessage)

		socketRef.current.emit("chatMessages", {
			
			msg: msg,
			user: socketRef.current.id,
			time: formatDate(),
			
		});

		
		
	};
	useEffect(() => {
		socketRef.current.on("allMessages", (payload) => {
			console.log(payload.chatMessages);
			setPrevMessage(payload.chatMessages);
			setMessageList(payload.chatMessages);

			setMessageAlert({
				alert: true,
				isPopup: true,
				payload: {
					user: payload.payload.user,
					msg: payload.payload.msg,
				},
			});

			// eslint-disable-next-line react-hooks/exhaustive-deps
			alertTimeout = setTimeout(() => {
				setMessageAlert({
					...messageAlert,
					isPopup: false,
					payload: {},
				});
			}, 100000);
		});

		socketRef.current.on("currentUserMessages", (payload) => {
			setMessageList(payload.chatMessages);
			setPrevMessage(payload.chatMessages);
		});
	}, []);
	return (
		<div class="videoScreen">
			<div className="container">
				<video
					style={vidStyle}
					muted={!isAudio}
					ref={userVideo}
					autoPlay
					controls={isPresenting}
				/>
				{peers.map((peer, index) => {
					return (
						<Video
							key={index}
							peer={peer}
							numUsers={numUsers.current}
							isAudio={isAudio}
						/>
					);
				})}
			</div>
			<MeetingHeader
				setMessenger={setMessenger}
				id={id}
				setMessageAlert={setMessageAlert}
				messageAlert={messageAlert}
			/>

			<MeetingFooter
				isPresenting={isPresenting}
				screenShare={screenShare}
				stopScreenShare={stopScreenShare}
				disconnect={disconnect}
				setIsAudio={setIsAudio}
				isVideo={isVideo}
				isAudio={isAudio}
				toggleVideo={toggleVideo}
			/>
			{isAdmin && meetingInfoPopUp && (
				<MeetingInfo url={url} setMeetingInfoPopUp={setMeetingInfoPopUp} />
			)}
			{isMessenger ? (
				<Messenger
					setMessenger={setMessenger}
					sendMsg={sendMsg}
					// messageListState={messageListState}
					messageList={messageList}
					// userMessage={userMessage}
				/>
			) : (
				messageAlert.isPopup && <Alert messageAlert={messageAlert} />
			)}
		</div>
	);
};

export default Room;
