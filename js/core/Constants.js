//import EventEmitter from 'es-event-emitter';
const EM = {};//new EventEmitter();

class EVENT_ENUM{
  constructor(name){
    this.name = name;
    this.emit = this.emit.bind(this);
    this.addListener = this.addListener.bind(this);
  }
  toString(){
    return `EVENT.${this.name}`;
  }
  emit(data=undefined){
    //Data should be in json format
    EM.emit(this.toString,data);
  }
  addListener(callback){
    EM.on(this.toString,callback);
  }
  removeListener(callback=undefined){
    if(callback===undefined){
      throw 'callback parameter is neccessary.' +
              '\nremoveListener deletes only given callback.' +
              '\nUse removeAllListeners if you want to remove all';
    }
    EM.off(this.toString,callback);
  }
  removeAllListeners(){
    EM.off(this.toString);
  }
}
const EVENT={
  DATA_CHANNEL_SIGNAL : new EVENT_ENUM('DATA_CHANNEL_SIGNAL'),
  INVITATION_SIGNAL : new EVENT_ENUM('INVITATION_SIGNAL'),
  PEOPLE_SIGNAL : new EVENT_ENUM('PEOPLE_SIGNAL'),
  FILE_META_SIGNAL : new EVENT_ENUM('FILE_META_SIGNAL'),
  FILE_SEND_REQUEST_SIGNAL : new EVENT_ENUM('FILE_SEND_REQUEST_SIGNAL'),
  TUNNEL_CHANNEL_SIGNAL : new EVENT_ENUM('TUNNEL_CHANNEL_SIGNAL'),
  SIGNAL_IDS : new EVENT_ENUM('SIGNAL_IDS'),
  CHANGE_ON_ME : new EVENT_ENUM('CHANGE_ON_ME'),
};

class EXCEPTION_ENUM{
  constructor(name,detailsCallback){
    this.name = name;
    this._detailsCallback = detailsCallback || this._detailsCallback;
    this._details = 'No Details';
  }
  toString(){
    return `EXCEPTION.${this.name} \n ${this._details}`;
  }
  _detailsCallback(){
    return undefined;
  }
  throw(...args){
    this._details = this._detailsCallback(args) || 'No Details';
    throw this.toString();
  }
  test(...args){
    this._details = this._detailsCallback(args) || 'No Details';
    return this.toString();
  }
}

const EXCEPTION = {
  //TIME_OUT: new ERROR_ENUM('TIME_OUT'),
  WRONG_FUNCTION_CALL: new EXCEPTION_ENUM('WRONG_FUNCTION_CALL',(args) => {
    if(args.length!==2){
      return undefined;
    }
    return `you cannot call ${args[0]} function from an instance of ${args[1]} class!`;
  }),

};

const SIGNAL_TYPES = {
  DATA_CHANNEL : 'DATA_CHANNEL',
  ICE_CANDIDATE : 'NEW_ICE_CANDIDATE',
  TUNNEL_CHANNEL : 'TUNNEL_CHANNEL',
  INVITATION : 'INVITATION',
  PEOPLE : 'PEOPLE',
  FILE_META : 'FILE_META',
  FILE_SEND_REQUEST : 'FILE_SEND_REQUEST'
};

const SIGNAL_STATUS = {
  SUCCESS: 'SUCCESS',
  FAIL : 'FAIL',
  QUESTION : 'QUESTION',
  INFORMATION : 'INFORMATION'
};

const DATA_TYPES = {
  SIGNAL : 'SIGNAL',
  DATA_PIECE : 'DATA_PIECE',
  DATA_PIECE_REQUEST: 'DATA_PIECE_REQUEST'
};

const CONNECTION_STATUS = {
  CONNECTED: 'CONNECTED',
  PENDING : 'PENDING',
  CANCELLED : 'CANCELLED',
  PENDING_TUNNEL : 'PENDING_TUNNEL'
};

const CONFIG={
  ICE_SERVERS: [
    {url:'stun:stun01.sipphone.com'},
    {url:'stun:stun.ekiga.net'},
    {url:'stun:stun.fwdnet.net'},
    {url:'stun:stun.ideasip.com'},
    {url:'stun:stun.iptel.org'},
    {url:'stun:stun.rixtelecom.se'},
    {url:'stun:stun.schlund.de'},
    {url:'stun:stun.l.google.com:19302'},
    {url:'stun:stun1.l.google.com:19302'},
    {url:'stun:stun2.l.google.com:19302'},
    {url:'stun:stun3.l.google.com:19302'},
    {url:'stun:stun4.l.google.com:19302'},
    {url:'stun:stunserver.org'},
    {url:'stun:stun.softjoys.com'},
    {url:'stun:stun.voiparound.com'},
    {url:'stun:stun.voipbuster.com'},
    {url:'stun:stun.voipstunt.com'},
    {url:'stun:stun.voxgratia.org'},
    {url:'stun:stun.xten.com'},
    {
	     url: 'turn:numb.viagenie.ca',
	     credential: 'muazkh',
	     username: 'webrtc@live.com'
    },
    {
	     url: 'turn:192.158.29.39:3478?transport=udp',
	     credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
	     username: '28224511:1379330808'
    },
    {
	     url: 'turn:192.158.29.39:3478?transport=tcp',
	     credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
	     username: '28224511:1379330808'
    }
  ]
};

export {EVENT,EXCEPTION,SIGNAL_TYPES,SIGNAL_STATUS,CONNECTION_STATUS,DATA_TYPES,CONFIG}
