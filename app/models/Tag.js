
module.exports = {

  statics : {

    index : function( args, next, success ){
      this.find( function( err, categories ){
        if( err ) return next( err );

        success( categories );
      });
    }
  }
}
