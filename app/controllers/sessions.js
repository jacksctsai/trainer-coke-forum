var validate     = require( LIB_DIR + 'validations/sessions' );
var User         = Model( 'User' );
var Application  = require( './application' );
var Controller   = Application.extend( validate );
var locale_users = require( LANG_DIR + 'en/users' );

module.exports = Controller.extend({

  init : function ( before, after ){
    before( this.validate_create, { only : [ 'create' ]});
  },

  render_new : function ( args, res ){
    res.render( 'session/new', {
      title  : locale_users.login_page_title,
      email  : args.email,
      locale : locale_users
    });
  },

  new : function ( req, res, next ){
    this.render_new({}, res );
  },

  create : function ( req, res, next ){
    var self = this;
    var login_args = {
      email    : req.form.email,
      password : req.form.password
    };
    var render_args = {
      email : req.body.email
    };

    User.login( login_args, next,
      function (){
        req.flash( 'error', locale_users.user_not_found_msg );
        self.render_new( render_args, res );
      },
      function (){
        req.flash( 'error', locale_users.login_failed_msg, next );
        self.render_new( render_args, res );
      }, function (){
        req.flash( 'error', locale_users.user_not_verified_msg );
        self.render_new( render_args, res );
      }, function (){
        req.flash( 'error', locale_users.user_locked_msg );
        self.render_new( render_args, res );
      }, function ( user ){
        req.session.user_id = user._id;
        res.redirect( '/' );
      });
  },

  destroy : function ( req, res, next ){
    req.session.destroy();
    res.redirect( '/' );
  }
});
