import logo from './logo.svg';
import './App.css';
import {useEffect, useState, useRef} from "react";
function App() {


  const [ws,setWs] = useState();
  const [text, setText] = useState("");
	const [localTrack, setLocalTrack] = useState(null);
const localVideo = useRef(null);
	const peerConnection = useRef(null);
  useEffect(()=>{


	  try{
	navigator.mediaDevices.getDisplayMedia({
	audio: true,
		video: true
	}).then(stream=>{
	localVideo.current.srcObject = stream;
		
	});
		  const peerConnection = new RTCPeerConnection({})
	  }
	  catch(error){
	  }
    const ws = new WebSocket('ws://localhost:3000');
    setWs(ws)

    ws.addEventListener('open', (event) => {
      ws.send('Hello from client');
    })


    ws.addEventListener('message', (message) => {
      console.log(`Received from server: ${message}`);
    });


    ws.addEventListener('close', (message) => {
      console.log(`Disconnected from the server`);
    });

  },[])

  function sendMessageToServer(){
    ws.send(text);
  }
  return (
    <div className="App">
      <header className="App-header">
        <input type={"text"} value={text} onChange={(event)=>setText(event.target.value)}/>
        <button onClick={sendMessageToServer}>Send Event to client</button>
      <video ref={localVideo} autoPlay muted playsInline style={{width: '300px', height:'400px', border:'1px solid black'}} />
	  </header>
    </div>
  );
}

export default App;
