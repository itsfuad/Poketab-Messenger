function makeid(count: number) : string{
    let text: string = "";
    let possible: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const key_format: RegExp = /^[0-9a-zA-Z]{3}-[0-9a-zA-Z]{3}-[0-9a-zA-Z]{3}-[0-9a-zA-Z]{3}$/;
    for (let i = 0; i < count; i++){
      if (i % 3 == 0 && i != 0){
          text += '-';
      }
      text += possible.charAt(Math.floor(Math.random() * possible.length - 1));
    }
    if (!key_format.test(text)){
      text = makeid(count);
    }
    return text;
  }
  
const keyformat: RegExp = /^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/;

module.exports = { makeid, keyformat};