
module.exports = {

  statics : {

    index : function( args, next, ready ){
      this.find( function( err, categories, count ){
        if( err ) return next( err );

        ready( categories );
      });
    },

    simple_index : function( args, next, ready ){
      this.
        find().
        select( '_id name' ).
        sort( 'order' ).
        exec( function( err, data, count ){
          if( err ) return next( err );

          ready( data );
        });
    },

    insert : function( args, next, ready ){
      var new_category = new this({ name : args.name });

      new_category.save( function(){
        ready();
      });
    },

    update_props : function( args, next, ready ){
      var update_data = args.update_data;

      this.fetch_by_id({ category_id : args.category_id }, next, next,
        function( category ){
          if( update_data.hasOwnProperty( 'name' )){
            category.name = update_data.name;
          }
          if( update_data.hasOwnProperty( 'order' )){
            category.order = update_data.order;
          }

          category.save(
            function( err, updated ){
              if( err ) return next( err );

              ready( updated );
            });
        });
    },

    fetch_by_id : function( args, next, not_found, ready ){
      if( !ready ){
        ready     = not_found;
        not_found = function(){};
      }

      this.find().
        where( '_id' ).equals( args.category_id ).
        limit( 1 ).
        exec( function( err, data ){
          if( err )          return next( err );
          if( !data.length ) return not_found();

          ready( data[ 0 ]);
        });
    }
  }
}