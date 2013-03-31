var bcrypt = require( 'bcrypt' );
var salt   = null;

bcrypt.genSalt( 10, function( err, new_salt ){
  if( err ) throw err;

  salt = new_salt;
});

module.exports = {
  hash_password : function( password_plaintext, hashed ){
    bcrypt.hash( password_plaintext, salt, function( err, crypted ){
      hashed( err, crypted );
    });
  }
};
