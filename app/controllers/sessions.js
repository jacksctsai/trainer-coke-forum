var validate      = require( LIB_DIR + 'validations/sessions' );
var User          = Model( 'User' );
var Application   = require( './application' );
var Controller    = Application.extend( validate );
var locale_users  = require( LANG_DIR + 'en/users' );

module.exports = Controller.extend({

  init : function ( before, after ){
    before( this.validate_create, { only : [ 'create' ]});

    after( this.show_new_form, { only : [ 'new', 'create' ]});
  },

  // --- after filters -------------------------------------
  show_new_form : function( req, res, next ){
    var args = req.args || {};

    res.render( 'session/new', {
        title     : locale_users.login_page_title,
        email     : args.email,
        locale    : locale_users
      });
  },

  // ---- end of filters -----------------------------------

  new : function( req, res, next ){
    next();
  },

  create : function( req, res, next ){
    var login_args = {
      email    : req.form.email,
      password : req.form.password
    };

    req.args = {
      email    : req.body.email
    };

    User.login( login_args, next, function(){
        req.flash( 'error', locale_users.user_not_found_msg );
        next();
      }, function(){
        req.flash( 'error', locale_users.login_failed_msg, next );
        next();
      }, function(){
        req.flash( 'error', locale_users.user_not_verified_msg );
        next();
      }, function(){
        req.flash( 'error', locale_users.user_locked_msg );
        next();
      }, function( user ) {
        req.session.user_id = user._id;
        res.redirect( '/' );
      });
  },

  destroy : function( req, res, next ){
    req.session.destroy();
    res.redirect( '/' );
  }

});
