var validate      = require( LIB_DIR + 'validations/users' );
var User          = Model( 'User' );
var Application   = require( './application' );
var Controller    = Application.extend( validate );
var locale_users  = require( LANG_DIR + 'en/users' );

module.exports = Controller.extend({

  init : function ( before, after ){
    before( this.validate_create, { only : [ 'create' ]});
    before( this.validate_update, { only : [ 'update' ] });
    before( this.get_user_data, { only : [ 'edit' ] });

    after( this.show_new_form, { only : [ 'new', 'create' ]});
    after( this.show_edit_form, { only : [ 'edit', 'update' ]});
  },

  // ------- filters ---------------------------
  show_new_form : function( req, res, next ){
    var args = req.args || {};

    res.render( 'user/new', {
        title     : locale_users.signup_page_title,
        email     : args.email,
        locale    : locale_users
      });
  },

  get_user_data : function( req, res, next ){
    var args = { user_id : req.params.user };

    User.findById( args, next, function( user ){
      req.user = user;
      next();
    });
  },

  show_edit_form : function( req, res, next ){
    var args = req.args || {};

    res.render( 'user/edit', {
      title      : locale_users.update_page_title,
      user_id    : req.params.user,
      email      : args.email,
      first_name : args.first_name,
      last_name  : args.last_name,
      is_locked  : args.is_locked,
      locale     : locale_users
    });
  },
  // ------- end of filters --------------------

  index : function( req, res, next ){
    var args = {
      page_no   : parseInt( req.query.page, 10 ) || 1,
      page_size : 10
    };

    User.index( args, next, function( users, page_size, page_no, max_page_no ){
      res.render( 'user/index', {
        title           : locale_users.index_page_title,
        users           : users,
        current_page_no : page_no,
        max_page_no     : max_page_no
      });
    });
  },

  new : function( req, res, next ){
    next();
  },

  create : function( req, res, next ){
    req.args = {
      email : req.body.email
    };

    if( !req.form.isValid ) return next();

    var args = {
      email    : req.form.email,
      password : req.form.password
    };

    User.insert( args, next, function() {
      req.flash( 'email', locale_users.taken_msg );
      next();
    }, function() {
      return res.render( 'user/create', {
        title  : locale_users.signup_page_title,
        locale : locale_users
      });
    });
  },

  edit : function( req, res, next ){
    var user = req.user;

    req.args = {
      email      : user.email,
      first_name : user.first_name,
      last_name  : user.last_name,
      is_locked  : user.is_locked
    }
    next();
  },

  update : function( req, res, next ){
    var args = {
      user_id     : req.params.user,
      update_data : {
        email      : req.form.email,
        first_name : req.body.first_name,
        last_name  : req.body.last_name,
        is_locked  : req.form.is_locked
      }
    };

    User.update_profile( args, next,
      function() {
        req.flash( 'error', locale_users.taken_msg );
        req.args = {
          email      : req.body.email,
          first_name : req.body.first_name,
          last_name  : req.body.last_name,
          is_locked  : req.body.is_locked
        };
        next();
      },
      function() {
        res.redirect( '/users' );
      });
  }
});
