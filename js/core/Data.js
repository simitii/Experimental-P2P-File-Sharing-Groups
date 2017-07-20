
export default class Data{
  _requestPiece(file,piece){
    if(peer.connectionStatus!==CONNECTION_STATUS.CONNECTED || peer.connection===undefined){
      throw '_requestPiece function cannot be called with disconnected peer'
    }
    let message = {
      dataType: DATA_TYPES.DATA_PIECE_REQUEST,
      file: file,     //TODO TODO
      piece: piece    //TODO file=>file-meta   piece=>piece-meta
    };
    this.peer.connection.sendMessage(message);
  }
  _onPieceRequest(file,piece){
    //Check if requested file&piece exist
    //GET THE PIECE FROM FILE SYSTEM
    let message = {
      dataType: DATA_TYPES.DATA_PIECE,
      file: file,
      piece: piece  //TODO TODO piece
    };
  }
}
