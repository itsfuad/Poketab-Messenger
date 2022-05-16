var isRealString = (str) => {
    return typeof str === 'string' && str.trim().length > 0;
  };
  function validateUserName(username){
    const name_format = /^[a-zA-Z0-9]{3,20}$/;
    return (name_format.test(username) && username.trim().length > 0);
  }
  
  module.exports = {isRealString, validateUserName};