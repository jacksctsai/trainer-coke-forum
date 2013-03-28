var validate          = require( LIB_DIR + 'validations/categories' );
var Category          = Model( 'Category' );
var Application       = require( './application' );
var Controller        = Application.extend( validate );
var locale_categories = require( LANG_DIR + 'en/categories' );
var Flow              = require( 'node.flow' );

module.exports = Controller.extend({

  init : function( before, after ){
    before( this.validate_create, { only : [ 'create', 'update' ]});
    before( this.get_category, { only : [ 'edit', 'update' ]});

    after( this.show_new_form, { only : [ 'new', 'create' ]});
    after( this.show_edit_form, { only : [ 'edit', 'update' ]});
  },

  // ------- filters -----------------------------
  get_category : function( req, res, next ){
    var args = {
      category_id : req.params.category
    };

    Category.findById( args, next, function( category ){
      req.category = category;
      next();
    });
  },

  show_new_form : function( req, res, next ){
    var args = req.args || {};

    res.render( 'category/new', {
      title             : locale_categories.new_page_title,
      locale_categories : locale_categories,
      name              : args.name,
      order             : args.order
    });
  },

  show_edit_form : function( req, res, next ){
    var args = req.args;

    res.render( 'category/edit', {
      title    : locale_categories.update_page_title,
      name     : args.name,
      order    : args.order,
      category : args.category,
      locale   : locale_categories
    });

  },
  // ------- end of filtesr ----------------------

  index : function( req, res, next ){
    Category.index( {}, next, function( categories ){
      res.render( 'category/index', {
        title      : locale_categories.index_page_title,
        categories : categories
      });
    });
  },

  new : function( req, res, next ){
    next();
  },

  create : function( req, res, next ){
    var insert_args = { name : req.form.name };

    req.args = {
      name  : req.body.name,
      order : req.body.order
    };

    if( !req.form.isValid ) return next();

    Category.insert( insert_args, next, function(){
      res.redirect( '/categories' );
    });
  },

  edit : function( req, res, next ){
    req.args = {
      name     : req.category.name,
      order    : req.category.order,
      category : req.category
    };

    next();
  },

  update : function( req, res, next ){
    var update_args = {
      category_id : req.params.category,
      update_data : {
        name : req.form.name
      }
    };

    req.args = {
      name     : req.body.name,
      order    : req.body.order,
      category : req.category
    };

    if( !req.form.isValid ) return next();

    Category.update( update_args, next, function() {
      res.redirect( '/categories' );
    });
  }

});
