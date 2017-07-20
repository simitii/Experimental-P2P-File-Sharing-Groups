import {SIGNAL_TYPES,SIGNAL_STATUS,CONFIG} from 'Constants';
import Data from 'Data';
import Signal from 'Signal';

let WebRTC = require('react-native-webrtc');
let {
  RTCPeerConnection
} = WebRTC;

const config = {
  iceServers: CONFIG.ICE_SERVERS
};

class Connection extends Data{
  constructor(peer) {
    if(peer===undefined){
      throw 'peer parameter is neccessary';
    }
    this.peer = peer;
    this.connection = new RTCPeerConnection(config);
    this.connection.onicecandidate = handleICECandidateEvent.bind(this);
    //this.connection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent.bind(this);
    //this.connection.onicegatheringstatechange = handleICEGatheringStateChangeEvent.bind(this);
    //this.connection.onsignalingstatechange = handleSignalingStateChangeEvent.bind(this);
    this.connection.onnegotiationneeded = handleNegotiationNeededEvent.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleOfferEvent = this.handleOfferEvent.bind(this);
    this.handleAnswerEvent = this.handleAnswerEvent.bind(this);
    this.handleAfterChannelSet = this.handleAfterChannelSet.bind(this);
  }
  reportError(err){
    console.log(err);
  }
  handleICECandidateEvent(event){
    if (event.candidate) {
      Signal.sendSignal({
        type: SIGNAL_TYPES.ICE_CANDIDATE,
        status: SIGNAL_STATUS.INFORMATION,
        message: {
          candidate: event.candidate
        }
      });
    }
  }
  handleNegotiationNeededEvent(){
    this.connection.createOffer()
    .then(offer => this.connection.setLocalDescription(offer))
    .then(()=>{
      Signal.sendSignal({
        type: SIGNAL_TYPES.DATA_CHANNEL,
        status: SIGNAL_STATUS.QUESTION,
        message: {
          sdp: this.connection.localDescription
        }
      });
    })
    .catch(this.reportError);
  }

  //WILL BE CALLED FROM SIGNAL
  handleOfferEvent(offer){
    this.connection.setRemoteDescription(offer);
      .then(()=> this.connection.createAnswer())
      .then(answer => this.connection.setLocalDescription(answer))
      .then(()=>{
        Signal.sendSignal({
          type: SIGNAL_TYPES.DATA_CHANNEL,
          status: SIGNAL_STATUS.SUCCESS,
          message: {
            sdp: this.connection.localDescription
          }
        });
      })
      .catch(this.reportError);
  }

  //WILL BE CALLED FROM SIGNAL
  handleAnswerEvent(answer){
    this.connection.setRemoteDescription(answer)
      .catch(this.reportError);
  }

  handleChannelStatusChange(event) {
     if (this.channel) {
       var state = this.channel.readyState;
       if (state === "open") {
         //CHANNEL OPENED
       } else {
         //CHANNEL IS CURRENTLY NOT OPENED
       }
     }
  }
  handleAfterChannelSet(){
    this.channel.binaryType = 'arraybuffer';
    this.channel.onmessage = this.handleReceiveMessage.bind(this);
    this.channel.onopen = this.handleChannelStatusChange.bind(this);
    this.channel.onclose = this.handleChannelStatusChange.bind(this);
  }
  sendMessage(message){
    //TODO CHECK CHANNEL
    this.channel.send(message);
  }
  _onMessage(message){
    //TODO IMPLEMENT DETAILS
    console.log(message);
  }
  disconnect(){
    this.channel.close();
    this.connection.close();
    this.channel = null;
    this.connection = null;
  }
}
class LocalConnection extends Connection {
  constructor(peer){
    super(peer);  //TODO give related parameters
    this.channel = this.connection.createDataChannel("sendChannel");
    this.handleAfterChannelSet();
  }
}

class RemoteConnection extends Connection {
  constructor(peer){
    super(peer);  //TODO give related parameters
    this.connection.ondatachannel = receiveChannelCallback;
  }
  receiveChannelCallback(event) {
    this.channel = event.channel;
    this.handleAfterChannelSet();
  }
}

export {Connection,LocalConnection,RemoteConnection}
