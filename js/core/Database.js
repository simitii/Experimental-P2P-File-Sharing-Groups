import {EVENT} from 'Constants';
import User from 'User';
import Group from 'Group';
import File from 'File';

const Realm = require('realm');

const FileSchema = {
  name: 'File',
  properties: {
    name:  {type:'string',default:''},
    description: {type:'string',default:''},
    dataUri: {type:'string',default:''}
    createdBy: {type:'User',default:undefined},
    pictureToShow: {type:'string',default:''},
    usersWhoHasIt: {type:'list', objectType:'User'},
    localFile: {type:'bool',default:false},
    sentDownloadRequest: {type:'bool',default:false},
    isFolder: {type:'bool',default:false}
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

  //Retrieve files which are in the download list
  let filesRealm = realm.objects('File').filtered('localFile = true OR sendDownloadRequest = true');
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
  
}

function onPeopleSignal(signal){

}

export {onAppStart,onAppStop,onFileMetaSignal,onPeopleSignal}
