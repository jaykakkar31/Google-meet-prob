import react, { useState, useEffect, useReducer, useRef } from "react";

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
  const isAdmin = window.location.hash === "#init" ? true : false;

  //#init
  console.log(window.location.hash);
  const socket = io("http://localhost:9000");
  let alertTimeout = null;
  const { id } = useParams();

  // let peer = null;
  const url = `${window.location.origin}${window.location.pathname}`;

  const [meetingInfoPopUp, setMeetingInfoPopUp] = useState(false);
  const [isMessenger, setMessenger] = useState(false);
  // const [messageAlert, setMessageAlert] = useState({});
  // const [isAudio, setIsAudio] = useState(true);
  // const [streamObj, setStreamObj] = useState();

  // //MESSAGE CHAT
  // const intialState = [];
  // const MessageListReducer = (state, action) => {
  //   switch (action.type) {
  //     case "addMessage":
  //       return [...state, action.payload];

  //     default:
  //       return state;
  //   }
  // };

  // const [messageList, setMessageList] = useReducer(
  //   MessageListReducer,
  //   intialState
  // );

  // const getRecieverCode = () => {
  //   getCallId(id).then((response) => {
  //     console.log(response);
  //     peer.signal(response.data);
  //   });
  // };

  // useEffect(() => {
  //   //Call every time when page renders
  //   if (isAdmin) {
  //     setMeetingInfoPopUp(true);
  //   }
  //   initWebRTC();
  //   socket.on("code", (data) => {
  //     console.log(data);
  //     peer.signal(data);
  //   });
  // }, []);

  // const initWebRTC = () => {
  //   navigator.mediaDevices
  //     .getUserMedia({
  //       video: true,
  //       audio: true,
  //     })
  //     .then((stream) => {
  //       console.log(stream);

  //       peer = new Peer({
  //         initiator: isAdmin,
  //         //trickle wait for all the data to send makes it slow
  //         trickle: false,
  //         stream: stream,
  //       });

  //       if (!isAdmin) {
  //         getRecieverCode();
  //       }

  //       peer.on("signal", (data) => {
  //         if (isAdmin) {
  //           console.log("Id : " + id);
  //           let payload = {
  //             id: id,
  //             signalData: data,
  //           };
  //           saveCallId(payload).then((response) => {
  //             console.log(response);
  //           });
  //         } else {
  //           //Socket event
  //           // peer.on("open", (id) => {
  //           //   socket.emit("join-room", id, data);
  //           // });

  //           //SENDING TO BACKEND
  //           socket.emit("code", data, id);
  //         }
  //       });

  //       peer.on("connect", () => {
  //         console.log("peer connected");
  //       });

  //       peer.on("stream", (stream) => {
  //         // got remote video stream, now let's show it in a video tag
  //         var video = document.querySelector("video");

  //         if ("srcObject" in video) {
  //           video.srcObject = stream;
  //         } else {
  //           video.src = window.URL.createObjectURL(stream); // for older browsers
  //         }
  //         video.play();
  //       });
  //     });
  // };

  // NEW START

  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  // OBTAINED USING USE PARAMS
  const roomID = id;

  useEffect(() => {
    //Call every time when page renders
    if (isAdmin) {
      setMeetingInfoPopUp(true);
    }
    // initWebRTC();
    // ESTABLISHING CONNECT WITH BACKEND
    socketRef.current = io.connect("http://localhost:9000");
    // LOGIC FOR SOMEBODY JOINING THE ROOM
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        var video = document.querySelector("video");
        if ("srcObject" in video) {
          video.srcObject = stream;
        } else {
          video.src = window.URL.createObjectURL(stream); // for older browsers
        }
        video.play();

        // userVideo.current.srcObject = stream;
        // LOGIC THAT USER HAS JOINED THE ROOM

        //THIS EVENT Is NOT CACHED AT BACKEND
        //.emit means sending  to backend
        socketRef.current.emit("JOINED ROOM");
        socketRef.current.emit("join room", id);
        // Recieve users from backened
        if (!isAdmin) {
          socketRef.current.on("all users", (users) => {
            //peers is for how many videos are rendering
            console.log(users);
            const peersForVideos = [];
            users.forEach((userID) => {
              console.log(userID);
              console.log(socketRef.current.id);
              //socketRef.current.id is the of user currently joined
              //UserID  id's of all those inside the meeting

              const peer = createPeer(userID, socketRef.current.id, stream);
              //peersRef is for which is having connection with which
              peersRef.current.push({
                peerID: userID,
                peer,
              });
              peersForVideos.push(peer);
              setPeers(peersForVideos);
            });
          });
          //PERSON IN THE ROOM GETS NOTIFIED THAT SOMEBODY HAS JOINED
          //.on means recieving from backend
          socketRef.current.on("user joined", (payload) => {
            const peer = addPeer(
              payload.signal,
              payload.callerID,
              payload.stream
            );
            peersRef.current.push({
              peerID: payload.callerID,
              peer,
            });
            setPeers((prevUsers) => {
              return [...prevUsers, peer];
            });

            socketRef.current.on("receiving returned signal", (payload) => {
              // signal has been send to multiple now multiple users are sending back the signal to caller
              const item = peersRef.current.find((p) => {
                return p.peerID === payload.id;
              });
              item.peer.signal(payload.signal);
            });
          });
        }
      });
  }, []);

  function createPeer(userToSignal, callerID, stream) {
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
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });
    // 1 accepting the incoming signal that tthis will return the signal
    peer.signal(incomingSignal);

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });
  }

  return (
    <div class="videoScreen">
      <MeetingHeader setMessenger={setMessenger} />
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
