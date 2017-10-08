import {ChunkDownloader,PendingChunkDownloader,Downloader} from './Downloader.js';
import {DOWNLOAD_TYPES} from './Constants.js';
import ObjectMemory from './ObjectMemory.js';

class FileChunkDownloader extends ChunkDownloader{
  constructor(fileDownloader,peer,chunkIndex=0,nextPiece=0){
    const file = fileDownloader.file;
    const _checkChunk = (chunkIndex,chunkHash) => {
      console.log(file.getTempPath());
      return file.checkChunkFileHash(chunkIndex,chunkHash);
    };
    const _writePiece = (chunkIndex,position,data) => {
      console.log('Writing Temp File position: ', position);
      return file.writeTempData(chunkIndex,data,position)
              .catch((e) => console.log('Temp File Writing Exception: ',e));
    };
    const args = {
      type      : DOWNLOAD_TYPES.FILE,
      id        : file.hashCode,
      peer      : peer,
      chunkSize : file.chunkSize,
      chunkHash : file.chunks[chunkIndex],
      onChunkDownloaded : _checkChunk,
      onPieceDownloaded : _writePiece,
      onChunkDownloaderFinished : fileDownloader.onChunkDownloaderFinished,
      onChunkDownloaderCanceled : fileDownloader.onChunkDownloaderCanceled,
      options: {
        chunkIndex : chunkIndex,
        nextPiece  : nextPiece
      }
    };
    super(args);
    this.downloadNextPiece();
  }
}

class FileDownloader extends Downloader{
  constructor(file,resolvePromise,rejectPromise) {
    super(FileChunkDownloader,file.peers,file.nChunks,resolvePromise,
            rejectPromise);

    this.file = file;

    //Add to ObjectMemory
    ObjectMemory.addObject(this.constructor.name,this,file.hashCode);

    //START
    this.start();
  }

  //WRITE TOGETHER INTO ONE FILE
  //CHECK FILE hashCode
  //IF NOT CORRECT CHECK EACH OF THE CHUNKS HASHCODES
  //DOWNLOAD AND FIX PROBLEMATIC CHUNKS AGAIN
  _onFinish(){
    this.file.findMissingChunks()
      .then((missingChunks) => {
        if(missingChunks.length===0){
          //No missingChunk
          this.file.mergeChunkFiles()
            .then(() => this.file.getFileHash())
            //CHECKING FILE_HASHCODE EQUALITY
            .then((filehash) => {
              if(filehash===this.file.hashCode){
                ///DOWNLOAD TOTALLY COMPLETED
                console.log("DOWNLOAD COMPLETED")
              }else{
                console.log("Calculated HashCode !== Given HashCode");
              }
            })
        }else{
          console.log('there are missingChunks: ',missingChunks);
          for(let chunkIndex of missingChunks){
            console.log('chunkIndex: ', chunkIndex);
            const pendingChunkDownloader = new PendingChunkDownloader(chunkIndex);
            this.pendingChunkDownloaders.push(pendingChunkDownloader);
          }
          this.continue();
        }
      });
  }
}

//ObjectMemory CONFIGURATION
ObjectMemory.registerClass(FileDownloader.name);

export default FileDownloader;
