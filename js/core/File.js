
class File {
  constructor(metaData) {
    if(metaData===undefined){
      throw 'metaData parameter is neccessary';
    }
    let defaults = {
      name : '',
      description: '',
      createdBy: undefined,
      pictureToShow: undefined,
      usersWhoHasIt: [],
      downloadStatus: 0.0,
      localFile: false,
      dataUri: '',
      sentDownloadRequest: false,
      isFolder:false
    };
    Object.assign(this,defaults,metaData);
    if(this.usersWhoHasIt === defaults.usersWhoHasIt){
      throw 'At least one user should have the file';
    }
  }
  _checkIfFileExist(){
    //Check it
  }
  get name(){
    return this.name;
  }
  get pictureToShow(){
    return this.pictureToShow;
  }
  get downloadStatus(){
    return this.downloadStatus;
  }
  isDownloadRequestSent(){
    return this.sentDownloadRequest;
  }
  get usersWhoHasIt(){
    return this.usersWhoHasIt;
  }
  get createdBy(){
    return this.createdBy;
  }
  set name(name){
    if(name===undefined){
      throw 'name parameter is neccessary';
    }
    this.name = name;
    //Send new name to others
  }
  set description(description){
    if(description===undefined){
      throw 'description parameter is neccessary';
    }
    this.description = description;
    //Send new description to others
  }
  sendDownloadRequest(){
    //Send download request to others
  }
  _createPieces(){

  }
  _createHash(data){

  }
  _checkHash(data,hashcode){

  }
  _sendLastChanceToDownloadNotification(){
    //Send it
  }
}

class Folder extends File{
  constructor(metaData,dataUri='') {
    if(metaData===undefined){
      throw 'metaData parameter is neccessary';
    }
    metaData.isFolder = true;
    metaData.pictureToShow = 'Folder';
    super(metaData,dataUri);
  }
}

export {File,Folder};
