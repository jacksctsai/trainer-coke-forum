var validate          = require( LIB_DIR + 'validations/categories' );
var Application       = require( './application' );
var Controller        = Application.extend( validate );
var locale_categories = require( LANG_DIR + 'en/categories' );
var Category          = Model( 'Category' );

module.exports = Controller.extend({

  init : function ( before, after ){
    before( this.validate_create,  { only : [ 'create', 'update' ]});
    before( this.current_category, { only : [ 'edit', 'update' ]});
  },

  // ------- filters -----------------------------
  current_category : function ( req, res, next ){
    Category.findById( req.params.id,
      function ( err, category ){
        if( err ) return next( err );

        req.category = category;

        next();
      });
  },
  // ------- end of filtesr ----------------------

  render_new : function ( args, res ){
    res.render( 'category/new', {
      title             : locale_categories.new_page_title,
      locale_categories : locale_categories,
      name              : args.name,
      order             : args.order
    });
  },

  render_edit : function ( args, res ){
    res.render( 'category/edit', {
      title    : locale_categories.update_page_title,
      name     : args.name,
      order    : args.order,
      category : args.category,
      locale   : locale_categories
    });
  },

  index : function ( req, res, next ){
    Category.index({}, next,
      function ( categories ){
        res.render( 'category/index', {
          title      : locale_categories.index_page_title,
          categories : categories
        });
      });
  },

  new : function ( req, res, next ){
    this.render_new({}, res );
  },

  create : function ( req, res, next ){
    var insert_args = { name : req.form.name };
    var render_args = {
      name  : req.body.name,
      order : req.body.order
    };

    if( !req.form.isValid ){
      return this.render_new( render_args, res );
    }

    Category.insert( insert_args, next,
      function (){
        res.redirect( '/categories' );
      });
  },

  edit : function ( req, res, next ){
    var render_args = {
      name     : req.category.name,
      order    : req.category.order,
      category : req.category
    };

    this.render_edit( render_args, res );
  },

  update : function ( req, res, next ){
    var update_args = {
      category_id : req.params.id,
      update_data : {
        name      : req.form.name
      }
    };
    var render_args = {
      name     : req.body.name,
      order    : req.body.order,
      category : req.category
    };

    if( !req.form.isValid ){
      return this.render_edit( render_args, res );
    }

    Category.update_props( update_args, next,
      function (){
        res.redirect( '/categories' );
      });
  }
});
