var validate     = require( LIB_DIR + 'validations/profiles' );
var Application  = require( './application' );
var Controller   = Application.extend( validate );
var locale_users = require( LANG_DIR + 'en/users' );
var User         = Model( 'User' );

module.exports = Controller.extend({

  init : function ( before, after ){
    before( this.validate_update, { only : [ 'update' ]});
    before( this.validate_email,  { only : [ 'update' ]});
    before( this.current_user,    { only : [ 'edit' ]});
  },

  // ----- filters -----------------------------
  current_user : function ( req, res, next ){
    User.findById( req.session.user_id,
      function ( err, user ){
        if( err )   return next( err );
        if( !user ) return next();

        req.user = user;

        next();
      });
  },

  validate_email : function ( req, res, next ){
    User.email_to_id( req.form.email, next, next,
      function( user_id ){
        if( user_id != req.session.user_id ){
          req.email_conflicts = true;
        }

        next();
      });
  },
  // ----- end of filters ----------------------

  render_edit : function ( args, res ){
    res.render( 'profile/edit', {
      title      : locale_users.change_profile_page_title,
      email      : args.email,
      first_name : args.first_name,
      last_name  : args.last_name,
      locale     : locale_users
    });
  },

  edit : function ( req, res, next ){
    var render_args = {
      email      : req.user.email,
      first_name : req.user.first_name,
      last_name  : req.user.last_name
    };

    this.render_edit( render_args, res );
  },

  update : function ( req, res, next ){
    var self = this;
    var render_args = {
      email      : req.body.email,
      first_name : req.body.first_name,
      last_name  : req.body.last_name
    };
    var update_args = {
      user_id      : req.session.user_id,
      update_data  : {
        email      : req.form.email,
        first_name : req.body.first_name,
        last_name  : req.body.last_name
      }
    };

    if( !req.form.isValid ) return self.render_edit( render_args, res );
    if( email_conflicts ){
      req.flash( 'error', locale_users.taken_msg );

      return self.render_edit( render_args, res );
    }

    User.update_props( update_args, next,
      function (){
        res.render( 'profile/updated', {
          title  : locale_users.change_profile_page_title,
          locale : locale_users
        });
      });
  }
});
