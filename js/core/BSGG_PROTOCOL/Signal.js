import OneSignal from 'react-native-onesignal';
import {EVENT,SIGNAL_TYPES,SIGNAL_STATUS,CONNECTION_STATUS,DATA_TYPES} from '../Constants.js';

let onRegistered = function(notifData) {
    console.log("Device had been registered for PUSH NOTIFICATIONS!", notifData);
};

let onIds = function(device) {
  console.log('Device info(PUSH NOTIFICATIONS): ', device);
  EVENT.SIGNAL_IDS.emit(device);
};
let onReceived = function(message){
  let signal = message; //TODO set signal to data part of notification
  Signal.onSignal(signal);
};

export default class Signal{
  constructor(type,status,message){
    if(type===undefined || status===undefined || message===undefined){
      throw 'all parameters are neccessary for Signal constructor!';
    }
    this.type = type;
    this.status = status;
    this.message = message;
  }
  static addEventListeners(){
    OneSignal.addEventListener('received', onReceived);
    OneSignal.addEventListener('registered', onRegistered);
    OneSignal.addEventListener('ids', onIds);
  }

  static removeEventListeners(){
    OneSignal.removeEventListener('received', onReceived);
    OneSignal.removeEventListener('registered', onRegistered);
    OneSignal.removeEventListener('ids', onIds);
  }

  static onSignal(signal){
    switch (signal.signalType) {
      case SIGNAL_TYPES.DATA_CHANNEL:
        EVENT.DATA_CHANNEL_SIGNAL.emit(signal);
        break;
      case SIGNAL_TYPES.INVITATION:
        EVENT.INVITATION_SIGNAL.emit(signal);
        break;
      case SIGNAL_TYPES.PEOPLE:
        EVENT.PEOPLE_SIGNAL.emit(signal);
        break;
      case SIGNAL_TYPES.FILE_META:
        EVENT.FILE_META_SIGNAL.emit(signal);
        break;
      case SIGNAL_TYPES.FILE_SEND_REQUEST:
        EVENT.FILE_SEND_REQUEST_SIGNAL.emit(signal);
        break;
      case SIGNAL_TYPES.TUNNEL_CHANNEL:
        EVENT.TUNNEL_CHANNEL_SIGNAL.emit(signal);
        break;
      default:
        throw 'unknown signalType error';
    }
  }

  static sendSignal(signal,receiver){
    if(signal===undefined || receiver===undefined){
      throw 'signal and receiver parameters are neccessary';
    }
    if(signal.type===undefined || signal.status===undefined || signal.message===undefined){
      throw 'signal object should include type, status and message keys'
    }
    if(receiver.connectionStatus===CONNECTION_STATUS.CONNECTED && receiver.connection!==undefined){
      //Send over data channel
      let message = {
        dataType : DATA_TYPES.SIGNAL,
        signalType : signal.type,
        signalStatus : signal.status,
        signalMessage : signal.message
      };
      receiver.connection.sendMessage(message);
    }else{
      if(receiver.onesignalID===undefined){
        throw 'onesignalID cannot be undefined.';
      }
      //Send over Push Notifications
      let data = {
        signalType : signal.type,
        signalStatus : signal.status,
        signalMessage : signal.message
      };
      let contents = {
        'en': 'SIGNAL'
      };
      OneSignal.postNotification(contents,data,receiver.onesignalID);
    }
  }
}
