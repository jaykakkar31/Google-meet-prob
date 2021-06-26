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
const { response } = require("express");

io.on("connection", (socket) => {
  try {
    console.log("Connected");
    socket.on("event", (data) => {
      console.log(data + " EVENT DATA");
    });

    socket.on("code", (data, callback) => {
    //   console.log(JSON.stringify(data) + " SOCKET DATA ");
      socket.broadcast.emit("code", data);
    });
  } catch (ex) {
    console.log(ex.message);
  }
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
      console.log(response);
      res.status(200).send(true);
    }
  });

  console.log(id);
  //Save the call id in the database
});
app.get("/api/get-call-id/:id", (req, res) => {
  const param = req.params;
  client.get(param.id, (err, response) => {
    if (err) {
      console.log(err);
    }else{
        console.log(JSON.parse(response));
          res.status(200).send(response);

    }
  });
  
//   console.log("GET FUNCTION CALLED " + JSON.stringify(param.id));
//   res.send();
});

server.listen(port, () => {
  console.log(`Server listen http://localhost:${port}`);
});
