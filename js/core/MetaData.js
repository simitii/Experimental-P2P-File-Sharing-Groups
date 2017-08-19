import {EXCEPTION} from './Constants.js';

let CryptoJS = require("crypto-js");

class MetaData {
  constructor(type,data,createdBy) {
    if(type===undefined || data===undefined || createdBy===undefined){
      EXCEPTION.NECESSARY_PARAMS.throw('MetaData.constructor');
    }
    this.type = type;
    this.data = data;
    this.createdBy = createdBy;
    this.hashcode = this._getHashCode();
  }
  _getHashCode(){
    const obj = {
      type: this.type,
      data: this.data,
      createdBy: this.createdBy
    };
    const str = JSON.stringify(obj);
    const hash = CryptoJS.SHA256(str) //Create HashCode
    // WordArray => String (Hex)
    return hash.toString(CryptoJS.enc.Hex);
  }
  static getMetaData(hashcode,creator){
    //TODO
    //  Start Connection
    //  Send MetaData request
    //  after getting data save data to LocalDB
  }
}
