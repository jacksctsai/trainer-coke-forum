var form  = require( 'express-form2' );
var field = form.field;
var r     = require( './regex' );
var c     = require( './custom' );
var LANG  = require( LANG_DIR + 'en/form_validation' );

form.configure({
  autoTrim : true
});

module.exports = {

  validate_update : form(
    field( 'email' ).required( '', LANG.required.email ).isEmail( LANG.invalid.email ).custom( c.emailCase )
  )
};
