//import {LocalDB} from './Database.js';
import {EXCEPTION} from './Constants.js';

const UserDefaults = {
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
}

export {User,Me};
