
module.exports = {

  statics : {

    index : function( args, next, ready ){
      this.find( function( err, categories, count ){
        if( err ) return next( err );

        ready( categories );
      });
    }
  }
}
