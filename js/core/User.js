import People from './People.js';
import {EXCEPTION} from './Constants.js';

class User extends People{
  constructor(args){
    super('User');
    let defaults = {
      onesignalID: undefined,
      connection: undefined,
      connectionStatus: undefined,
      connectionStatusListeners: [],
      isMe:false
    };
    Object.assign(this,defaults,args);
  }

  set name(name){
    if(name===undefined){
      throw 'name parameter is neccessary';
    }
    super.name = name;
  }
  get name(){
    return super.name;
  }

  set givenName(givenName){
    changeGivenName(givenName);
  }
  get givenName(){
    return super.givenName;
  }
  changeGivenName(givenName){
    if(givenName===undefined){
      throw 'givenName parameter is neccessary';
    }
    super.givenName = givenName;
  }

  set profilePicture(newPicture){
    if(newPicture===undefined){
      throw 'newPicture parameter is neccessary';
    }

    super.profilePicture = newPicture;
  }
  get profilePicture(){
    return super.profilePicture;
  }

  set profileDescription(description){
    if(description===undefined){
      throw 'description parameter is neccessary';
    }

    super.profileDescription = description;
  }
  get profileDescription(){
    return super.profileDescription;
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
