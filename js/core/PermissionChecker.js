

class PermissionChecker{
  static hasPermissionToRead(object,user){
    return true;
  }
  static hasPermissionToChange(object,user){
    return true;
  }
  static hasPermissionToCreate(className,user){
    return true;
  }
}

export default PermissionChecker;
