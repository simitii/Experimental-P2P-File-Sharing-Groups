import {ChunkDownloader,PendingChunkDownloader,Downloader} from './Downloader.js';
import {DOWNLOAD_TYPES} from './Constants.js';
import MetaData from './MetaData.js';
import ObjectMemory from './ObjectMemory.js';

class MetaDataChunkDownloader extends ChunkDownloader {
  constructor(metaDataDownloader,peer,chunkIndex=0,nextPiece=0){
    const metaData = metaDataDownloader.metaData;
    const _checkChunk = (chunkIndex,chunkHash) => {
      //Will be implemented in v2 as MetaData Correctness Checking
      return new Promise((resolve,reject)=>{
        resolve();
      });
    };
    const _writePiece = (chunkIndex,position,data) => {
      //chunkIndex will not be used for v1
      //it is for future big MetaData Downloads...
      const pieceIndex = Math.floor(position/ChunkDownloader.getPieceSize());
      return new Promise((resolve,reject)=>{
        MetaData.setPiece(metaData.id,pieceIndex,data);
      });
    };
    const args = {
      type      : DOWNLOAD_TYPES.METADATA,
      id        : metaData.id,
      peer      : peer,
      chunkSize : metaData.dataLength,
      chunkHash : undefined,  //will be implemented in v2 as MetaData Correctness Checking
      onChunkDownloaded : _checkChunk,
      onPieceDownloaded : _writePiece,
      onChunkDownloaderFinished : metaDataDownloader.onChunkDownloaderFinished,
      onChunkDownloaderCanceled : metaDataDownloader.onChunkDownloaderCanceled,
      options: {
        chunkIndex : chunkIndex,
        nextPiece  : nextPiece
      }
    };
    super(args);
    this.downloadNextPiece();
  }
}

class MetaDataDownloader extends Downloader{
  constructor(metaData,resolvePromise,rejectPromise) {
    super(MetaDataChunkDownloader,metaData.peers,metaData.nChunks,
              resolvePromise,rejectPromise);

    this.metaData = metaData;
    this._onFinish = this._onFinish.bind(this);

    //Add to ObjectMemory
    ObjectMemory.addObject(this.constructor.name,this,metaData.id);

    //START
    this.start();
  }
  _onFinish(){
    const obj = MetaData.buildMetaData(this.metaData);
    MetaData.processMetaData(obj);
  }
}

// ObjectMemory CONFIGURATION
ObjectMemory.registerClass(MetaDataDownloader.name);

export default MetaDataDownloader;
