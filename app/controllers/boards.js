var validate      = require( LIB_DIR + 'validations/boards' );
var Application   = require( './application' );
var Controller    = Application.extend( validate );
var locale_boards = require( LANG_DIR + 'en/boards' );
var Board         = Model( 'Board' );
var User          = Model( 'User' );
var Category      = Model( 'Category' );

module.exports = Controller.extend({

  init : function ( before, after ){
    before( this.validate_create,      { only : [ 'create', 'update' ]});
    before( this.is_admin_user_exists, { only : [ 'create', 'update' ]});
    before( this.current_categories,   { only : [ 'new', 'create', 'edit', 'update' ]});
    before( this.current_board,        { only : [ 'edit', 'update' ]});
    before( this.validate_show,        { only : [ 'show' ]});

    after( this.validation, { only : [ 'create' ]});
  },

  // ----- filters -------------------------
  is_admin_user_exists : function ( req, res, next ){
    if( !req.form.admin ) return next();

    User.email_to_id( req.form.admin, next,
      function ( user_id ){
        req.admin_not_found = true;

        next();
      },
      function (){
        req.admin_not_found = false;

        next();
      });
  },

  current_categories : function ( req, res, next ){
    Category.simple_index({}, next,
      function ( categories ){
        req.categories = categories;

        next();
      });
  },

  current_board : function ( req, res, next ){
    Board.findById( req.params.id,
      function ( err, board ){
        if( err ) return next( err );

        req.board = board;

        next();
      });
  },
  // ----- end of filters ------------------

  render_new : function ( args, res ){
    res.render( 'board/new', {
      title         : locale_boards.new_page_title,
      locale_boards : locale_boards,
      name          : args.name,
      admin         : args.admin,
      categories    : args.categories
    });
  },

  render_edit : function ( args, res ){
    res.render( 'board/edit', {
      title      : locale_boards.update_page_title,
      name       : args.name,
      category   : args.category,
      admin      : args.admin,
      order      : args.order,
      locale     : locale_boards,
      categories : args.categories,
      board      : args.board || {}
    });
  },

  index : function ( req, res, next ){
    Board.index({}, next,
      function ( boards ){
        res.render( 'board/index', {
          title  : locale_boards.index_page_title,
          boards : boards
        });
      });
  },

  new : function ( req, res, next ){
    var render_args = { categories : req.categories };

    this.render_new( render_args, res );
  },

  create : function ( req, res, next ){
    var self        = this;
    var render_args = {
      name       : req.body.name,
      category   : req.body.category,
      admin      : req.body.admin,
      categories : req.categories
    };

    if( !req.form.isValid ){
      return self.render_new( render_args, res );
    }
    if( req.admin_not_found ){
      req.flash( 'error', locale_boards.admin_not_found );

      return self.render_new( render_args, res );
    }

    var insert_args = {
      insert_data : {
        name      : req.form.name,
        category  : req.form.category
      },
      admin : req.form.admin
    };

    Board.insert( insert_args, next,
      function (){
        req.flash( 'error', locale_boards.admin_not_found );

        self.render_new( render_args, res );
      },
      function (){
        res.redirect( '/boards' );
      });
  },

  edit : function ( req, res, next ){
    var board       = req.board;
    var render_args = {
      name       : board.name,
      category   : board.category,
      admin      : board.admin ? board.admin.email : '',
      order      : board.order,
      locale     : locale_boards,
      categories : req.categories,
      board      : board
    };

    this.render_edit( render_args, res );
  },

  update : function ( req, res, next ){
    var self        = this;
    var render_args = {
      name       : req.body.name,
      category   : req.body.category,
      admin      : req.body.admin,
      order      : req.body.order,
      categories : req.categories,
      board      : req.board
    };

    if( !req.form.isValid ){
      return self.render_edit( render_args, res );
    }
    if( req.admin_not_found ){
      req.flash( 'admin', locale_boards.admin_not_found );

      return self.render_edit( render_args, res );
    }

    Board.update_props({
      board_id    : req.params.id,
      update_data : {
        name      : req.form.name,
        admin     : req.form.admin,
        category  : req.form.category }
    }, next, next,
    function (){
      res.redirect( '/boards' );
    });
  },

  show : function ( req, res, next ){
    var args = {
      page_size : 10,
      page_no   : req.form.page,
      board_id  : req.params.id
    };

    Board.show( args, next,
      function ( data ){
        res.render( 'board/show', {
          title           : data.board.name,
          board           : data.board,
          posts           : data.posts,
          current_page_no : data.page_no,
          max_page_no     : data.max_page
        });
      });
  }
});
