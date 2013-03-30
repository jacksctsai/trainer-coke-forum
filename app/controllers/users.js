var validate     = require( LIB_DIR + 'validations/users' );
var User         = Model( 'User' );
var Application  = require( './application' );
var Controller   = Application.extend( validate );
var locale_users = require( LANG_DIR + 'en/users' );

module.exports = Controller.extend({

  init : function ( before, after ){
    before( this.validate_create, { only : [ 'create' ]});
    before( this.validate_update, { only : [ 'update' ]});
    before( this.validate_email,  { only : [ 'create', 'update' ]});
    before( this.current_user,    { only : [ 'edit' ]});
  },

  // ------- filters ---------------------------
  current_user : function ( req, res, next ){
    var args = { user_id : req.params.id };

    User.fetch_by_id( args, next,
      function ( user ){
        if( !user ) return next();

        req.user = user;

        next();
      });
  },

  validate_email : function ( req, res, next ){
    User.email_to_id( req.form.email, next, next,
      function( user_id ){
        if( !req.params.id || user_id != req.params.id ){
          req.email_conflicts = true;
        }
        next();
      });
  },
  // ------- end of filters --------------------

  render_new : function ( args, res ){
    res.render( 'user/new', {
      title  : locale_users.signup_page_title,
      email  : args.email,
      locale : locale_users
    });
  },

  render_edit : function ( args, res ){
    res.render( 'user/edit', {
      title      : locale_users.update_page_title,
      user_id    : args.user_id,
      email      : args.email,
      first_name : args.first_name,
      last_name  : args.last_name,
      is_locked  : args.is_locked,
      locale     : locale_users
    });
  },

  index : function ( req, res, next ){
    var args = {
      page_no   : parseInt( req.query.page, 10 ) || 1,
      page_size : 10
    };

    User.index( args, next,
      function ( users, page_size, page_no, max_page_no ){
        res.render( 'user/index', {
          title           : locale_users.index_page_title,
          users           : users,
          current_page_no : page_no,
          max_page_no     : max_page_no
        });
      });
  },

  new : function ( req, res, next ){
    this.render_new({}, res );
  },

  create : function ( req, res, next ){
    var render_args = {
      email : req.body.email
    };
    var insert_args = {
      email    : req.form.email,
      password : req.form.password
    };

    if( !req.form.isValid ){
      return this.render_new( render_args, res );
    }
    if( req.email_conflicts ){
      req.flash( 'email', locale_users.taken_msg );

      return this.render_new( render_args, res );
    }

    User.insert( insert_args, next,
      function (){
        res.render( 'user/created', {
          title  : locale_users.signup_page_title,
          locale : locale_users
        });
      });
  },

  edit : function ( req, res, next ){
    var render_args = {
      user_id    : req.params.id,
      email      : req.user.email,
      first_name : req.user.first_name,
      last_name  : req.user.last_name,
      is_locked  : req.user.is_locked
    };

    this.render_edit( render_args, res );
  },

  update : function ( req, res, next ){
    var self        = this;
    var render_args = {
      user_id    : req.params.id,
      email      : req.body.email,
      first_name : req.body.first_name,
      last_name  : req.body.last_name,
      is_locked  : req.body.is_locked
    };
    var update_args = {
      user_id      : req.params.id,
      update_data  : {
        email      : req.form.email,
        first_name : req.body.first_name,
        last_name  : req.body.last_name,
        is_locked  : req.form.is_locked
      }
    };

    if( !req.form.isValid ){
      return self.render_edit( render_args, res );
    }
    if( req.email_conflicts ){
      req.flash( 'error', locale_users.taken_msg );

      return self.render_edit( render_args, res );
    }

    User.update_props( update_args, next,
      function (){
        res.redirect( '/users' );
      });
  },

  destroy : function( req, res, next ){
    User.delete_by_id({ user_id : req.params.id }, next,
      function(){
        res.redirect( '/users' );
      });
  }
});
