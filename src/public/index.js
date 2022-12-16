var lg_lg  = 'ru-ru';

//language
const { root }        = require('../language/'+lg_lg+'/root.js');

var content = {
    home               : '/',
    loguot             : '/',
    //logo               : '',
    image              : '',
    name               : 'Hamper',
    Ent                : 'Enterprise',
    Dev                : 'Developer',
    about_program      : 'About program...',
    Version            : '1.0.0',

    //root
    lang               : root.$_code,
    button_close       : root.$_button_close,

    //login    
    // text_heading           : login.$_text_heading,
    // text_login             : login.$_text_login,
    // text_forgotten         : login.$_text_forgotten,
    // entry_username         : login.$_entry_username,    
    // entry_password         : login.$_entry_password,
    // button_login           : login.$_button_login,
    // error_login            : login.$_error_login,
    // error_token            : login.$_error_token,
     
}

module.exports = { content }