import {LocalDB} from './Database.js';

//This a parent class for Group and User classes
//It only provides a top api for getters and setters
export default class People extends LocalDB{
  constructor(objectType){
    super(objectType);
    let defaults = {
      _name : '',
      _givenName : '',
      _profilePicture : undefined,
      _profileDescription : '',
      rootDirectoryFiles : []
    };
    Object.assign(this,defaults);
  }

  //Getters and Setters
  set name(name){
    this._name = name;
  }
  get name(){
    return this._name;
  }

  set givenName(givenName){
    this._givenName = givenName;
  }
  get givenName(){
    return this._givenName;
  }

  set profilePicture(profilePicture){
    this._profilePicture = profilePicture;
  }
  get profilePicture(){
    return this._profilePicture;
  }

  set profileDescription(profileDescription){
    this._profileDescription = profileDescription;
  }
  get profileDescription(){
    return this._profileDescription;
  }
}
