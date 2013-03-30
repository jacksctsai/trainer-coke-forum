var validate     = require( LIB_DIR + 'validations/posts' );
var Application  = require( './application' );
var Controller   = Application.extend( validate );
var locale_posts = require( LANG_DIR + 'en/posts' );
var Post         = Model( 'Post' );

module.exports = Controller.extend({

  init : function ( before, after ){
    before( this.validate_create, { only : [ 'create', 'update' ]});
    before( this.current_post,    { only : [ 'edit' ]});
  },

  // -------- filters ------------------------------
  current_post : function ( req, res, next ){
    var args = { post_id : req.params.id };

    Post.fetch_by_id( args, next,
      function ( post ){
        req.post = post;

        next();
      });
  },
  // -------- end of filters -----------------------

  render_new : function ( args, res ){
    res.render( 'post/new', {
      board_id     : args.board_id,
      title        : locale_posts.new_page_title,
      locale_posts : locale_posts,
      post_title   : args.title,
      body         : args.body
    });
  },

  render_edit : function ( args, res ){
    res.render( 'post/edit', {
      title      : locale_posts.update_page_title,
      post_title : args.title,
      body       : args.body,
      post_id    : args.post_id,
      locale     : locale_posts
    });
  },

  new : function ( req, res, next ){
    this.render_new({ board_id : req.params.board_id }, res );
  },

  create : function ( req, res, next ){
    var insert_args = {
      title   : req.form.title,
      body    : req.form.body,
      board   : req.params.board_id,
      user_id : req.session.user_id
    };
    var render_args = {
      board_id : req.params.board_id,
      title    : req.body.title,
      body     : req.body.body
    };

    if( !req.form.isValid ){
      return this.render_new( render_args, res );
    }

    Post.insert( insert_args, next,
      function (){
        res.redirect( '/boards/' + req.params.board_id );
      });
  },

  edit : function ( req, res, next ){
    var render_args = {
      post_id : req.params.id,
      title   : req.post.title,
      body    : req.post.body
    };

    this.render_edit( render_args, res );
  },

  update : function ( req, res, next ){
    var update_args = {
      post_id     : req.params.id,
      update_data : {
        title     : req.form.title,
        body      : req.form.body
      }
    };
    var render_args = {
      post_id : req.params.id,
      title   : req.body.title,
      body    : req.body.body
    };

    if( !req.form.isValid ){
      return this.render_edit( render_args, res );
    }

    Post.update_props( update_args, next,
      function (){
        res.redirect( '/posts/' + req.params.id );
      });
  },

  show : function ( req, res, next ){
    Post.fetch_by_id({ post_id : req.params.id }, next, next,
      function ( post ){
        if( !post ) return next();

        res.render( 'post/show', {
          title      : locale_posts.show_page_title,
          post_title : post.title,
          body       : post.body,
          post_id    : post._id,
          board_id   : post.board,
          locale     : locale_posts
        });
      });
  }
});
