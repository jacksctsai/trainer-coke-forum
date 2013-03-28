var validate      = require( LIB_DIR + 'validations/profiles' );
var User          = Model( 'User' );
var Application   = require( './application' );
var Controller    = Application.extend( validate );
var locale_users  = require( LANG_DIR + 'en/users' );

module.exports = Controller.extend({

  init : function ( before, after ){
    before( this.get_user_data, { only : [ 'edit' ]});
    before( this.validate_update, { only : [ 'update' ]});

    after( this.show_edit_form, { only : [ 'edit', 'update' ]});
  },

  // ----- filters -----------------------------
  get_user_data : function( req, res, next ){
    User.findById( { user_id : req.session.user_id }, next, function( user ) {
      req.user = user;
      next();
    });
  },

  show_edit_form : function( req, res, next ){
    var args = req.args || {};

    res.render( 'profile/edit', {
      title      : locale_users.change_profile_page_title,
      email      : args.email,
      first_name : args.first_name,
      last_name  : args.last_name,
      locale     : locale_users
    });
  },
  // ----- end of filters ----------------------

  edit : function( req, res, next ){
    var user = req.user;

    req.args = {
      email      : user.email,
      first_name : user.first_name,
      last_name  : user.last_name
    };
    next();
  },

  update : function( req, res, next ){
    var args = {
      user_id     : req.session.user_id,
      update_data : {
        email      : req.form.email,
        first_name : req.body.first_name,
        last_name  : req.body.last_name
      }
    };

    User.update_profile( args, next,
      function() {
        req.flash( 'error', locale_users.taken_msg );
        req.args = {
          email      : req.body.email,
          first_name : req.body.first_name,
          last_name  : req.body.last_name
        };
        next();
      },
      function() {
        res.render( 'profile/update', {
          title      : locale_users.change_profile_page_title,
          locale     : locale_users
        });
      });
  }

});
