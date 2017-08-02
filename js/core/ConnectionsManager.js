import {EVENT,ERROR,SIGNAL_TYPES,SIGNAL_STATUS,CONNECTION_STATUS,DATA_TYPES} from 'Constants';

import {Signal} from 'Signal';
import {RemoteConnection,LocalConnection} from 'Connection';
import FileDownloader from 'FileDownloader';


function _findIndirectWayTo(peer){
  //EXPERIMENTAL
}


export default class ConnectionsManager {
  constructor(me){
    if(me===undefined){
      //Add event listener for
      EVENT.CHANGE_ON_ME.addListener((newMe) => {
        this.me = newMe;
      })
    }
    if(ConnectionsManager.isActive){
      throw "You can't have more than one ConnectionsManager instance";
    }
    let defaults = {
      me:undefined,
      activeConnections:[],
      pendingConnections:[],
      canceledConnections:[],
      fileDownloaders:[],
    };
    Object.assign(this,defaults);
    this.sendFile = this.sendFile.bind(this);
    this.requestFile = this.requestFile.bind(this);
    ConnectionsManager.isActive = true;
  }
  connect(peer,sdpFromPeer=undefined){
    if(sdpFromPeer!==undefined){
      //Opponent started the connection we will use RemoteConnection
      //let connection = new RemoteConnection(peer);
    }else{
      //We will start the connection so we will use LocalConnection
    }
    //opponent.addConnectionStatusListener(_onConnectionStatusChange);
  }
  disconnect(peer){
    //Send disconnect signal and handle set operations needed
  }

  _onConnectionStatusChange(peer,oldStatus,newStatus){
    if(oldStatus!==newStatus){
      switch (oldStatus) {
        case CONNECTION_STATUS.CONNECTED:
          let index = this.activeConnections.indexOf(peer);
          if(index!==-1){
            this.activeConnections.splice(index,1);
          }
          break;
        case CONNECTION_STATUS.PENDING:
          let index = this.pendingConnections.indexOf(peer);
          if(index!==-1){
            this.pendingConnections.splice(index,1);
          }
          break;
        case CONNECTION_STATUS.CANCELLED:
          let index = this.canceledConnections.indexOf(peer);
          if(index!==-1){
            this.canceledConnections.splice(index,1);
          }
          break;
        case CONNECTION_STATUS.PENDING_TUNNEL:
            //TODO IMPLEMENT HERE
          break;
        default:
          throw `throw UNKNOWN CONNECTION_STATUS: ${oldStatus}`;
      }
      switch (newStatus) {
        case CONNECTION_STATUS.CONNECTED:
          let index = this.activeConnections.indexOf(peer);
          if(index===-1){
            this.activeConnections.push(peer);
          }
          break;
        case CONNECTION_STATUS.PENDING:
          let index = this.pendingConnections.indexOf(peer);
          if(index===-1){
            this.pendingConnections.push(peer);
          }
          break;
        case CONNECTION_STATUS.CANCELLED:
          let index = this.canceledConnections.indexOf(peer);
          if(index===-1){
            this.canceledConnections.push(peer);
          }
          break;
        case CONNECTION_STATUS.PENDING_TUNNEL:
            //TODO IMPLEMENT HERE
          break;
        default:
          throw `throw UNKNOWN CONNECTION_STATUS: ${newStatus}`;
      }
    }
  }
  sendFile(file=undefined,receivers=undefined){
    //send Signal to ask if receivers want the file
    if(file===undefined || receivers===undefined){
      throw 'file and receivers parameters are neccessary';
    }
    let signal = {
      status:SIGNAL_STATUS.QUESTION,
      type:SIGNAL_TYPES.FILE_SEND_REQUEST,
      file:file //HANDLE THIS TO JUST INCLUDE FILE_META_DATA
    };
    for(let receiver of receivers){
      Signal.sendSignal(signal,receiver);
    }
  }

  requestFile(file,timeout){
    //Check if file is alread requested
    if(this.fileDownloaders.indexOf(file)!==-1){
      throw 'file is already being downloaded';
    }

    //CREATE A PROMISE FOR FILE_DOWNLOAD PROCESS
    let context = this;
    new Promise((resolve, reject) => {
      //TODO HANDLE BACKGROUND SITUATION OF TIME_OUT
      let rejectTimeout = setTimeout(() => {
        reject(ERROR.TIME_OUT);
      }, timeout);

      let mResolve = () => {
        //clear rejectTimeout when resolve function called
        clearTimeout(rejectTimeout);
        resolve();
      };
      let mReject = (failReason) => {
        clearTimeout(rejectTimeout);
        reject(failReason);
      }
      // GIVE mResolve and mResolve to functions which will control rest of the download process
      context.fileDownloaders.push(new FileDownloader(this,file,mResolve,mReject));
    })
      .then(()=>{
        context._removeFileDownloader(file);
        EVENT.REQUESTED_FILE_DOWNLOADED.emit(file);
      })
      .catch((failReason) => {
        context._removeFileDownloader(file);
        if(failReason===ERROR.TIME_OUT){
          EVENT.FILE_REQUEST_TIME_OUT.emit(file);
        }
      });
      this.requestedFiles.push(file);
  }
  _removeFileDownloader(file){
    //FIND THE FileDownloader RELATED TO file and delete from this.fileDownloaders ARRAY
    let index = this.fileDownloaders.indexOf(file);
    this.fileDownloaders[index].stop(() => {
      //stop is done
      this.fileDownloaders.splice(index,1);
    });
  }
}
ConnectionsManager.isActive = false;
