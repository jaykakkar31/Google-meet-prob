import React, { useEffect, useRef, useState, useReducer } from "react";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";
import MeetingHeader from "./meetingHeader";
import MeetingFooter from "./meetingFooter";
import MeetingInfo from "./meetingInfo";
import Alert from "../alert";
import Messenger from "./messenger";
import { Player, ControlBar, PlayToggle } from "video-react";
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
	console.log("VIDEO CALLED" + JSON.stringify(props.peer));
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


const MessageListReducer = (state, action) => {
	let draftState = [...state];
    console.log(state);
	switch (action.type) {
		case "addMessage":
			console.log(action);
			return [...draftState, action.payload];
		default:
			return state;
	}
};

const Room = ({ id, isAdmin, setMeetingInfoPopUp, url, meetingInfoPopUp }) => {
	const [isMessenger, setMessenger] = useState(false);

	const numUsers = useRef();
	let history = useHistory();
	const [peers, setPeers] = useState([]);
	const socketRef = useRef();
	const userVideo = useRef();
	const peersRef = useRef([]);
	const screenStream = useRef();
	const roomID = id;
	const [isAudio, setIsAudio] = useState(false);
	const [streamObj, setStreamObj] = useState();
	const [screenCastStream, setScreenCastStream] = useState();
	const [isPresenting, setIsPresenting] = useState();
	const [isVideo, setIsVideo] = useState(true);
	const initialState = [];
	const [messageListState, messgListReducer] = useReducer(
		MessageListReducer,
		initialState
	);

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
					// console.log(item);

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
			userVideo.current.pause();
		}

		setIsVideo(value);
	};

	const disconnect = () => {
		console.log("Clicked");
		socketRef.current.disconnect();
		history.push("/");
	};

	// console.log(messgListReducer);

	const sendMsg = (msg) => {
		//Send From one peer to another

		const formatDate = () => {
			return moment().format("LT");
		};
		console.log(formatDate());
		peers.map((peer) => {
			peer.send(msg);
			messgListReducer({
				type: "addMessg",
				payload: {
					msg: msg,
					user: socketRef.current.id,
					time: formatDate(),
				},
			});
			console.log(peer);
		});
		console.log();
	};

	const messageAlert = () => {};

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
			<MeetingHeader setMessenger={setMessenger} id={id} />

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
					messageListState={messageListState}
				/>
			) : (
				<Alert messageAlert={messageAlert} />
			)}
		</div>
	);
};

export default Room;
