import react, { useState, useEffect, useReducer } from "react";

import { useParams, useHistory } from "react-router-dom";
import MeetingHeader from "./meetingHeader";
import MeetingFooter from "./meetingFooter";
import MeetingInfo from "./meetingInfo";
import Messenger from "./messenger";
import Alert from "./alert";
import Peer from "simple-peer";
import { getCallId, saveCallId } from "././services/UserService";
import io from "socket.io-client";
function VideoPage() {
  const history = useHistory();
  //#init
  console.log(window.location.hash);
  const socket = io("http://localhost:9000");
  let alertTimeout = null;
  const { id } = useParams();
  console.log(useParams());
  let peer = null;
  const isAdmin = window.location.hash === "#init" ? true : false;
  const url = `${window.location.origin}${window.location.pathname}`;

  const [meetingInfoPopUp, setMeetingInfoPopUp] = useState(false);
  const [isMessenger, setMessenger] = useState(false);
  const [messageAlert, setMessageAlert] = useState({});
  const [isAudio, setIsAudio] = useState(true);
  const [streamObj, setStreamObj] = useState();

  //MESSAGE CHAT
  const intialState = [];
  const MessageListReducer = (state, action) => {
    switch (action.type) {
      case "addMessage":
        return [...state, action.payload];

      default:
        return state;
    }
  };

  const [messageList, setMessageList] = useReducer(
    MessageListReducer,
    intialState
  );

  const getRecieverCode = () => {
    getCallId(id).then((response) => {
      console.log(response);
      peer.signal(response.data)
    });
  };

  useEffect(() => {
    //Call every time when page renders
    if (isAdmin) {
      setMeetingInfoPopUp(true);
    }
    initWebRTC();
    socket.on("code", (data) => {
      console.log(data);
      peer.signal(data);
    });
  }, []);

  const initWebRTC = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        console.log(stream);

        peer = new Peer({
          initiator: isAdmin,
          //trickle wait for all the data to send makes it slow
          trickle: false,
          stream: stream,
        });

        if (!isAdmin) {
          getRecieverCode();
        }

        peer.on("signal", (data) => {
          if (isAdmin) {
            console.log("Id : " + id);
            let payload = {
              id: id,
              signalData: data,
            };
            saveCallId(payload).then((response) => {
              console.log(response);
            });
          } else {
            //Socket event
            console.log("ENTeR");
            socket.emit("code", data, (cbdata) => {
              console.log(data);
              console.log("code sent");
            });
          }
        });

        peer.on("connect", () => {
          console.log("peer connected");
        });

        peer.on("stream", (stream) => {
          // got remote video stream, now let's show it in a video tag
          var video = document.querySelector("video");

          if ("srcObject" in video) {
             
            video.srcObject = stream;
          } else {
            video.src = window.URL.createObjectURL(stream); // for older browsers
          }
          video.play()
        });
      });
  };

  console.log(id);

  console.log(isAdmin);
  return (
    <div class="videoScreen">
      <MeetingHeader setMessenger={setMessenger} />
      <MeetingFooter />
      {isAdmin && meetingInfoPopUp && (
        <MeetingInfo url={url} setMeetingInfoPopUp={setMeetingInfoPopUp} />
      )}
      {isMessenger ? (
        <Messenger setMessenger={setMessenger} messageList={messageList} />
      ) : (
        <Alert />
      )}
    </div>
  );
}

export default VideoPage;
