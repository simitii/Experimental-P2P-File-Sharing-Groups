const CryptoJS = require("crypto-js");

export default class UniqueID{
  static createForObj(obj,useTime=true){
    let str = JSON.stringify(obj);
    if(useTime){
      str += Date.now();
    }
    const hash = CryptoJS.SHA256(str);
    // WordArray => String (Hex)
    return hash.toString(CryptoJS.enc.Hex);
  }
}
