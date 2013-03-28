
module.exports = {
  keep_board_update : function(){
    var Board = Model( 'Board' );
    var Post  = Model( 'Post' );
    var self  = this;

    Post.count( { board : self.board }, function( err, count ){
      Board.find( { _id : self.board } );
      Board.findOneAndUpdate(
        { _id : self.board },
        { posts_count : count },
        function(){}
      );
    });
  }
};
