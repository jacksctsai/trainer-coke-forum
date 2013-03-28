var validate     = require( LIB_DIR + 'validations/posts' );
var Post         = Model( 'Post' );
var Application  = require( './application' );
var Controller   = Application.extend( validate );
var locale_posts = require( LANG_DIR + 'en/posts' );
var Flow         = require( 'node.flow' );

module.exports = Controller.extend({

  init : function ( before, after ){
    before( this.validate_create, { only : [ 'create', 'update' ]});
    before( this.get_post, { only : [ 'edit' ]});

    after( this.show_new_form, { only : [ 'new', 'create' ]});
    after( this.show_edit_form, { only : [ 'edit', 'update' ]});
  },

  // -------- filters ------------------------------
  get_post : function( req, res, next ){
    var args = {
      post_id : req.params.post
    };

    Post.findById( args, next, function( post ){
      req.post = post;
      next();
    });
  },

  show_new_form : function( req, res, next ){
    var args = req.args || {};

    res.render( 'post/new', {
      title        : locale_posts.new_page_title,
      locale_posts : locale_posts,
      post_title   : args.title,
      body         : args.body
    });
  },

  show_edit_form : function( req, res, next ){
    var args = req.args || {};

    res.render( 'post/edit', {
      title      : locale_posts.update_page_title,
      post_title : args.title,
      body       : args.body,
      post_id    : req.params.post,
      locale     : locale_posts
    });
  },
  // -------- end of filters -----------------------

  show : function( req, res, next ){
    Post.findOne( { _id : req.params.post },
      function( err, post ){
        return res.render( 'post/show', {
          title      : locale_posts.show_page_title,
          post_title : post.title,
          body       : post.body,
          post_id    : post._id,
          board_id   : post.board,
          locale     : locale_posts
        });
      });
  },

  new : function( req, res, next ){
    next();
  },

  create : function( req, res, next ){
    var insert_args = {
      title : req.form.title,
      body  : req.form.body,
      board : req.params.board,
      user_id : req.session.user_id
    };

    req.args = {
      title   : req.body.title,
      body    : req.body.body
    };

    if( !req.form.isValid ) return next();

    Post.insert( insert_args, next, function() {
      res.redirect( '/board/' + req.params.board );
    });
  },

  edit : function( req, res, next ){
    var post = req.post;

    req.args = {
      title : post.title,
      body  : post.body
    };
    next();
  },

  update : function( req, res, next ){
    var update_args = {
      post_id : req.params.post,
      update_data : {
        title : req.form.title,
        body  : req.form.body
      }
    };

    req.args = {
      title : req.body.title,
      body  : req.body.body
    };

    if( !req.form.isValid ) return next();

    Post.update( update_args, next, function() {
      res.redirect( '/post/' + req.params.post );
    });
  }

});
