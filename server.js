require("dotenv").config();
const express = require("express");

const app = express();
const server = require("http").createServer(app);
// const mongoose = require("mongoose");
const io = require("socket.io")(server);

const port = process.env.PORT || 9000;
let cors = require("cors");

app.use(cors());

const users = {};
const totalUsers = [];
const socketToRoom = {};
let roomid;
let chatMessages = [];

io.on("connection", (socket) => {
	console.log("connected");
	socket.on("join room", (roomID) => {
		console.log(roomID + "  ROOM ID");
		roomid = roomID;
		if (users[roomID]) {
			const length = users[roomID].length;
			console.log(length);
			if (length === 4) {
				socket.emit("room full");
				console.log("ROOM IS FULL");

				return;
			}
			console.log("SOCKET ID " + socket.id);
			users[roomID].push(socket.id);
		} else {
			//creating room
			// socket.id is the id of user joining
			console.log("CREATING NEW ROOM");
			users[roomID] = [socket.id];
		}
		// ROOM ID STORED AT SOCK.id position
		socketToRoom[socket.id] = roomID;
		// ARRAY OF USERS IN THE ROOM
		usersInThisRoom = users[roomID].filter((id) => id !== socket.id);

		//SENDING RESPONSE TO FRONTHEND
		socket.emit("all users", usersInThisRoom);
		console.log("USER IN THE ROOM " + usersInThisRoom);
	});

	socket.on("sending signal", (payload) => {
		console.log(JSON.stringify(payload.userToSignal) + "   sending signal");
		io.to(payload.userToSignal).emit("user joined", {
			signal: payload.signal,
			callerID: payload.callerID,
		});
	});
	// socket.on recieving data/signal
	//io.to sending signal

	socket.on("returning signal", (payload) => {
		console.log(JSON.stringify(payload.callerID) + "  returning signal");
		io.to(payload.callerID).emit("receiving returned signal", {
			signal: payload.signal,
			id: socket.id,
		});
	});

	socket.on("prevMessage", (payload) => {
		console.log(JSON.stringify(payload) + "prevMeasseafe");
		if (payload !== null) {
			chatMessages = [...payload];
		}
	});

	socket.on("chatMessages", (payload) => {
		chatMessages.push(payload);
		console.log(users[roomid]);
		socket.broadcast
			.to(users[roomid])
			.emit("allMessages", { payload: payload, chatMessages: chatMessages });

		
		io.to(payload.user).emit("currentUserMessages", {
			payload: payload,
			chatMessages: chatMessages,
		});
		chatMessages = [];
	});

	socket.on("disconnect", () => {
		console.log("called");
		const roomID = socketToRoom[socket.id];
		let room = users[roomID];
		if (room) {
			room = room.filter((id) => id !== socket.id);
			users[roomID] = room;
		}
	});
});


if (process.env.NODE_ENV === "production") {
	const path = require("path");
	app.use(express.static(path.join(__dirname, "client/build")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "client/build", "index.html"));
	});
}


server.listen(port, () => {
	console.log(`server listens at http://localhost:${port}`);
});
