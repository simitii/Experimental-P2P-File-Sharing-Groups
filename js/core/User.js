//import {LocalDB} from './Database.js';
import {EXCEPTION} from './Constants.js';

const UserDefaults = {
      name : '',
      givenName : '',
      profilePicture : '',
      profileDescription : '',
      sharedFiles : [],
      onesignalID: undefined,
      connection: undefined,
      connectionStatus: undefined,
      connectionStatusListeners: [],
      isMe:false
};

class User{
  constructor(args){
    //super('User');
    Object.assign(this,UserDefaults,args);
  }
  
  static defaults(){
    return UserDefaults;
  }

  changeGivenName(givenName){
    this.givenName = givenName;
  }

  changeUsername(){
    EXCEPTION.WRONG_FUNCTION_CALL.throw('changeUsername','User');
  }
  changeProfilePicture(){
    EXCEPTION.WRONG_FUNCTION_CALL.throw('changeProfilePicture','User');
  }
  changeProfileDescription(){
    EXCEPTION.WRONG_FUNCTION_CALL.throw('changeProfileDescription','User');
  }

  sendInformMeWhenOnlineRequest(){
    //TODO IMPLEMENT
  }

  onConnectionStatusChange(newStatus){
    for(let callback of this.connectionStatusListeners){
      callback(this,newStatus);
    }
  }
  addConnectionStatusListener(callback){
    if(this.connectionStatusListeners.indexOf(callback)===-1)
      this.connectionStatusListeners.push(callback);
  }
  removeConnectionStatusLister(callback){
    let index = this.connectionStatusListeners.indexOf(callback);
    if(index !== -1){
      this.connectionStatusListeners.splice(index,1);
    }
  }
}

class Me extends User{
  constructor(args){
    args.isMe = true;
    super(args);
  }

  changeUsername(username){
    this.name = username;
    //Send new to others
  }
  changeProfilePicture(profilePicture){
    this.profilePicture = profilePicture;
    //Send new to others
  }
  changeProfileDescription(profileDescription){
    this.profileDescription = profileDescription;
    //Send new to others
  }

  sendInformMeWhenOnlineRequest(){
    EXCEPTION.WRONG_FUNCTION_CALL.throw('sendInformMeWhenOnlineRequest','Me');
  }
  onConnectionStatusChange(){
    EXCEPTION.WRONG_FUNCTION_CALL.throw('onConnectionStatusChange','Me');
  }
  addConnectionStatusListener(){
    EXCEPTION.WRONG_FUNCTION_CALL.throw('addConnectionStatusListener','Me');
  }
  removeConnectionStatusLister(){
    EXCEPTION.WRONG_FUNCTION_CALL.throw('removeConnectionStatusLister','Me');
  }
}

export {User,Me};
