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
    field( 'title' ).required( '', LANG.required.post_title ),
    field( 'body' ).required( '', LANG.required.post_body )
  )
};
