import * as DB from './Database.js';

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

const GroupDefaults = {
  id: '',
  name : '',
  profilePicture : '',
  profileDescription : '',
  sharedFiles : [],
  users : []
}

export default class Group{
  constructor(args) {
    this.id = args.id || GroupDefaults.id;
    this.name = args.name || GroupDefaults.name;
    this.profilePicture = args.profilePicture || GroupDefaults.profilePicture;
    this.profileDescription = args.profileDescription ||
                                GroupDefaults.profileDescription;
    this.sharedFiles = args.sharedFiles || GroupDefaults.sharedFiles;
    this.users = args.users || GroupDefaults.users;
    if(this.id === GroupDefaults.id){
      DB.createObject(GroupSchema.name,{
        name:this.name,
        profilePicture: this.profilePicture,
        profileDescription: this.profileDescription,
        sharedFiles: this.sharedFiles,
        users: this.users,
        admins: this.admins
      });
    }
  }

  addUser(newUser,isAdmin=false){
    if(newUser===undefined){
      throw 'newUser parameter is neccessary';
    }
    const index = this.users.indexOf(user);
    if(index !== -1){
      throw 'User is already in this.users array!';
    }
    //update users
    this.users.push(newUser);
    const update = new Map();
    update.set('users',newUser.id);
    DB.pushToListInObjectWithID(GroupSchema.name,this.id,update);
    //TODO Send to other members
  }
  deleteUser(user){
    if(user===undefined){
      throw 'user parameter is neccessary';
    }
    const index = this.users.indexOf(user);
    if(index === -1){
      throw 'User is not in this.users array!';
    }
    //update users
    this.users.splice(index,1);
    const update = new Map();
    update.set('users',newUser.id);
    DB.deleteFromListInObjectWithID(GroupSchema.name,this.id,update);
    //TODO Send to other members
  }

  sharedFile(file){
    if(file===undefined){
      throw 'file parameter is neccessary';
    }
    const index = this.sharedFiles.indexOf(file);
    if(index !== -1){
      throw 'file is already in this.sharedFiles array!';
    }
    //update sharedFiles
    this.sharedFiles.push(file);
    const update = new Map();
    update.set('sharedFiles',file.id);
    DB.pushToListInObjectWithID(GroupSchema.name,this.id,update);
    //TODO Send to other members
  }
  unShareFile(file){
    if(file===undefined){
      throw 'file parameter is neccessary';
    }
    const index = this.sharedFiles.indexOf(file);
    if(index === -1){
      throw 'file is not in this.sharedFiles array!';
    }
    //update sharedFiles
    this.sharedFiles.splice(index,1);
    const update = new Map();
    update.set('sharedFiles',file.id);
    DB.deleteFromListInObjectWithID(GroupSchema.name,this.id,update);
    //TODO Send to other members
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

  sendToUsers(message){

  }
}
