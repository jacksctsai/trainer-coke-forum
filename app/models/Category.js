
module.exports = {

  statics : {

    index : function( args, next, success ){
      this.find().
        sort( 'order' ).
        exec( function( err, categories ){
          if( err ) return next( err );

          success( categories );
        });
    },

    simple_index : function( args, next, success ){
      this.
        find().
        select( '_id name' ).
        sort( 'order' ).
        exec( function( err, data ){
          if( err ) return next( err );

          success( data );
        });
    },

    insert : function( args, next, success ){
      var new_category = new this({ name : args.name });

      new_category.save( function( err, inserted ){
        if( err ) return next( err );

        success( inserted );
      });
    },

    update_props : function( args, next, success ){
      var update_data = args.update_data;

      this.findById( args.category_id,
        function( err, category ){
          if( err )       return next( err );
          if( !category ) return next();

          if( update_data.hasOwnProperty( 'name' )){
            category.name = update_data.name;
          }
          if( update_data.hasOwnProperty( 'order' )){
            category.order = update_data.order;
          }

          category.save(
            function( err, updated ){
              if( err ) return next( err );

              success( updated );
            });
        });
    }
  }
}