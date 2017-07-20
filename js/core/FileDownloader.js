import {EVENT,CONNECTION_STATUS} from 'Constants';

export default class FileDownloader {
  constructor(connectionsManager,file,resolvePromise,rejectPromise) {
    this.connectionsManager = connectionsManager;
    this.file = file;
    //Get peers who has the file partially or completely
    this.peers = file.usersWhoHasIt || [];
    this.connectedPeers = [];
    this.onNewPeer = this.onNewPeer.bind(this);
    this.resolvePromise = resolvePromise;
    this.rejectPromise = rejectPromise;
    for(let peer of this.peers){
      this.onNewPeer(peer);
    }
    this._onConnectionStatusChange = this._onConnectionStatusChange.bind(this);
    this.start = this.start.bind(this);
    this.pause = this.pause.bind(this);
    this.stop = this.stop.bind(this);
  }
  onNewPeer(peer){
    if(this.connectionsManager.activeConnections.indexOf(peer)!==--1){
      this.connectedPeers.push(peer);
    }else if(this.connectionsManager.pendingConnections.indexOf(peer)!==-1){
      //Waiting for answer from user
    }else if(this.connectionsManager.canceledPeers.indexOf(peer)!==-1){
      //Cancelled because of FIREWALL
    }else{
      //Connect To Peer
      connectionsManager.connectTo(peer);
    }
    peer.addConnectionStatusListener(this._onConnectionStatusChange);
  }
  _onConnectionStatusChange(peer,oldStatus,newStatus){
    if(oldStatus!==newStatus){
      switch (newStatus) {
        case CONNECTION_STATUS.CONNECTED:
          if(this.connectedPeers.indexOf(peer)===-1){
            this.connectedPeers.push(peer);
          }
          break;
        case CONNECTION_STATUS.PENDING:
        case CONNECTION_STATUS.CANCELLED:
        case CONNECTION_STATUS.PENDING_TUNNEL:
          let index = this.connectedPeers.indexOf(peer);
          if(index!==-1)
            this.connectedPeers.splice(index,1);
          break;
        default:
          throw `UNKNOWN CONNECTION_STATUS: ${newStatus}`;
      }
    }
  }
  _start(){
    //Use pieces_meta from file_meta
    //Ask every connection to report about their current pieces
    //Use a algorithm to request pieces from connections who has it iteratively until download completes!
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
