//import {LocalDB} from './Database.js';
import {DOWNLOAD_STATUS,EXCEPTION,DEFINE_CONST_PROPERTY,DEFINE_ENUM_PROPERTY} from './Constants.js';

let CryptoJS = require("crypto-js");
let RNFS = require('react-native-fs');

const APP_TEMP_FOLDER = RNFS.DocumentDirectoryPath + '/tmp/';

const FileFolderPrototypeDefaults = {
  name : '',
  description: '',
  downloadedSize: 0.0, //in bytes
  pictureToShow: '',
  localPath: '',
  peers: [],
  downloadStatus: DOWNLOAD_STATUS.NOT_ORDERED
};

class FileFolderPrototype{
  constructor(classType,extraDefaults,metaData){
    //super(type);

    Object.assign(this,FileFolderPrototypeDefaults,extraDefaults,metaData);

    DEFINE_CONST_PROPERTY(this,'hashCode',metaData.hashCode,classType);
    DEFINE_CONST_PROPERTY(this,'createdBy',metaData.createdBy,classType);
    DEFINE_CONST_PROPERTY(this,'totalSize',metaData.totalSize,classType);  //in bytes
    DEFINE_CONST_PROPERTY(this,'peers',metaData.peers || FileFolderPrototypeDefaults.peers,classType);

    DEFINE_ENUM_PROPERTY(this,'downloadStatus',DOWNLOAD_STATUS.NOT_ORDERED,DOWNLOAD_STATUS);
  }
  static defaults(){
    return FileFolderPrototypeDefaults;
  }
}

const FileDefaults = {
  extention: '',
  nChunks: 1, // number of chunks
  chunkSize: 256*1024,  // chunk size
  chunks: []
};

class File extends FileFolderPrototype{
  constructor(metaData) {
    if(metaData===undefined){
      throw 'metaData parameter is neccessary';
    }
    super('File',FileDefaults,metaData);  //FileFolderPrototype also includes defaults
    DEFINE_CONST_PROPERTY(this,'chunks',metaData.chunks || FileDefaults.chunks,'File');
  }

  static defaults(){
    return Object.assign({},super.defaults(),FileDefaults);
  }

  readData(size,position){
    if(this.localPath===undefined || this.localPath.length===0){
      throw 'file not found EXCEPTION';
    }
    return File._readData(this.localPath,size,position);
  }
  writeTempData(chunkIndex,data,position){
    const tempPath = this.getTempPath();
    const chunkFilePath = this.getChunkFilePath(chunkIndex);
    return RNFS.mkdir(APP_TEMP_FOLDER)
      .then(() => RNFS.mkdir(tempPath))
      .then(() => File._writeData(chunkFilePath,data,position))
      .catch((e) => console.log("FILE WRITING EXCEPTION:", e));
  }
  checkChunkFileHash(chunkIndex,hashCode){
    const chunkFilePath = this.getChunkFilePath(chunkIndex);
    return new Promise((resolve,reject) => {
      RNFS.readFile(chunkFilePath,'base64')
        .then((data) => File.hashForData(data))
        .then((hash) => resolve(hashCode===hash))
        .catch((e) => reject(e));
    });
  }
  getFileHash(){
    return new Promise((resolve,reject) => {
      RNFS.hash(this.localPath,'sha256')
        .then((hash) => {
          resolve(hash);
        })
        .catch((e) => reject(e));
    });
  }
  findMissingChunks(){
    const nChunks = this.chunks.length;
    return new Promise((resolve,reject) => {
      let missingChunks = [];
      let checkNextChunk = (chunkIndex) => {
        if(chunkIndex>=nChunks){
          resolve(missingChunks);
        }else{
          const chunkFilePath = this.getChunkFilePath(chunkIndex);
          RNFS.exists(chunkFilePath)
            .then((exists) => {
              if(!exists){
                missingChunks.push(chunkIndex)
              }
              checkNextChunk(chunkIndex+1);
            })
            .catch((e) => reject(e));
        }
      };
      checkNextChunk(0);
    });
  }
  getTempPath(){
    return APP_TEMP_FOLDER + this.hashCode + '/';
  }
  getChunkFilePath(chunkIndex){
    return this.getTempPath() + chunkIndex + '.tmp';
  }
  mergeChunkFiles(){
    const nChunks = this.chunks.length;
    const localPath = this.createLocalPath();
    return new Promise((resolve,reject) => {
      let writeNextChunk = (chunkIndex) => {
        if(chunkIndex>=nChunks){
          resolve();
        }else{
          const chunkFilePath = this.getChunkFilePath(chunkIndex);
          RNFS.readFile(chunkFilePath,'base64')
            .then((data) => this.writeData(data,chunkIndex))
            .then(() => writeNextChunk(chunkIndex+1))
            .catch((e) => reject(e));
        }
      };
      writeNextChunk(0);
    });
  }
  writeData(data,chunkIndex){
    const position = chunkIndex * this.chunkSize;
    return File._writeData(this.localPath,data,position);
  }
  createLocalPath(){
    if(this.localPath===undefined || this.localPath===''){
      this.localPath = RNFS.DocumentDirectoryPath + '/DownloadedFiles/' + this.name;
    }
    return this.localPath;
  }

  //STATIC METHODS
  static addNewFile(filepath,createdBy){
    if(filepath===undefined){
        EXCEPTION.INVALID_VALUE.throw('undefined','FilePath');
    }
    return new Promise((resolve,reject) => {
      let metaData = {};
      RNFS.exists(filepath)  //Checking existence of the file
        .then((exists) => {
          if(!exists){
            EXCEPTION.FILE_NOT_FOUND.throw(filepath);
          }
          console.log("OK1");
          return RNFS.stat(filepath);  //Reading file metaData
        })
        .then((_metaData) => {
          if(_metaData.isDirectory()){
            EXCEPTION.NOT_A_FILE.throw('Folder/Directory');
          }
          console.log("OK2");
          //Store metaData for future usage
          metaData.name = filepath.split('\\').pop().split('/').pop();
          metaData.extention = metaData.name.split('.').pop();
          metaData.localPath = filepath;
          metaData.totalSize = _metaData.size;
          metaData.createdBy = createdBy;
          return RNFS.hash(filepath,'sha256'); //Create HashCode of the file
        })
        .then((hashCode) => {
          console.log("OK3");
          metaData.hashCode = hashCode;
          //Create Chunks(hashes)
          return File._createChunks(filepath,metaData.totalSize);
        })
        .then((chunkData) => {
          console.log("OK4");
          metaData.chunks = chunkData.chunks;
          metaData.nChunks = chunkData.nChunks;
          metaData.chunkSize = chunkData.chunkSize;
          //Create file with metaData
          let file = new File(metaData);
          resolve(file);  //resolve promise with new file object
        })
        .catch((e) => reject(e));
    });
  }

  //Promise<string> string => BASE64(binary data)
  static _readData(filepath,size,position){
    return RNFS.read(filepath,size,position,'base64');
  }

  static _writeData(filepath,data,position){
    return RNFS.write(filepath,data,position,'base64');
  }

  //Promise<{nChunks:int, chunkSize:int, chunks:string[]}> string[] => chunk hash array
  static _createChunks(filepath,size){
    let chunkSize = Math.ceil((size/4096>64*1024)?(size/4096):64*1024);
    let nChunks = Math.ceil(size/chunkSize);
    return new Promise((resolve,reject) => {
      let chunks = [];
      let nextChunk = (chunkIndex) => {
        if(chunkIndex>=nChunks){
          resolve({nChunks,chunkSize,chunks});
        }else{
          //Read the chunk
          File._readData(filepath,chunkSize,chunkIndex*chunkSize)
            .then((data) => File.hashForData(data))
            .then((hashCode) => {
              chunks.push(hashCode);
              nextChunk(chunkIndex+1);
            })
            .catch((e) =>{
              throw e;
            });
        }
      };
      nextChunk(0);
    });
  }

  //Returns hash for given data
  static hashForData(data){
    const hash = CryptoJS.SHA256(data) //Create HashCode
    // WordArray => String (Hex)
    return hash.toString(CryptoJS.enc.Hex);
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
