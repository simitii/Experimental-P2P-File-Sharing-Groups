import {EVENT,CONNECTION_STATUS,DATA_TYPES} from './Constants.js';
//import Signal from './Signal.js';

const PIECE_SIZE = 16*1024; //bytes

//Breaks a big chunk into subchunks and downloads them
//So monitors and controls the downloading process of a chunk
class Mission {
  constructor(file,chunkIndex,peer,onMissionFinished,onMissionCanceled,nextPiece = 0){
    this.file = file;
    this.peer = peer;
    this.chunkIndex = chunkIndex;
    this.firstPosition = this.file.chunkSize*this.chunkIndex;
    this.chunkHash = file.chunks[chunkIndex];
    if(chunkIndex === file.nChunks-1){
      this.chunkSize = file.totalSize - file.chunkSize*chunkIndex;
    }else{
      this.chunkSize = file.chunkSize;
    }
    this.writingNow = false;
    this.afterWriting = undefined;
    this.nextPiece = nextPiece;
    this.nPiece = Math.ceil(this.chunkSize / PIECE_SIZE);
    this.onMissionFinished = onMissionFinished;
    this.downloadNextPiece();
  }
  downloadNextPiece(){
    console.log('chunkSize: ', this.chunkSize,'nextPiece: ', this.nextPiece, 'nPiece: ', this.nPiece);
    if(this.nextPiece>=this.nPiece){
      //Mission done!
      //Checking the correctness of the Mission
      if(this.writingNow===false){
        //Writing Completed. We check right now!
        this._checkChunk();
      }else{
        //Writing is in progress. We will check after it is done.
        this.afterWriting = this._checkChunk;
      }
    }else{
      if(this.peer.connectionStatus!==CONNECTION_STATUS.CONNECTED || this.peer.connection===undefined){
        throw '_requestPiece function cannot be called with disconnected peer';
      }
      let message = {
        INFO:{
          DATA_TYPE: DATA_TYPES.DATA_PIECE_REQUEST,
          file: this.file.hashCode,
          position: this.positionForNextPiece(),
          size: this.sizeForNextPiece(),
          chunkIndex: this.chunkIndex
        }
      };
      this.peer.connection.sendMessage(message);
    }
  }
  _checkChunk(){
    this.file.checkChunkFileHash(this.chunkIndex,this.chunkHash)
      .then((isCorrect) => {
        console.log('isCorrect: ',isCorrect);
        if(isCorrect){
          this.onMissionFinished(this.peer,this.chunkIndex);
        }else{
          this.onMissionCanceled(this.peer,this.chunkIndex);
        }
      });
  }
  onData(message){
    if(message.INFO.file!==this.file.hashCode){
      throw 'FileDownloader: wrong file EXCEPTION!';
    }
    if(message.INFO.position!==this.positionForNextPiece()
        || message.INFO.size!==this.sizeForNextPiece()){
      throw 'FileDownloader: wrong position or size!';
    }
    this.writingNow = true;
    this.file.writeTempData(this.chunkIndex,message.DATA,this.positionForNextPiece(true))
      .then(() => {
        this.writingNow = false;
        this.afterWriting();
      })
      .catch((e) => console.log('Temp File Writing Exception: ',e));
    //We use this kind of strategy(not waiting for data to be written)
    //in order to increase speed of download!

    this.nextPiece = this.nextPiece + 1;
    this.downloadNextPiece();
  }
  positionForNextPiece(relative){
    const relativePosition = PIECE_SIZE*this.nextPiece;
    if(relative){
      return relativePosition;
    }
    return this.firstPosition + relativePosition;
  }
  sizeForNextPiece(){
    return this.nextPiece===(this.nPiece-1) ? (this.chunkSize-(PIECE_SIZE*(this.nPiece-1))) : PIECE_SIZE;
  }
  cancel(){
    this.onMissionCanceled(peer,this.chunkIndex,this.nextPiece);
  }
}

class FileDownloader {
  constructor(file,connectionsManager,resolvePromise,rejectPromise) {
    this.connectionsManager = connectionsManager;
    this.file = file;
    //Get peers who has the file partially or completely
    this.peers = file.peers || [];
    this.onNewPeer = this.onNewPeer.bind(this);
    this.resolvePromise = resolvePromise;
    this.rejectPromise = rejectPromise;
    this.activeMissions = new Map();
    this.pendingMissions = [];
    this.nextChunk = 0;
    this.nChunks = this.file.nChunks;
    for(let peer of this.peers){
      this.onNewPeer(peer);
    }
    this._onConnectionStatusChange = this._onConnectionStatusChange.bind(this);
    this.onNewPeer = this.onNewPeer.bind(this);
    this._findNewMission = this._findNewMission.bind(this);
    this.onData = this.onData.bind(this);
    this.onMissionFinished = this.onMissionFinished.bind(this);
    this.onMissionCanceled = this.onMissionCanceled.bind(this);
    this._onFinish = this._onFinish.bind(this);
  }
  onNewPeer(peer){
    switch (peer.connectionStatus) {
      case CONNECTION_STATUS.CONNECTED:
        //Give mission
        this._findNewMission(peer);
        break;
      case CONNECTION_STATUS.PENDING:
      case CONNECTION_STATUS.PENDING_TUNNEL:
        break;
      case CONNECTION_STATUS.CANCELLED:
      case CONNECTION_STATUS.DISCONNECTED:
      default:
        connectionsManager.connectTo(peer);
        break;
    }
    peer.addConnectionStatusListener(this._onConnectionStatusChange);
  }
  _onConnectionStatusChange(peer,oldStatus,newStatus){
    if(oldStatus!==newStatus){
      switch (newStatus) {
        case CONNECTION_STATUS.CONNECTED:
          //Give mission
          this._findNewMission(peer);
          break;
        case CONNECTION_STATUS.PENDING:
        case CONNECTION_STATUS.PENDING_TUNNEL:
        case CONNECTION_STATUS.CANCELLED:
        case CONNECTION_STATUS.DISCONNECTED:
        default:
          if(oldStatus === CONNECTION_STATUS.CONNECTED){
            //Abort mission!
            let mission = this.activeMissions.get(peer);
            mission.cancel();
          }
      }
    }
  }
  _findNewMission(peer){
    console.log('new mission requested!');
    if(this.pendingMissions.length!==0){
      let pendingMission = this.pendingMissions.shift();
      this.activeMissions.set(peer,new Mission(this.file,pendingMission.chunkIndex,peer,
        this.onMissionFinished,this.onMissionCanceled,pendingMission.nextPiece));
    }else if(this.nextChunk<this.nChunks){
      this.activeMissions.set(peer,new Mission(this.file,this.nextChunk,peer,this.onMissionFinished));
    }else{
      //download COMPLETED
      this._onFinish();
    }
    this.nextChunk = this.nextChunk + 1;
  }
  onData(peer,message){
    if(peer===undefined || message===undefined){
      throw 'peer and message cannot be undefined EXCEPTION!';
    }
    let mission = this.activeMissions.get(peer);
    if(mission!==undefined)
      mission.onData(message);
  }
  onMissionFinished(peer,chunkIndex){
    console.log('chunk downloaded: ' + chunkIndex);
    this._findNewMission(peer);
  }
  onMissionCanceled(peer,chunkIndex,nextPiece=0){
    //Put this mission into pending missions list!
    this.activeMissions.delete(peer);
    let pendingMission = {
      chunkIndex: chunkIndex,
      nextPiece: nextPiece
    };
    this.pendingMissions.push(pendingMission);
    //SHOULD WE GIVE ANOTHER MISSION FOR THIS PEER?
  }
  _onFinish(){
    //TODO IMPLEMENT
    //CHECK IF EVERY CHUNK IS HERE!
    //IF NOT FIND AND DOWNLOAD MISSING FILES
    this.file.findMissingChunks()
      .then((missingChunks) => {
        if(missingChunks.length===0){
          //No missingChunk
          this.file.mergeChunkFiles()
            .then(() => this.file.checkFileHash())
            .then((isCorrect) => {
              if(isCorrect){
                ///DOWNLOAD TOTALLY COMPLETED
                console.log("DOWNLOAD COMPLETED")
              }else{
                //SICTIK KI NE SICTIK!
                console.log("Calculated HashCode !== Given HashCode");
              }
            })
        }else{
          //SICTIK AMA COZULEBILIR!
          console.log('there are missingChunks: ',missingChunks);
        }
      })
    //WRITE TOGETHER INTO ONE FILE
    //CHECK FILE hashCode
    //IF NOT CORRECT CHECK EACH OF THE CHUNKS HASHCODES
    //DOWNLOAD AND FIX PROBLEMATIC CHUNKS AGAIN
  }
  pause(callback){
    //Stop all transfers save current state
    callback();
  }
  stop(callback){
    //stop all transfers delete downloaded file
    callback();
  }
}

export {FileDownloader};
