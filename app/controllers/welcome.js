var Class = require( 'node.class' );
var Board = Model( 'Board' );

module.exports = Class.extend({

  index : function ( req, res, next ){
    Board.categorized_boards( next, function( data ){
      res.render( 'welcome/index', {
        categories : data
      });
    });
  }
});
