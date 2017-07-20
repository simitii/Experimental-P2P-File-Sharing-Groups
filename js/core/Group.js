import People from './People.js';

export default class Group extends People{
  constructor(args) {
    super();
    let defaults = {
      users : []
    };
    Object.assign(this,defaults,args);
    if(this.users === defaults.users){
      throw 'A group should include at least one user';
    }
  }
  get users(){
    return this.users;
  }
  addUser(username,isAdmin=false){
    //ADMIN CONTROL
    if(username===undefined){
      throw 'username parameter is neccessary';
    }
    //Add to group object and Send to other members
  }
  deleteUser(username){
    //ADMIN CONTROL
    if(username===undefined){
      throw 'username parameter is neccessary';
    }
    //Delete from group object and Send to other members
  }
  get rootDirectoryFiles(){
    return super.rootDirectoryFiles;
  }
  addFolder(folderName){
    if(folderName===undefined){
      throw 'folderName parameter is neccessary';
    }
    //Add to group object and Send proxy for folder to other members
  }
  deleteFolder(folderName){
    //ADMIN CONTROL
    if(folderName===undefined){
      throw 'folderName parameter is neccessary';
    }
    //Delete from group object and Send to other members
  }
  set name(name){
    //ADMIN CONTROL
    if(name===undefined){
      throw 'name parameter is neccessary';
    }
    this._name = name;
    //Send to other members
  }
  get name(){
    return super.name;
  }

  set profilePicture(newPicture){
    //ADMIN CONTROL
    if(newPicture===undefined){
      throw 'newPicture parameter is neccessary';
    }
  }
  get profilePicture(){
    return super.profilePicture;
  }

  set profileDescription(description){
    //ADMIN CONTROL
    if(description===undefined){
      throw 'description parameter is neccessary';
    }
  }
  get profileDescription(){
    return super.profileDescription;
  }

}
