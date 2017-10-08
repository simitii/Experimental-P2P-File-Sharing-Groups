import {EXCEPTION,CONNECTION_STATUS} from './Constants.js';
import * as DB from './Database.js';
import ProtocolFactory from './ProtocolFactory.js';
import ObjectMemory from './ObjectMemory.js';

// DB CONFIGURATIONS
const DeviceSchema = {
  name: 'Device',
  primaryKey: 'id',
  properties: {
    id: {type:'string'},
    name: {type:'string',default:''},
    description: {type:'string',default:''},
    signalIDs:  {type: 'list', objectType: DB.StringSchema.name},
    lastestSuppportedProtocol: {type:'string',default:''},
    connectionStatus: {type: 'string', default:''},
    owner: {type: 'string', default:''},
    isThisDevice: {type:'bool',default:false},
  }
};
DB.registerSchema(DeviceSchema);
// end of DB CONFIGURATIONS

const DeviceDefaults = {
      id: '',
      name : '',
      description : '',
      signalIDs: [],
      lastestSuppportedProtocol: '',
      protocol: undefined,
      connectionStatus: CONNECTION_STATUS.DISCONNECTED,
      connectionStatusListeners: [],
      informMeWhenOnlineListeners: [],
      owner:undefined,
      isThisDevice: false,
};

class Device {
  constructor(args){
    if(args.isThisDevice && Device.thisDevice !== undefined){
        throw "You can't have more than one ThisDevice instance";
    }
    this.id = args.id || DeviceDefaults.id;
    this.name = args.name || DeviceDefaults.name;
    this.description = args.description ||
                                DeviceDefaults.description;
    this.signalIDs = args.signalIDs || DeviceDefaults.signalIDs;
    this.lastestSuppportedProtocol = args.lastestSuppportedProtocol ||
                                DeviceDefaults.lastestSuppportedProtocol;
    this.protocol = DeviceDefaults.protocol;
    this.connectionStatus = args.connectionStatus || DeviceDefaults.connectionStatus;
    //TODO FIX (PREVIOUS LINE)
    this.connectionStatusListeners = DeviceDefaults.connectionStatusListeners;
    this.owner = args.owner || DeviceDefaults.owner;
    this.isThisDevice = args.isThisDevice || DeviceDefaults.isThisDevice;
    if(this.isThisDevice){
      Device.thisDevice = this;
    }
    if(this.id === DeviceDefaults.id){
      DB.createObject(DeviceSchema.name, {
        name: this.name,
        description: this.description,
        signalIDs: this.signalIDs,
        lastestSuppportedProtocol: this.lastestSuppportedProtocol,
        connectionStatus: this.connectionStatus,
        owner: this.owner.id,
        isThisDevice: this.isThisDevice
      },(id) => {
        this.id = id;
      });
    }
    this.protocol = ProtocolFactory.factoryWithProtocolCode(this,
                              this.lastestSuppportedProtocol);
    //Add object to ObjectMemory
    ObjectMemory.addObject(this.constructor.name, this);
  }
  static defaults(){
    return DeviceDefaults;
  }
  static getThisDevice(){
    return Device.thisDevice;
  }
  changeName(name){
    if(!this.isMyDevice()){
      EXCEPTION.WRONG_FUNCTION_CALL.throw('changeName','Device');
    }
    this.name = name;

    //Save Change to DB
    const update = new Map();
    update.set('name',this.name);
    DB.updateObjectWithID(DeviceSchema.name,this.id,update);
  }
  changeDescription(desc){
      if(!this.isMyDevice()){
        EXCEPTION.WRONG_FUNCTION_CALL.throw('changeDescription','Device');
      }
      this.description = description;

      //Save Change to DB
      const update = new Map();
      update.set('description',this.description);
      DB.updateObjectWithID(DeviceSchema.name,this.id,update);
  }
  isMyDevice(){
    return this.owner!==undefined && this.owner.isMe;
  }

  gotOnline(){

  }

  addInformMeWhenOnlineListener(callback){
    if(this.isThisDevice){
      EXCEPTION.WRONG_FUNCTION_CALL.throw('informMeWhenOnline','ThisDevice');
    }
    //TODO IMPLEMENT
  }
  removeInformMeWhenOnlineListener(callback){
    if(this.isThisDevice){
      EXCEPTION.WRONG_FUNCTION_CALL.throw('informMeWhenOnline','ThisDevice');
    }
    //TODO IMPLEMENT
  }

  onConnectionStatusChange(newStatus){
    if(this.isThisDevice){
      EXCEPTION.WRONG_FUNCTION_CALL.throw('onConnectionStatusChange','ThisDevice');
    }
    if(this.newStatus !== this.connectionStatus){
      this.connectionStatus = newStatus;

      //Save Change to DB
      const update = new Map();
      update.set('connectionStatus',this.connectionStatus);
      DB.updateObjectWithID(DeviceSchema.name,this.id,update);

      for(let callback of this.connectionStatusListeners){
        callback(this,newStatus);
      }
    }
  }
  addConnectionStatusListener(callback){
    if(this.isThisDevice){
      EXCEPTION.WRONG_FUNCTION_CALL.throw('addConnectionStatusListener','ThisDevice');
    }
    if(this.connectionStatusListeners.indexOf(callback)===-1)
      this.connectionStatusListeners.push(callback);
  }
  removeConnectionStatusLister(callback){
    if(this.isThisDevice){
      EXCEPTION.WRONG_FUNCTION_CALL.throw('removeConnectionStatusLister','ThisDevice');
    }
    let index = this.connectionStatusListeners.indexOf(callback);
    if(index !== -1){
      this.connectionStatusListeners.splice(index,1);
    }
  }
}

//ObjectMemory CONFIGURATION
ObjectMemory.registerClass(Device.name);

export {Device};
