import {EXCEPTION} from './Constants.js';

import BSGG_Protocol from './BSGG_PROTOCOL/BSGG_Protocol.js';

class ProtocolFactory {
  static factoryWithProtocolCode(peer,protocolCode){
    if(peer===undefined || protocolCode===undefined){
      EXCEPTION.NECESSARY_PARAMS('ProtocolFactory.factoryWithProtocolCode');
    }
    switch (protocolCode) {
      case BSGG_Protocol.code:
        return new BSGG_Protocol(peer);

      //TODO ADD NEW PROTOCOLS HERE

      default:
        EXCEPTION.UNKNOWN_PROTOCOL.throw(protocolCode);
    }
  }
}

export default ProtocolFactory;
