const { content }  = require('./index.js');

exports.Auth = (req,res) => {
    content.logged = false;       
    res.render("index.twig", content); 
} 
