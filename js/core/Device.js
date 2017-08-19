import {EXCEPTION} from './Constants.js';

const DeviceDefaults = {
      name : '',
      profileDescription : '',
      onesignalID: undefined,
      activeProtocol: undefined,
      connection: undefined,
      connectionStatus: undefined,
      connectionStatusListeners: [],
      owner:undefined,
      isThisDevice: false,
};

class Device {
  constructor(args){
    Object.assign(this,DeviceDefaults,args);
  }
  static defaults(){
    return DeviceDefaults;
  }
  changeName(name){
    if(!this.isMyDevice()){
      EXCEPTION.WRONG_FUNCTION_CALL.throw('changeName','Device');
    }
    this.name = name;
  }
  changeProfileDescription(description){
      if(!this.isMyDevice()){
        EXCEPTION.WRONG_FUNCTION_CALL.throw('changeProfileDescription','Device');
      }
      this.description = description;
  }
  isMyDevice(){
    return this.owner!==undefined && this.owner.isMe;
  }

  sendInformMeWhenOnlineRequest(){
    if(this.isThisDevice){
      EXCEPTION.WRONG_FUNCTION_CALL.throw('sendInformMeWhenOnlineRequest','Device');
    }
    //TODO IMPLEMENT
  }

  onConnectionStatusChange(newStatus){
    if(this.isThisDevice){
      EXCEPTION.WRONG_FUNCTION_CALL.throw('onConnectionStatusChange','Device');
    }
    for(let callback of this.connectionStatusListeners){
      callback(this,newStatus);
    }
  }
  addConnectionStatusListener(callback){
    if(this.isThisDevice){
      EXCEPTION.WRONG_FUNCTION_CALL.throw('addConnectionStatusListener','Device');
    }
    if(this.connectionStatusListeners.indexOf(callback)===-1)
      this.connectionStatusListeners.push(callback);
  }
  removeConnectionStatusLister(callback){
    if(this.isThisDevice){
      EXCEPTION.WRONG_FUNCTION_CALL.throw('removeConnectionStatusLister','Device');
    }
    let index = this.connectionStatusListeners.indexOf(callback);
    if(index !== -1){
      this.connectionStatusListeners.splice(index,1);
    }
  }
}

export {Device};
