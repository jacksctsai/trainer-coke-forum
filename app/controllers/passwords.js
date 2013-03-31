var validate     = require( LIB_DIR + 'validations/passwords' );
var Application  = require( './application' );
var Controller   = Application.extend( validate );
var locale_users = require( LANG_DIR + 'en/users' );
var User         = Model( 'User' );

module.exports = Controller.extend({

  init : function ( before, after ){
    before( this.validate_create, { only : [ 'create' ]});
    before( this.validate_update, { only : [ 'update' ]});
    before( this.is_email_exists, { only : [ 'create' ]});
  },

  // ------ filters -----------------------------------
  is_email_exists : function ( req, res, next ){
    User.email_to_id( req.form.email, next, next,
      function (){
        req.email_exists = true;

        next();
      });
  },
  // ------ end of filters ----------------------------

  render_new : function( res ){
    res.render( 'password/new', {
      title  : locale_users.resetpwd_page_title,
      locale : locale_users
    });
  },

  render_edit : function( res ){
    res.render( 'password/edit', {
      title  : locale_users.change_password_page_title,
      locale : locale_users
    });
  },

  new : function( req, res, next ){
    this.render_new( res );
  },

  create : function( req, res, next ){
    var self = this;

    if( !req.form.isValid ){
      return self.render_new( res );
    }
    if( !req.email_exists ){
      req.flash( 'error', locale_users.invalid_user );

      return self.render_new( res );
    }

    User.reset_password({ email : req.form.email }, next, next,
      function() {
        res.render( 'password/created', {
          title  : locale_users.resetpwd_page_title,
          locale : locale_users
        });
      });
  },

  edit : function( req, res, next ){
    this.render_edit( res );
  },

  update : function( req, res, next ){
    var self = this;
    var args = {
      user_id      : req.session.user_id,
      password     : req.form.password,
      new_password : req.form.new_password
    };

    if( !req.form.isValid ) return this.render_edit( res );

    User.change_password( args, next,
      function() {
        req.flash( 'error', locale_users.authentication_fail_msg );

        self.render_edit( res );
      },
      function() {
        res.render( 'password/updated', {
          title  : locale_users.change_password_page_title,
          locale : locale_users
        });
      });
  }
});
