require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const server = require("http").createServer(app);
const mongoose = require("mongoose");
const io = require("socket.io")(server);
const port = 9000;
const redis = require("redis");

// io.on("connection", (socket) => {
//   try {
//     console.log("Connected");
//     socket.on("event", (data) => {
//       console.log(" EVENT DATA");
//     });

//     socket.on("code", (data,id) => {
//           socket.join(id);

//       console.log(JSON.stringify(id) + " SOCKET DATA ");
//       socket.broadcast.emit("code", data);    });
//   } catch (ex) {
//     console.log(ex.message);
//   }
// });

const users = {};

const socketToRoom = {};

io.on("connection", (socket) => {
  console.log("connected");
  socket.on("join room", (roomID) => {
    console.log(roomID+"  ROOM ID");
    if (users[roomID]) {
      const length = users[roomID].length;
      if (length === 4) {
        socket.emit("room full");
        console.log("ROOM IS FULL");
        return;
      }
      console.log("SOCKET ID "+socket.id)
      users[roomID].push(socket.id);
    } else {
      //creating room
      users[roomID] = [socket.id];
    }
    // ROOM ID STORED AT SOCK.id position
    socketToRoom[socket.id] = roomID;
    // ARRAY OF USERS IN THE ROOM
    const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);

    //SENDING RESPONSE TO FRONTHEND
    socket.emit("all users", usersInThisRoom);
    console.log("USER IN THE ROOM " +usersInThisRoom);
  });

  socket.on("sending signal", (payload) => {
    console.log(JSON.stringify(payload) + "   sending signal");
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });

  socket.on("returning signal", (payload) => {
    console.log(JSON.stringify(payload) + "  returning signal");
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  // socket.on("disconnect", () => {
  //   const roomID = socketToRoom[socket.id];
  //   let room = users[roomID];
  //   console.log(room+"  ROOM");
  //   if (room) {
  //     room = room.filter((id) => id !== socket.id);
  //     users[roomID] = room;
  //   }
  // });
});

mongoose.connect("mongodb://localhost:27017/googleMeetDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.set("useCreateIndex", true);

mongoose.set("useFindAndModify", false);
const googleMeet = new mongoose.Schema({
  callId: "",
});
const Meeting = mongoose.model("Client", googleMeet);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const client = redis.createClient();
client.on("error", function (error) {
  console.error(error);
});

app.post("/api/save-call-id", (req, res) => {
  const { id, signalData } = req.body;
  client.set(id, JSON.stringify(signalData), (err, response) => {
    if (err) {
      console.log(err);
    } else {
      //   console.log(response);
      res.status(200).send(true);
    }
  });

  //Save the call id in the database
});
app.get("/api/get-call-id/:id", (req, res) => {
  const param = req.params;
  client.get(param.id, (err, response) => {
    if (err) {
      console.log(err);
    } else {
      // console.log(JSON.parse(response));
      res.status(200).send(response);
    }
  });

  //   console.log("GET FUNCTION CALLED " + JSON.stringify(param.id));
  //   res.send();
});

server.listen(port, () => {
  console.log(`Server listen http://localhost:${port}`);
});
