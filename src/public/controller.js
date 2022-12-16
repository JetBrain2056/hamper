const { content }  = require('./index.js');

exports.Auth = (req,res) => {
    content.logged = false;       
    res.render("index.twig", content); 
}  

exports.getOne = (req, res, next) => {
   
}

exports.create= (req, res, next) => {
    
}

exports.update = (req, res, next) => {
  
}

exports.delete = (req, res, next) => {
   
}