var validate      = require( LIB_DIR + 'validations/passwords' );
var User          = Model( 'User' );
var Application   = require( './application' );
var Controller    = Application.extend( validate );
var locale_users  = require( LANG_DIR + 'en/users' );

module.exports = Controller.extend({

  init : function ( before, after ){
    before( this.validate_create, { only : [ 'create' ]});
    before( this.validate_update, { only : [ 'update' ] });

    after( this.show_new_form, { only : [ 'new', 'create' ]});
    after( this.show_update_form, { only : [ 'edit', 'update' ]});
  },

  // ----- filters -------------------
  show_new_form : function( req, res, next ){
    var args = req.args || {};

    res.render( 'password/new', {
      title  : locale_users.resetpwd_page_title,
      email  : args.email,
      locale : locale_users
    });
  },

  show_update_form : function( req, res, next ) {
    res.render( 'password/edit', {
      title  : locale_users.change_password_page_title,
      locale : locale_users
    });
  },
  // ----- end of filters ------------

  new : function( req, res, next ){
    next();
  },

  create : function( req, res, next ){
    User.reset_password( { email : req.form.email }, next,
      function(){
        req.flash( 'error', locale_users.invalid_user );
        req.args = {
          email : req.body.email
        };
        next();
      },
      function() {
        res.render( 'password/create', {
          title  : locale_users.resetpwd_page_title,
          locale : locale_users
        });
      });
  },

  edit : function( req, res, next ){
    next();
  },

  update : function( req, res, next ){
    var args = {
      user_id : req.session.user_id,
      password : req.form.password,
      new_password : req.form.new_password
    };

    if( !req.form.isValid ) return next();

    User.change_password( args, next,
      function() {
        req.flash( 'error', locale_users.password_mismatch_msg );
        next();
      },
      function() {
        res.render( 'password/update', {
          title  : locale_users.change_password_page_title,
          locale : locale_users
        });
      });
  }

});
