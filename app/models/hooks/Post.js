
module.exports = {
  keep_board_update : function (){
    var Board    = Model( 'Board' );
    var Post     = Model( 'Post' );
    var board_id = this.board;

    Post.count({ board : board_id },
      function ( err, count ){
        Board.findOneAndUpdate(
          { _id         : board_id },
          { posts_count : count },
          function (){}
        );
      });
  }
};
