import {EXCEPTION} from './Constants.js';

class SignalID {
  constructor(protocolCode,id){
    if(protocolCode === undefined || id === undefined){
        EXCEPTION.NECESSARY_PARAMS.throw('SignalID.constructor');
    }
    this.protocolCode = protocolCode;
    this.id = id;
  }
}
