import {SIGNAL_TYPES,SIGNAL_STATUS,CONFIG,DATA_TYPES} from '../Constants.js';

let base64_arraybuffer = require('base64-arraybuffer');

let WebRTC = require('react-native-webrtc');
let {
  RTCPeerConnection
} = WebRTC;

const config = {
  iceServers: CONFIG.ICE_SERVERS
};

class MessageDecoder{
  constructor(peer){
    this.peer = peer;
  }
  static _stringToUint(string) {
    let charList = string.split(''),
        uintArray = [];
    for (let i = 0; i < charList.length; i++) {
        uintArray.push(charList[i].charCodeAt(0));
    }
    return new Uint8Array(uintArray);
 }
 static _uintToString(uintArray) {
    return String.fromCharCode.apply(null, uintArray);
 }
  /*
   *    Takes JSON as parameter and returns ArrayBuffer
   *    example-json:{
   *      INFO: JSON {DATA_TYPE & OTHER RELATED INFO}
   *      DATA: Base64(if sending DATA_PIECE)
   *    }
   */
   encode(json){
    //TODO IMPLEMENT ENCRYPTION!!!
    //console.log('json', json);
    if(json===undefined || json===null){
      throw 'json parameter is neccessary!';
    }
    if(json.INFO===undefined || json.INFO.DATA_TYPE===undefined){
      throw 'parameter is not formed according to docs. Check MessageDecoder Class!';
    }
    let info = undefined;
    try{
      // JSON -> Uint8Array
      info = MessageDecoder._stringToUint(JSON.stringify(json.INFO));
    }catch(e){
      throw ('JSON -> Uint8Array error: ' + e);
    }
    if(info.buffer.byteLength>255){
      throw ('INFO byteLength cannot be bigger than 255: ' + info.buffer.byteLength);
    }

    let info_length = new Uint8Array(2);
    info_length.set([info.buffer.byteLength],0);

    if(json.INFO.DATA_TYPE === DATA_TYPES.DATA_PIECE){
      if(json.DATA===undefined){
        throw 'parameter is not formed according to docs. Check MessageDecoder Class!';
      }
      // BASE64 -> ArrayBuffer(Uint8Array)
      let data = base64_arraybuffer.decode(json.DATA);
      let tmp  = new Uint8Array(2 + info.buffer.byteLength + data.byteLength);
      tmp.set(info_length, 0);
      tmp.set(info, 2);
      tmp.set(new Uint8Array(data), 2+info.buffer.byteLength);
      return tmp.buffer;
    }else{
      let tmp = new Uint8Array(2 + info.buffer.byteLength);
      tmp.set(info_length, 0);
      tmp.set(info, 2);
      return tmp.buffer;
    }
  }
  /*
   *  Takes ArrayBuffer as parameter and returns JSON
   *  example-arraybuffer: INFO_LENGTH: first 2bytes (uint)
   *                        + INFO: next INFO_LENGTH bytes of the arraybuffer
   *                        + DATA: rest of the arraybuffer(if sending DATA_PIECE) (uintarray)
   */
   decode(arraybuffer){
    // TODO IMPLEMENT DECRYPTION!!!
    if(arraybuffer===undefined || arraybuffer===null){
      throw 'arraybuffer parameter is neccessary!';
    }
    if(arraybuffer.byteLength<2){
      throw 'arraybuffer cannot be shorter than 2 bytes!';
    }
    // first byte of the arraybuffer -> integer
    let info_length = new Uint8Array(arraybuffer.slice(0,2))[0];

    //info part of the arraybuffer -> JSON
    let info = undefined;
    try{
      let info_arraybuffer = arraybuffer.slice(2,2+info_length);
      let objString = MessageDecoder._uintToString(new Uint8Array(info_arraybuffer));
      //console.log('objString: ', objString);
      info = JSON.parse(objString);
    }catch(e){
      throw ('info part of the arraybuffer -> JSON error: ' + e);
    }

    let data = undefined;
    if(info.DATA_TYPE === DATA_TYPES.DATA_PIECE){
      // rest of the arraybuffer -> BASE64
      let data_arraybuffer = arraybuffer.slice(2+info_length);
      data = base64_arraybuffer.encode(data_arraybuffer);
    }

    return {
      INFO: info,
      DATA: data
    };
  }
}

class Connection{
  constructor(peer) {
    if(peer===undefined){
      throw 'peer parameter is neccessary';
    }
    this.peer = peer;
    this.MessageDecoder = new MessageDecoder(peer);
    this.connection = new RTCPeerConnection(config);
    this.handleNegotiationNeededEvent = this.handleNegotiationNeededEvent.bind(this);
    this.connection.onicecandidate = this.handleICECandidateEvent.bind(this);
    //this.connection.onicegatheringstatechange = handleICEGatheringStateChangeEvent.bind(this);
    //this.connection.onsignalingstatechange = handleSignalingStateChangeEvent.bind(this);
    this.connection.onnegotiationneeded = this.handleNegotiationNeededEvent.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleRemoteIceCandidate = this.handleRemoteIceCandidate.bind(this);
    this.handleOfferEvent = this.handleOfferEvent.bind(this);
    this.handleAnswerEvent = this.handleAnswerEvent.bind(this);
    this.handleAfterChannelSet = this.handleAfterChannelSet.bind(this);
  }
  reportError(err){
    console.log(err);
  }
  handleICECandidateEvent(event){
    if (event.candidate) {
      /*
      Signal.sendSignal({
        type: SIGNAL_TYPES.ICE_CANDIDATE,
        status: SIGNAL_STATUS.INFORMATION,
        message: {
          candidate: event.candidate
        }
      });*/
      console.log('ice candidate: ', event.candidate);
      this.remote.handleRemoteIceCandidate(event.candidate);
    }
  }

  handleNegotiationNeededEvent(){
    this.connection.createOffer()
    .then(offer => this.connection.setLocalDescription(offer))
    .then(()=>{
      /*
      Signal.sendSignal({
        type: SIGNAL_TYPES.DATA_CHANNEL,
        status: SIGNAL_STATUS.QUESTION,
        message: {
          sdp: this.connection.localDescription
        }
      });
      */
      console.log('sdp: ', this.connection.localDescription);

      this.remote.handleOfferEvent(this.connection.localDescription);
    })
    .catch(this.reportError);
  }

  handleRemoteIceCandidate(candidate){
    console.log('Setting ICE_CANDIDATE');
    this.connection.addIceCandidate(candidate);
  }
  //WILL BE CALLED FROM SIGNAL
  handleOfferEvent(offer){
    this.connection.setRemoteDescription(offer)
      .then(()=> this.connection.createAnswer())
      .then(answer => this.connection.setLocalDescription(answer))
      .then(()=>{
        /*
        Signal.sendSignal({
          type: SIGNAL_TYPES.DATA_CHANNEL,
          status: SIGNAL_STATUS.SUCCESS,
          message: {
            sdp: this.connection.localDescription
          }
        });
        */
        console.log('sdp: ', this.connection.localDescription);

        this.remote.handleAnswerEvent(this.connection.localDescription);
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
  sendMessage(json){
    let message = undefined;
    try{
      message = this.MessageDecoder.encode(json);
    }catch(e){
      console.log('MessageDecoder Exception: ', e);
    }
    if(message!==undefined)
      this.channel.send(message);
    else
      console.log('undefined message will not be sent');
  }
  handleReceiveMessage(event){
    let message = undefined;
    try{
      message = this.MessageDecoder.decode(event.data);
    }catch(e){
      console.log('MessageDecoder Exception: ', e);
    }
    return message;
  }
  disconnect(){
    if(this.channel && this.channel.close)
      this.channel.close();
    this.connection.close();
    this.channel = null;
    this.connection = null;
  }
}
class LocalConnection extends Connection {
  constructor(peer,onmessage){
    super(peer);  //TODO give related parameters
    this._createDataChannel = this._createDataChannel.bind(this);
    this.connection.oniceconnectionstatechange = this.handleICEConnectionStateChange.bind(this);
    setTimeout(() => {
      this.handleNegotiationNeededEvent();
    },3000);
    //console.log('Connection: ' + this.connection);
  }
  handleReceiveMessage(event){
    const message = super.handleReceiveMessage(event);
    console.log('message received!',message.INFO);
    switch (message.INFO.DATA_TYPE) {
      case DATA_TYPES.DATA_PIECE:
        if(this.onDataPiece){
          this.onDataPiece(message);
        }else{
          console.log('onDataPiece method has not been set yet!');
        }
        break;
      case DATA_TYPES.DATA_PIECE_REQUEST:
        if(this.onDataPieceRequest){
          this.onDataPieceRequest(message);
        }else {
          console.log('onDataPieceRequest method has not been set yet!');
        }
        break;
      case SIGNAL:
      default:
        console.log('unknown message');
    }
  }
  handleICEConnectionStateChange(event){
    console.log('LocalConnection:');
    switch(this.connection.iceConnectionState) {
      case "new":
        console.log('new ice connection');
        break;
      case "checking":
        console.log('checking ice connection');
        break;
      case "completed":
        console.log('ice connection completed');
        break;
      case "connected":
        // The connection has become fully connected
        console.log('Connection Succeed! Creating Data Channel');
        this._createDataChannel();
        break;
      case "disconnected":
        console.log('disconnected');
        break;
      case "failed":
        // One or more transports has terminated unexpectedly or in an error
        console.log('connection failed');
        break;
      case "closed":
        // The connection has been closed
        console.log('connection closed');
        break;
    }
  }
  _createDataChannel(){
    this.channel = this.connection.createDataChannel("sendChannel",{
      ordered: false,
      maxPacketLifeTime: 1000,
      maxRetransmits: 3
    });
    this.handleAfterChannelSet();
  }
}

class RemoteConnection extends Connection {
  constructor(peer){
    super(peer);  //TODO give related parameters
    this.connection.ondatachannel = this.receiveChannelCallback.bind(this);
    this.connection.oniceconnectionstatechange = this.handleICEConnectionStateChange.bind(this);
  }
  receiveChannelCallback(event) {
    this.channel = event.channel;
    this.handleAfterChannelSet();
  }
  handleReceiveMessage(event){
    const message = super.handleReceiveMessage(event);
    if(message === undefined){
      console.log('undefined message received!');
      return;
    }
    console.log('message received!', message.INFO);
    switch (message.INFO.DATA_TYPE) {
      case DATA_TYPES.DATA_PIECE:
        if(this.onDataPiece!==undefined){
          this.onDataPiece(message);
        }else{
          console.log('onDataPiece method has not been set yet!');
        }
        break;
      case DATA_TYPES.DATA_PIECE_REQUEST:
        if(this.onDataPieceRequest !==undefined){
          this.onDataPieceRequest(message);
        }else {
          console.log('onDataPieceRequest method has not been set yet!');
        }
        break;
      case SIGNAL:
      default:
        console.log('unknown message');
    }
  }
  handleICEConnectionStateChange(event){
    console.log('RemoteConnection:');
    switch(this.connection.iceConnectionState) {
      case "new":
        console.log('new ice connection');
        break;
      case "checking":
        console.log('checking ice connection');
        break;
      case "completed":
        console.log('ice connection completed');
        break;
      case "connected":
        // The connection has become fully connected
        console.log('Connected!');
        break;
      case "disconnected":
        console.log('disconnected');
        break;
      case "failed":
        // One or more transports has terminated unexpectedly or in an error
        console.log('connection failed');
        break;
      case "closed":
        // The connection has been closed
        console.log('connection closed');
        break;
    }
  }
}

export {Connection,LocalConnection,RemoteConnection};
