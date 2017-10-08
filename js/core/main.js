//MAIN VARIABLES
let connectionsManager = undefined;
let files = [];
let users = [];
let groups = [];
let me = undefined;

const onAppStart = () => {
  //Retrieve all of the users and groups
  let meRealm = realm.objects('User').filtered('isMe = true');
  let usersRealm = realm.objects('User').filtered('isMe = false');
  let groupsRealm = realm.objects('Group');
  for(let user of usersRealm){
    users.push(new User(user));
  }
  for(let group of groupsRealm){
    groups.push(new Group(group));
  }

  //Retrieve files all files
  let filesRealm = realm.objects('File');
  for(let file of filesRealm){
    files.push(new File(file));
  }

  if(meRealm!==undefined){
    me = new User(meRealm);
  }else{
    EVENT.SIGNAL_IDS.addListener((ids) => {
      //create user for me
      me = new User(/*TODO*/);
      EVENT.CHANGE_ON_ME.emit(me);
    });
  }
  connectionsManager = new ConnectionsManager(me);

}
