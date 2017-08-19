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
  UNKNOWN_OBJECT_TYPE: new EXCEPTION_ENUM('UNKNOWN_OBJECT_TYPE',(args) => {
    if(args.length!==2){
      return undefined;
    }
    return `UNKNOWN OBJECT TYPE: ${args[0]} cannot be used with ${args[1]} class!`;
  }),
  CANNOT_SET_AFTER_INIT: new EXCEPTION_ENUM('CANNOT_SET_AFTER_INIT',(args) => {
    if(args.length!==2){
      return undefined;
    }
    return `PROPERTY: ${args[0]} cannot be set after object initialized from ${args[1]} class!` + '\nIf this is array or object, you may use array and object manipulation operations.';
  }),
  INVALID_VALUE: new EXCEPTION_ENUM('INVALID_VALUE',(args) => {
    if(args.length!==2){
      return undefined;
    }
    return `INVALID VALUE: ${args[0]} is not an instance of ${args[1]}`;
  }),
  FILE_NOT_FOUND: new EXCEPTION_ENUM('FILE_NOT_FOUND',(args) => {
    if(args.length!==1){
      return undefined;
    }
    return `File is not found at ${args[0]}`;
  }),
  NOT_A_FILE: new EXCEPTION_ENUM('NOT_A_FILE',(args) => {
    if(args.length!==1){
      return undefined;
    }
    return `${args[0]} is not a File`;
  }),
  INTERFACE_ABSTRACT_CLASS_ERROR: new EXCEPTION_ENUM('INTERFACE_ERROR', (args) => {
    if(args.length!==1){
      return undefined;
    }
    return `${args[0]} is an Interface/Abstract_Class. You cannot have an instance of an Interface/Abstract_Class and some methods must be overridden.`
  }),
  MUST_BE_OVERRIDDEN: new EXCEPTION_ENUM('MUST_BE_OVERRIDDEN', (args) => {
    if(args.length!==1){
      return undefined;
    }
    return `${args[0]} is an abstact method. It must be overridden!`;
  }),
  NECESSARY_PARAMS: new EXCEPTION_ENUM('NECESSARY_PARAMS', (args) => {
    if(args.length!==1){
      return undefined;
    }
    return `${args[0]} method did NOT get neccessary! Please check the method call.`;
  }),
  UNKNOWN_PROTOCOL: new EXCEPTION_ENUM('UNKNOWN_PROTOCOL', (args) => {
    if(args.length!==1){
      return undefined;
    }
    return `UNKNOWN PROTOCOL with code:'${args[0]}'`;
  })
};


const isValid = (EnumObject) => {
  return (givenValue) => {
    for(let [key,value] of Object.entries(EnumObject)){
      if(value === givenValue){
        return true;
      }
    }
    return false;
  };
};

const SIGNAL_TYPES = {
  DATA_CHANNEL : 'DATA_CHANNEL',
  ICE_CANDIDATE : 'NEW_ICE_CANDIDATE',
  TUNNEL_CHANNEL : 'TUNNEL_CHANNEL',
  INVITATION : 'INVITATION',
  PEOPLE : 'PEOPLE',
  FILE_META : 'FILE_META',
  FILE_SEND_REQUEST : 'FILE_SEND_REQUEST',

  toString: () => 'SIGNAL_TYPES',
};
SIGNAL_TYPES.isValid = isValid(SIGNAL_TYPES);  //Validates if given value is an instance of this ENUM

const SIGNAL_STATUS = {
  SUCCESS: 'SUCCESS',
  FAIL : 'FAIL',
  QUESTION : 'QUESTION',
  INFORMATION : 'INFORMATION',

  toString: () => 'SIGNAL_STATUS',
};
SIGNAL_STATUS.isValid = isValid(SIGNAL_STATUS);  //Validates if given value is an instance of this ENUM

const DATA_TYPES = {
  SIGNAL : 'SIGNAL',
  DATA_PIECE : 'DATA_PIECE',
  DATA_PIECE_REQUEST: 'DATA_PIECE_REQUEST',

  toString: () => 'DATA_TYPES',
};
DATA_TYPES.isValid = isValid(DATA_TYPES);  //Validates if given value is an instance of this ENUM

const CONNECTION_STATUS = {
  CONNECTED: 'CONNECTED',
  PENDING : 'PENDING',
  CANCELLED : 'CANCELLED',
  PENDING_TUNNEL : 'PENDING_TUNNEL',
  DISCONNECTED: 'DISCONNECTED',

  toString: () => 'CONNECTION_STATUS',
};
CONNECTION_STATUS.isValid = isValid(CONNECTION_STATUS);  //Validates if given value is an instance of this ENUM

const DOWNLOAD_STATUS = {
  NOT_ORDERED: 'NOT_ORDERED',
  ORDERED: 'ORDERED',
  COMPLETED: 'COMPLETED',

  toString: () => 'DOWNLOAD_STATUS',
};
DOWNLOAD_STATUS.isValid = isValid(DOWNLOAD_STATUS);  //Validates if given value is an instance of this ENUM

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

const DEFINE_CONST_PROPERTY = (obj,propName,propValue,className) => {
  if(obj===undefined || propName===undefined || propValue===undefined || className===undefined){
    throw `DEFINE_CONST_PROPERTY (${propName}): missing parameter exception`;
  }
  let value = propValue;
  Object.defineProperty(obj,propName,{
    set: () => {
      EXCEPTION.CANNOT_SET_AFTER_INIT.throw(propName,className);
    },
    get: () => {
      return value;
    }
  });
};

const DEFINE_ENUM_PROPERTY = (obj,propName,defaultValue,EnumObject) => {
  if(obj===undefined || propName===undefined || defaultValue===undefined || EnumObject===undefined){
    throw `DEFINE_ENUM_PROPERTY (${propName}): missing parameter exception`;
  }
  let value = defaultValue;
  Object.defineProperty(obj,propName,{
    set: (_value) => {
      if(EnumObject.isValid(_value)){
        value = _value;
      }else{
        EXCEPTION.INVALID_VALUE.throw(_value,EnumObject.toString());
      }
    },
    get: () => {return value}
  })
};

export {EVENT,EXCEPTION,DEFINE_ENUM_PROPERTY,DEFINE_CONST_PROPERTY,SIGNAL_TYPES,SIGNAL_STATUS,CONNECTION_STATUS,DOWNLOAD_STATUS,DATA_TYPES,CONFIG}
