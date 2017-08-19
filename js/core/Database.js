import {EVENT,EXCEPTION,DOWNLOAD_STATUS} from './Constants.js';
import {User} from './User.js';
import {Group} from './Group.js';
import {File} from './File.js';

const Realm = require('realm');

const ChunkSchema = {
  name: 'Chunk',
  properties: {
    file: {type: 'File'},
    id: {type: 'int'},
    hashcode: {type: 'string'}
  }
};

const FileSchema = {
  name: 'File',
  properties: {
    hashCode: {type: 'string'},
    name:  {type:'string',default:''},
    description: {type:'string',default:''},
    createdBy: {type:'User',default:undefined},
    extention: {type:'string'},
    nChunks: {type:'int'},
    chunkSize: {type:'int'},
    chunks: {type:'list',objectType:'string'},
    pictureToShow: {type:'string',default:''},
    totalSize: {type:'float'},
    peers: {type:'list', objectType:'User'},
    downloadedSize: {type:'float', default:0.0},
    downloadStatus: {type:'string',default:DOWNLOAD_STATUS.NOT_ORDERED},
    localPath: {type:'string',default:''}
  }
};
const UserSchema = {
  name: 'User',
  properties: {
    name: {type:'string',default:''},
    profilePicture: {type:'string',default:''},
    profileDescription: {type:'string',default:''},
    rootDirectoryFiles: {type:'list',objectType:'File'},
    onesignalID:  {type: 'string', default:''},
    connectionStatus: {type: 'string', default:''}, //Maybe neccessary for FIREWALL SITUATION
    isMe: {type:'bool',default:false}
  }
};

const DeviceSchema = {
  name: 'Device',
  properties: {
    name: {type:'string',default:''},
    profilePicture: {type:'string',default:''},
    profileDescription: {type:'string',default:''},
    onesignalID:  {type: 'string', default:''},
    connectionStatus: {type: 'string', default:''}, //Maybe neccessary for FIREWALL SITUATION
    isMe: {type:'bool',default:false}
  }
};

const GroupSchema = {
  name:'Group',
  properties: {
    name: {type:'string', default:''},
    profilePicture: {type:'string',default:''},
    profileDescription: {type:'string',default:''},
    users: {type:'list',objectType:'User'},
    rootDirectoryFiles: {type:'list',objectType:'File'},
    //ADMIN??????
  }
};

let realm = new Realm({schema: [FileSchema, UserSchema,GroupSchema]});

//MAIN VARIABLES
let connectionsManager = undefined;
let files = [];
let users = [];
let groups = [];
let me = undefined;

function onAppStart(){
  //Retrieve all of the users and groups
  let meRealm = realm.objects('User').filtered('isMe = true');
  let usersRealm = realm.objects('User').filtered('isMe = false');
  let groupsRealm = realm.objects('Group');
  for(let user of usersRealm){
    users.push(new User(user));
  }
  for(let group of groupsRealm){
    groups.push(new Group(group));
  }

  //Retrieve files all files
  let filesRealm = realm.objects('File');
  for(let file of filesRealm){
    files.push(new File(file));
  }

  if(meRealm!==undefined){
    me = new User(meRealm);
  }else{
    EVENT.SIGNAL_IDS.addListener((ids) => {
      //create user for me
      me = new User(/*TODO*/);
      EVENT.CHANGE_ON_ME.emit(me);
    });
  }
  connectionsManager = new ConnectionsManager(me);

}

function onAppStop(){
  //Save the last state about all of the currently open files/groups/users
}

function onFileMetaSignal(signal){
    //find related file and call saveToLocalDB function
}

function onPeopleSignal(signal){
    //find related people object and call saveToLocalDB function
}

class LocalDB{
  constructor(objectType){
    switch (objectType) {
      case 'File':
      case 'User':
      case 'Group':
        this.objectType = objectType;
        break;
      default:
        EXCEPTION.UNKNOWN_OBJECT_TYPE.throw(objectType,'LocalDB');
    }
  }
  save(){
    switch (this.objectType) {
      case 'File':
          //FILE SAVING
        break;
      case 'User':
          //USER SAVING
        break;
      case 'Group':
          //GROUP SAVING
      default:
          EXCEPTION.UNKNOWN_OBJECT_TYPE.throw(objectType,'LocalDB');
    }
  }
  findAndUpdate(){
    //Finds with hashCode and updates
  }
  delete(){
    switch (this.objectType) {
      case 'File':
          //FILE DELETING
        break;
      case 'User':
          //USER DELETING
        break;
      case 'Group':
          //GROUP DELETING
      default:
          EXCEPTION.UNKNOWN_OBJECT_TYPE.throw(objectType,'LocalDB');
    }
  }
}

export {onAppStart,onAppStop,onFileMetaSignal,onPeopleSignal,LocalDB}
