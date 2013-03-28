var validate      = require( LIB_DIR + 'validations/boards' );
var Board         = Model( 'Board' );
var Application   = require( './application' );
var Controller    = Application.extend( validate );
var locale_boards = require( LANG_DIR + 'en/boards' );
var Flow          = require( 'node.flow' );

module.exports = Controller.extend({

  init : function ( before, after ){
    before( this.validate_create, { only : [ 'create', 'update' ]});
    before( this.get_categories, { only : [ 'new', 'create', 'edit', 'update' ]});
    before( this.get_board, { only : [ 'edit', 'update' ]});

    after( this.validation, { only : [ 'create' ]});
    after( this.show_new_form, { only : [ 'new', 'create' ]});
    after( this.show_edit_form, { only : [ 'edit', 'update' ]});
  },

  // ----- filters -------------------------
  get_categories : function( req, res, next ){
    Model( 'Category' ).to_select( {}, next, function( categories ){
      req.categories = categories;
      next();
    });
  },

  get_board : function( req, res, next ){
    var args = { board_id : req.params.board };

    Board.findById( args, next, function( board ){
      req.board = board;
      next();
    });
  },

  show_new_form : function( req, res, next ){
    var args = req.args || {};

    res.render( 'board/new', {
      title         : locale_boards.new_page_title,
      locale_boards : locale_boards,
      name          : args.name,
      categories    : args.categories,
      admin         : args.admin
    });
  },

  show_edit_form : function( req, res, next ){
    var args       = req.args || {};
    var board      = args.board || {};
    var categories = args.categories || {};
    var admin      = board.admin ? board.admin.email : '';

    res.render( 'board/update', {
      title      : locale_boards.update_page_title,
      name       : board.name,
      categories : categories,
      category   : board.category,
      admin      : admin,
      order      : board.order,
      locale     : locale_boards,
      board      : board
    });
  },

  // ----- end of filters ------------------

  index : function( req, res, next ){
    Board.index( {}, next, function( boards ){
      res.render( 'board/index', {
        title  : locale_boards.index_page_title,
        boards : boards
      });
    });
  },

  new : function( req, res, next ){
    req.args = {
      categories : req.categories
    }

    next();
  },

  create : function( req, res, next ){
    req.args = {
      name       : req.body.name,
      category   : req.body.category,
      admin      : req.body.admin,
      categories : req.categories
    };

    if( !req.form.isValid ) return next();

    var insert_args = {
      insert_data : {
        name : req.form.name,
        category : req.form.category
      },
      admin : req.form.admin
    };

    Board.insert( insert_args, next, function(){
      req.flash( 'error', locale_boards.admin_not_found );
      next();
    }, function(){
      res.redirect( '/boards' );
    });
  },

  edit : function( req, res, next ){
    var board      = req.board;
    var categories = req.categories;
    var admin      = board.admin ? board.admin.email : '';

    req.args = {
      name       : board.name,
      categories : categories,
      category   : board.category,
      admin      : admin,
      order      : board.order,
      locale     : locale_boards,
      board      : board
    };
    next();
  },

  update : function( req, res, next ){
    var board      = req.board;
    var categories = req.categories;

    req.args = {
      name       : req.body.name,
      categories : categories,
      category   : req.body.category,
      admin      : req.body.admin,
      order      : req.body.order,
      board      : board
    };

    if( !req.form.isValid ) return next();

    Board.update({
      board_id    : req.params.board,
      admin       : req.form.admin,
      update_data : {
        name      : req.form.name,
        category  : req.form.category }
    }, next, function(){
      req.flash( 'error', locale_boards.admin_not_found );
      next();
    }, function(){
      res.redirect( '/boards' );
    });
  },

  show : function( req, res, next ){
    var args = {
      page_size : 10,
      page_no   : parseInt( req.query.page, 10) || 1,
      board_id  : req.params.board
    };

    Board.show( args, next, function( data ){
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
