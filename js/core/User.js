import {EXCEPTION} from './Constants.js';
import * as DB from './Database.js';
import ObjectMemory from './ObjectMemory.js';

// DB CONFIGURATIONS
const UserSchema = {
  name: 'User',
  primaryKey: 'id',
  properties: {
    id: {type:'string'},
    name: {type:'string',default:''},
    givenName: {type:'string',default:''},
    profilePicture: {type:'string',default:''},
    profileDescription: {type:'string',default:''},
    sharedFiles: {type:'list',objectType: DB.StringSchema.name},
    devices: {type:'list',objectType: DB.StringSchema.name},
    notificationDevices: {type:'list',objectType: DB.StringSchema.name},
    isMe: {type:'bool',default:false}
  }
};
DB.registerSchema(UserSchema);
// end of DB CONFIGURATIONS

const UserDefaults = {
      id: '',
      name : '',
      givenName : '',
      profilePicture : '',
      profileDescription : '',
      sharedFiles : [],
      devices: [],
      notificationDevices: [],
      isMe:false
};

class User{
  constructor(args){
    if(args.isMe && User.me !== undefined){
      throw "You can't have more than one Me instance";
    }
    this.id = args.id || UserDefaults.id;
    this.name = args.name || UserDefaults.name;
    this.givenName = args.givenName || UserDefaults.givenName;
    this.profilePicture = args.profilePicture || UserDefaults.profilePicture;
    this.sharedFiles = args.sharedFiles || UserDefaults.sharedFiles;
    this.devices = args.devices || UserDefaults.devices;
    this.notificationDevices = args.notificationDevices ||
                                  UserDefaults.notificationDevices;
    this.isMe = args.isMe || UserDefaults.isMe;
    if(this.isMe){
      User.me = this;
    }
    if(this.id === UserDefaults.id){
      DB.createObject(UserSchema.name, {
        id:'DENMEE',//TODO implement unique id mechanism
        name: this.name,
        givenName: this.givenName,
        profilePicture: this.profilePicture,
        profileDescription: this.profileDescription,
        sharedFiles: this.sharedFiles,
        devices: this.devices,
        notificationDevices: this.notificationDevices,
        isMe: this.isMe
      },(id) => {
        this.id = id;
      });
    }

    //Add to ObjectMemory
    ObjectMemory.addObject(this.constructor.name,this);
  }

  static defaults(){
    return UserDefaults;
  }
  static getMe(){
    return User.me;
  }
  changeGivenName(givenName){
    this.givenName = givenName;
    //Save Change to DB
    const update = new Map();
    update.set('givenName',this.givenName);
    DB.updateObjectWithID(UserSchema.name,this.id,update);
  }

  changeName(name){
    if(this.isMe){
      EXCEPTION.WRONG_FUNCTION_CALL.throw('changeName','User');
    }
    this.name = name;
    //Save Change to DB
    const update = new Map();
    update.set('name',this.name);
    DB.updateObjectWithID(UserSchema.name,this.id,update);
    //Send new to others
  }
  changeProfilePicture(){
    if(this.isMe){
      EXCEPTION.WRONG_FUNCTION_CALL.throw('changeProfilePicture','User');
    }
    this.profilePicture = profilePicture;
    //Save Change to DB
    const update = new Map();
    update.set('profilePicture',this.profilePicture);
    DB.updateObjectWithID(UserSchema.name,this.id,update);
    //Send new to others
  }
  changeProfileDescription(){
    if(this.isMe){
      EXCEPTION.WRONG_FUNCTION_CALL.throw('changeProfileDescription','User');
    }
    this.profileDescription = profileDescription;
    //Save Change to DB
    const update = new Map();
    update.set('profileDescription',this.profileDescription);
    DB.updateObjectWithID(UserSchema.name,this.id,update);
    //Send new to others
  }
  addNewDevice(device){
    if(device===undefined){
      EXCEPTION.NECESSARY_PARAMS.throw('User.addNewDevice');
    }
    const index = this.devices.indexOf(device);
    if(index !== -1){
      throw 'device is already in this.devices array';
    }
    this.devices.push(device);
    //Save Change to DB
    const update = new Map();
    update.set('devices',device.id);
    DB.pushToListInObjectWithID(UserSchema.name,this.id,update);
  }
  sendNotification(notification){
    //Sends notificationDevices a notification
    //TODO IMPLEMENT
  }
}

//ObjectMemory CONFIGURATION
ObjectMemory.registerClass(User.name);

export {User};
