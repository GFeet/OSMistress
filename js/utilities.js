function getPossessiveNameForm(name) {
    let nameLength = name.length;
    if(nameLength == 0 || typeof name !== "string") return "";
    if( name.toLowerCase()[nameLength - 1] == "s" ) {
      return name + "'";
    } else {
      return name + "'s";
    }
  }

module.exports = getPossessiveNameForm;