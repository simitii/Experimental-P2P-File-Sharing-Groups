//import {LocalDB} from './Database.js';
import {DOWNLOAD_STATUS,EXCEPTION,DEFINE_CONST_PROPERTY,DEFINE_ENUM_PROPERTY} from './Constants.js';

class FileFolderPrototype{
  constructor(classType,extraDefaults,metaData){
    //super(type);
    let defaults = {
      name : '',
      description: '',
      downloadedSize: 0.0, //in megabytes
      pictureToShow: '',
      localPath: '',
      peers: []
    };
    Object.assign(this,defaults,extraDefaults,metaData);

    DEFINE_CONST_PROPERTY(this,'hashCode',metaData.hashCode,classType);
    DEFINE_CONST_PROPERTY(this,'createdBy',metaData.createdBy,classType);
    DEFINE_CONST_PROPERTY(this,'totalSize',metaData.totalSize,classType);  //in megabytes
    DEFINE_CONST_PROPERTY(this,'peers',metaData.peers || defaults.peers,classType);

    DEFINE_ENUM_PROPERTY(this,'downloadStatus',DOWNLOAD_STATUS.NOT_ORDERED,DOWNLOAD_STATUS);
  }
}

class File extends FileFolderPrototype{
  constructor(metaData) {
    if(metaData===undefined){
      throw 'metaData parameter is neccessary';
    }
    let defaults = {
      extention: '',
      chunks: []
    }
    super('File',defaults,metaData);  //FileFolderPrototype also includes defaults
    DEFINE_CONST_PROPERTY(this,'chunks',metaData.chunks || defaults.chunks,'File');
  }
  _checkIfFileExist(){
    //Check it
  }
  sendLastChanceToDownloadNotification(){
    //Send it
  }
}

class Folder extends FileFolderPrototype{
  constructor(metaData) {
    if(metaData===undefined){
      throw 'metaData parameter is neccessary';
    }
    let defaults = {
      pictureToShow : 'Folder',
      files: []
    };
    super('Folder',defaults,metaData);

    DEFINE_CONST_PROPERTY(this,'files',metaData.files || defaults.files,'Folder');
  }
}

export {File,Folder};
