var form  = require( 'express-form2' );
var field = form.field;
var r     = require( './regex' );
var c     = require( './custom' );
var LANG  = require( LANG_DIR + 'en/form_validation' );

form.configure({
  autoTrim : true
});

module.exports = {

  validate_create : form(
    field( 'email' ).required( '', LANG.required.email ).isEmail( LANG.invalid.email ).custom( c.emailCase )
  ),

  validate_update : form(
    field( 'password' ).required( '', LANG.required.password ),
    field( 'new_password' ).required( '', LANG.required.password ).is( r.words_between_6_to_20, LANG.invalid.password_length ),
    field( 'new_password_confirm' ).required( '', LANG.required.password_confirm ).equals( 'field::new_password', LANG.invalid.password_match )
  )

};
