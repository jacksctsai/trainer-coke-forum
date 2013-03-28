
module.exports = {

  statics : {

    index : function( args, next, ready ){
      this.find( function( err, categories, count ){
        if( err ) return next( err );

        ready( categories );
      });
    },

    to_select : function( args, next, ready ){
      this.
        find().
        select( 'name' ).
        sort( 'order' ).
        exec( function( err, data, count ){
          if( err ) return next( err );

          ready( data );
        });
    },

    insert : function( args, next, ready ){
      var new_category = new Category( { name : args.name } );

      new_category.save( function(){
        ready();
      });
    },

    update : function( args, next, ready ){
      this.findOneAndUpdate({
        _id    : args.category_id,
      }, args.update_data, function( err, category ){
        if( err ) return next( err );

        ready( category );
      });

    },

    findById : function( args, next, not_found, ready ){
      if( !ready ){
        ready = not_found;
        not_found = function(){
          next( 'Category not found' );
        };
      }

      this.find().
        where( '_id' ).equals( args.category_id ).
        limit( 1 ).
        exec( function( err, data ){
          if( err ) return next( err );
          if( !data.length ) return not_found();

          ready( data[ 0 ] );
        });
    }
  }
}