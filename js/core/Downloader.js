import {DOWNLOAD_TYPES,MESSAGE_TYPES,CONNECTION_STATUS,EXCEPTION} from './Constants.js';
import ConnectionsManager from './ConnectionsManager.js';
import UniqueID from './UniqueID.js';

class AsyncProcessesSyncronizer{
  constructor(){
    this.asyncProcesses = new Map();
    this.syncRequested = false;
    this.syncResolver = undefined;
  }
  addProcess(id){
    console.log("addProcess", id);
    if(this.asyncProcesses.has(id)){
      throw (`AsyncProcess with id: ${id} is already in the list!`);
    }
    this.asyncProcesses.set(id,true);
  }
  removeProcess(id){
    console.log("removeProcess", id);
    console.log("this.asyncProcesses.size = ", this.asyncProcesses.size);
    if(!this.asyncProcesses.has(id)){
      throw (`AsyncProcess with id: ${id} is already out of the list!`);
    }
    this.asyncProcesses.delete(id);
    if(this.syncRequested && this.asyncProcesses.size === 0){
      //RESOLVE THE SYNC PROMISE
      this.syncResolver();
    }
  }
  sync(timeout){
    this.syncRequested = true;
    //Wait until all of them are done
    return new Promise((resolve,reject) => {
      if(this.asyncProcesses.length === 0){
        resolve();
      }
      const timer = setTimeout(() => {
        reject("TIMEOUT: " + timeout);
      }, timeout);
      this.syncResolver = () => {
        clearTimeout(timer);
        resolve();
      };
    });
  }
}


const PIECE_SIZE = 16*1024; //bytes

//Breaks a big chunk into subchunks and downloads them
//So monitors and controls the downloading process of a chunk
class ChunkDownloader {
  constructor(args = undefined){
    if(args === undefined){
      throw 'args cannot be undefined!';
    }
      this.type = args.type;
      this.id = args.id;
      this.peer = args.peer;
      this.chunkSize = args.chunkSize;
      this.chunkHash = args.chunkHash;
      this.onChunkDownloaded = args.onChunkDownloaded;
      this.onPieceDownloaded = args.onPieceDownloaded;
      const options = args.options || {nextPiece:0, chunkIndex: 0};
      this.nextPiece = options.nextPiece;
      this.chunkIndex = options.chunkIndex;
      this.firstPosition = this.chunkSize * this.chunkIndex;
      this.nPiece = Math.ceil(this.chunkSize / PIECE_SIZE);
      this.onChunkDownloaderFinished = args.onChunkDownloaderFinished;
      this.onChunkDownloaderCanceled = args.onChunkDownloaderCanceled;
      this.asyncProcessesSyncronizer = new AsyncProcessesSyncronizer();
  }
  static getPieceSize(){
    return PIECE_SIZE;
  }
  downloadNextPiece(){
    console.log('chunkIndex ',this.chunkIndex,'chunkSize: ', this.chunkSize,'nextPiece: ', this.nextPiece, 'nPiece: ', this.nPiece);
    if(this.nextPiece>=this.nPiece){
      //ChunkDownloader done!
      //Checking the correctness of the ChunkDownloader
      this.asyncProcessesSyncronizer.sync(30000)
        .then(() => this.onChunkDownloaded(this.chunkIndex,this.chunkHash))
        .then((isCorrect) => {
          console.log('isCorrect: ',isCorrect);
          if(isCorrect){
            this.onChunkDownloaderFinished(this.peer,this.chunkIndex);
          }else{
            this.onChunkDownloaderCanceled(this.peer,this.chunkIndex);
          }
        })
        .catch((e) => {
          console.log("AsyncProcessesSyncronizer or onChunkDownloaded Exception:",e);
        });
    }else{
      if(this.peer.connectionStatus!==CONNECTION_STATUS.CONNECTED || this.peer.connection===undefined){
        throw 'downloadNextPiece function cannot be called with disconnected peer';
      }
      let message = {
        INFO:{
          messageType: MESSAGE_TYPES.DATA_PIECE_REQUEST,
          details: {
            type: this.type,
            id: this.id,
            position: this.positionForNextPiece(),
            size: this.sizeForNextPiece(),
            chunkIndex: this.chunkIndex
          }
        }
      };
      ConnectionsManager.sendMessage(this.peer,message);
    }
  }
  onData(details=undefined,data=undefined){
    if(details === undefined){
      throw 'Details cannot be undefined!';
    }
    const type = details.type;
    const id = details.id;
    const position = details.position;
    const size = details.size;
    if(type !== this.type){
      throw (`ChunkDownloader Type Exception ${type} !== ${this.type}`);
    }
    if(id !== this.id){
      throw (`ChunkDownloader ID Exception ${id} !== ${this.id}`);
    }
    if(position !== this.positionForNextPiece()){
      throw (`ChunkDownloader Position Exception ${position} !== ${this.position}`);
    }
    if(size !== this.sizeForNextPiece()){
      throw (`ChunkDownloader Size Exception ${size} !== ${this.size}`);
    }
    if(data === undefined){
      throw ("ChunkDownloader Data Exception. Data cannot be undefined");
    }
    const processId = UniqueID.createForObj({},true);
    this.onPieceDownloaded(this.chunkIndex,this.positionForNextPiece(true),data)
            .then(() => this.asyncProcessesSyncronizer.removeProcess(processId))
            .catch(() => this.asyncProcessesSyncronizer.removeProcess(processId));
    this.asyncProcessesSyncronizer.addProcess(processId);
    //We use this kind of strategy(not waiting for data to be written)
    //in order to increase speed of download!

    this.nextPiece = this.nextPiece + 1;
    this.downloadNextPiece();
  }
  positionForNextPiece(relative=false){
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
    this.onChunkDownloaderCanceled(peer,this.chunkIndex,this.nextPiece);
  }
}

class PendingChunkDownloader {
  constructor(chunkIndex,nextPiece=0) {
    if(chunkIndex===undefined){
      throw 'You cannot init a PendingChunkDownloader object without chunkIndex!';
    }
    this.chunkIndex = chunkIndex;
    this.nextPiece = nextPiece;
  }
}

class Downloader {
  constructor(chunkDownloader,peers=[],nChunks,resolvePromise,rejectPromise){
    if(new.target === Downloader){
      EXCEPTION.INTERFACE_ABSTRACT_CLASS_ERROR.throw('Downloader');
    }
    this.ChunkDownloader = chunkDownloader;
    this.nextChunk = 0;
    this.nChunks = nChunks;
    this.peers = peers;
    this.resolvePromise = resolvePromise;
    this.rejectPromise = rejectPromise;
    this.activeChunkDownloaders = new Map();
    this.pendingChunkDownloaders = [];

    //Context Binding
    this.onNewPeer = this.onNewPeer.bind(this);
    this.usePeer = this.usePeer.bind(this);
    this._onConnectionStatusChange = this._onConnectionStatusChange.bind(this);
    this.onNewPeer = this.onNewPeer.bind(this);
    this._findNewChunkDownloader = this._findNewChunkDownloader.bind(this);
    this.onData = this.onData.bind(this);
    this.onChunkDownloaderFinished = this.onChunkDownloaderFinished.bind(this);
    this.onChunkDownloaderCanceled = this.onChunkDownloaderCanceled.bind(this);
    this._onFinish = this._onFinish.bind(this);
  }

  start(){
    for(let peer of this.peers){
      this.usePeer(peer);
    }
  }
  continue(){
    for(let peer of this.peers){
      this.usePeer(peer);
    }
  }
  pause(callback){
    //Stop all transfers save current state
    callback();
  }
  stop(callback){
    callback();
  }
  _onFinish(){
    EXCEPTION.MUST_BE_OVERRIDDEN.throw('Downloader._onFinish');
  }

  onNewPeer(peer){
    if(this.peers.indexOf(peer)===-1){
      this.peers.push(peer);
      this.usePeer(peer);
      peer.addConnectionStatusListener(this._onConnectionStatusChange);
    }else{
      console.log('peer is already in the list!');
    }
  }

  //Use peer for downloading
  usePeer(peer){
    switch (peer.connectionStatus) {
      case CONNECTION_STATUS.CONNECTED:
        //Give chunkDownloader
        this._findNewChunkDownloader(peer);
        break;
      case CONNECTION_STATUS.PENDING:
      case CONNECTION_STATUS.PENDING_TUNNEL:
        break;
      case CONNECTION_STATUS.CANCELLED:
      case CONNECTION_STATUS.DISCONNECTED:
      default:
        ConnectionsManager.connect(peer);
        break;
    }
  }
  _onConnectionStatusChange(peer,oldStatus,newStatus){
    if(oldStatus!==newStatus){
      switch (newStatus) {
        case CONNECTION_STATUS.CONNECTED:
          //Give chunkDownloader
          this._findNewChunkDownloader(peer);
          break;
        case CONNECTION_STATUS.PENDING:
        case CONNECTION_STATUS.PENDING_TUNNEL:
        case CONNECTION_STATUS.CANCELLED:
        case CONNECTION_STATUS.DISCONNECTED:
        default:
          if(oldStatus === CONNECTION_STATUS.CONNECTED){
            //Abort chunkDownloader!
            let chunkDownloader = this.activeChunkDownloaders.get(peer);
            chunkDownloader.cancel();
          }
      }
    }
  }
  onData(peer=undefined,details=undefined,data=undefined){
    if(peer===undefined || details===undefined || data===undefined){
      throw 'peer, details and data cannot be undefined EXCEPTION!';
    }
    let chunkDownloader = this.activeChunkDownloaders.get(peer);
    if(chunkDownloader!==undefined){
      chunkDownloader.onData(details,data);
    }else{
      throw 'Related chunkDownloader cannot be found!';
    }
  }
  _findNewChunkDownloader(peer){
    console.log('new chunkDownloader requested!');
    if(this.pendingChunkDownloaders.length !== 0){
      const pendingChunkDownloader = this.pendingChunkDownloaders.shift();
      const chunkDownloader = new this.ChunkDownloader(this,peer,
          pendingChunkDownloader.chunkIndex,pendingChunkDownloader.nextPiece);
      this.activeChunkDownloaders.set(peer,chunkDownloader);
    }else if(this.nextChunk < this.nChunks){
      const chunkDownloader = new this.ChunkDownloader(this,peer,this.nextChunk);
      this.activeChunkDownloaders.set(peer,chunkDownloader);
    }else{
      //download COMPLETED
      this._onFinish();
    }
    this.nextChunk = this.nextChunk + 1;
  }
  onChunkDownloaderFinished(peer,chunkIndex){
    console.log('chunk downloaded: ' + chunkIndex);
    this._findNewChunkDownloader(peer);
  }
  onChunkDownloaderCanceled(peer,chunkIndex,nextPiece=0){
    //Put this chunkDownloader into pending chunkDownloaders list!
    this.activeChunkDownloaders.delete(peer);
    const pendingChunkDownloader = new PendingChunkDownloader(chunkIndex,nextPiece);
    this.pendingChunkDownloaders.push(pendingChunkDownloader);
    //SHOULD WE GIVE ANOTHER MISSION FOR THIS PEER?
  }
}

export {ChunkDownloader,PendingChunkDownloader,Downloader};
