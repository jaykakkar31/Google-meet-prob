import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

// const Container = styled.div`
// 	display: flex;
// 	align-items: center;
// 	height: calc(100vh - 90px);
// 	width: 100vw;
// 	flex-wrap: wrap;
// 	justify-content: center;
// `;
// const StyledVideo = styled.video`
// 	height: 50%;
// 	width: 50%;
// `;
const vidStyle = {
	height: "50%",
	width: "50%",
    // borderRadius:"10px"
};

const Video = (props) => {
	const ref = useRef();

	useEffect(() => {
		console.log(props.peer);
		props.peer.on("stream", (stream) => {
			console.log("ENTE0RD" + stream);
			ref.current.srcObject = stream;
		});
	}, []);

	return <video  style={vidStyle} autoPlay ref={ref} />;
};

const videoConstraints = {
	height: window.innerHeight / 2,
	width: window.innerWidth / 2,
};

const Room = (props) => {
    const numUsers=useRef()
	const [peers, setPeers] = useState([]);
	const socketRef = useRef();
	const userVideo = useRef();
	const peersRef = useRef([]);
	const roomID = props.id;

	useEffect(() => {
		socketRef.current = io.connect("http://localhost:9000");
		navigator.mediaDevices
			.getUserMedia({ video: videoConstraints, audio: true })
			.then((stream) => {
				userVideo.current.srcObject = stream;
				console.log("USERVIDEO" + stream);
				// LOGIC THAT USER HAS JOINED THE ROOM

				//THIS EVENT Is NOT CACHED AT BACKEND
				//.emit means sending  to backend
				socketRef.current.emit("JOINED ROOM");
				socketRef.current.emit("join room", roomID);
				// Recieve users from backened
				if (!props.isAdmin) {
					socketRef.current.on("all users", (users) => {
						//peers is for how many videos are rendering
						console.log(users.length);
                        numUsers.current=users.length+1
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
				}
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

	// console.log("PEERS " + JSON.stringify(peers));
	return (
		<div className="container">
			<video style={vidStyle} muted ref={userVideo} autoPlay />
			{peers.map((peer, index) => {
				return <Video key={index} peer={peer} />;
			})}
		</div>
	);
};

export default Room;
