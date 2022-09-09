const avList: string[] = [
    "articuno",
    "bellsprout",
    "blastoise",
    "bulbasaur2",
    "bullbasaur",
    "caterpie",
    "charizard",
    "charmander",
    "charmander2",
    "dratini",
    "eevee",
    "haunter",
    "ivysaur",
    "jigglypuff",
    "mankey",
    "meowth",
    "mew",
    "mewtwo",
    "palkia",
    "pichu",
    "pidgey",
    "pikachu",
    "psyduck",
    "raichu",
    "rattata",
    "rayquaza",
    "snorlax",
    "squirtle",
    "squirtle2",
    "zubat"];
  
  
const isRealString = (str: string) : boolean => {
    return typeof str === 'string' && str.trim().length > 0;
};
function validateUserName(username: string) : boolean{
    const name_format: RegExp = /^[a-zA-Z0-9\u0980-\u09FF]{3,20}$/;
    return (name_format.test(username) && username.trim().length > 0);
}

module.exports = { avList, isRealString, validateUserName};