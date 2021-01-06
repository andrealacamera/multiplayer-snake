module.exports = {
    makeId
}


function makeId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var cLenght = characters.length;
    for (var i=0; i<length; i++){
        result+=characters.charAt(Math.floor(Math.random()*cLenght));
    }
    return result;
}