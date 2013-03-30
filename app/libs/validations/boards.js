var form  = require( 'express-form2' );
var field = form.field;
var r     = require( './regex' );
var c     = require( './custom' );
var LANG  = require( LANG_DIR + 'en/form_validation' );
var Board = Model( 'Board' );

form.configure({
  autoTrim : true
});

module.exports = {

  validate_create : form(
    field( 'name' ).required( '', LANG.required.board_name ),
    field( 'category' ),
    field( 'order' ),
    field( 'admin' ).isEmail( LANG.invalid.email ).toLower()
  )
};
