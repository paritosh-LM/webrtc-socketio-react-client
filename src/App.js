import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

function App() {
  const [ws, setWs] = useState();
  const [text, setText] = useState("");
  const [offer, setOffer] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [stream, localStream] = useState(null);
  const localVideo = useRef(null);
  const peerConnection = useRef(null);
  const socketIo = useRef(null);

  const initializePeerConnection = (iceServers) => {
    if (peerConnection.current) return;
    peerConnection.current = new RTCPeerConnection({
      iceServers,
    });

    peerConnection.current.onicecandidate = (event) => {
      socketIo.current.emit("ice-candidate", event.candidate);
    };
  };

  const createOffer = () => {
    if (peerConnection.current) {
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });
      peerConnection.current.createOffer().then((offer) => {
        peerConnection.current.setLocalDescription(offer);
        setOffer(offer);
      });
    }
  };

  const sendOffer = () => {
    if (offer) {
      socketIo.current.emit("offer", offer);
    }
  };

  const getTracks = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: true,
    });
    localVideo.current.srcObject = stream;
    localStream(stream);
  };

  const initializeSocketIo = () => {
    if (socketIo.current) return;
    try {
      socketIo.current = io("ws://localhost:3001", {
        path: "/webrtc",
      });
      socketIo.current.on("connect", () => {
        console.log("connected to socket io");
      });
      socketIo.current.on("offer", (offer) => {
        console.log("offer received", offer);
        peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
      });

      socketIo.current.on("ice-candidate", (candidate) => {
        peerConnection.current.addIceCandidate(candidate);
      });
    } catch (error) {
      console.log("socketio connection error", error);
    }
  };

  useEffect(() => {
    initializePeerConnection([
      {
        urls: ["stun:stun.cloudflare.com:3478", "stun:stun.cloudflare.com:53"],
      },
      {
        urls: [
          "turn:turn.cloudflare.com:3478?transport=udp",
          "turn:turn.cloudflare.com:53?transport=udp",
          "turn:turn.cloudflare.com:3478?transport=tcp",
          "turn:turn.cloudflare.com:80?transport=tcp",
          "turns:turn.cloudflare.com:5349?transport=tcp",
          "turns:turn.cloudflare.com:443?transport=tcp",
        ],
        username:
          "g0640d6950d2deb1c4f0f0efe14ce1e2bd1a467df7ed4ffd971a1501a90b858a",
        credential:
          "8eb7c153f2ca51dde45d06fa91ac9fa133017c0f23317872a928924e4b54db24",
      },
    ]);

    initializeSocketIo();
  }, []);

  function sendMessageToServer() {
    ws.send(text);
  }

  function sendDeviceConnection(){
       socketIo.current.emit("device-connected", true);
  }

  return (
    <div className="App">
      <header className="App-header">
        <input
          type={"text"}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button onClick={sendMessageToServer}>Send Event to client</button>
        <button onClick={getTracks}>Get Tracks</button>
        <button onClick={createOffer}>Create offer</button>
        <button onClick={sendOffer}>Send Offer</button>
        <button onClick={sendDeviceConnection}>Send Device Connected Status</button>
        <video
          ref={localVideo}
          autoPlay
          muted
	  controls
          playsInline
          style={{ width: "300px", height: "400px", border: "1px solid black" }}
        />
      </header>
    </div>
  );
}

export default App;
