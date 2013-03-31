
var hooks = require( MODEL_DIR + 'hooks/Post.js' );

module.exports = {

  hooks : {
    post : {
      save : [
        hooks.keep_board_update
      ]
    }
  },

  statics : {

    show : function( args, next, success ){
      var self = this;

      this.findById( args.post_id,
        function( err, post ){
          if( err )   return next( err );
          if( !post ) return success();

          self.find().
            where( 'reply_to' ).eq( id )
            sort( 'create_at' ).
            lean().
            exec( function( err, reply_posts ){
              if( err ) return next( err );

              success({
                main_post   : post,
                reply_posts : reply_posts
              });
            })
        });
    },

    search : function( keyword, next, success ){
      var pat        = new RegExp( keyword, 'i' );
      var conditions = [
        { title : pat },
        { body  : pat },
        { email : pat }
      ];

      this.find().
        or( conditions ).
        select( 'title, user_id, board, reply_to' ).
        exec( function( err, posts ) {
          if( err ) return next( err );

          success( posts );
        });
    },

    insert : function( args, next, success ){
      var new_post = new this({
        title   : args.title,
        body    : args.body,
        board   : args.board,
        user_id : args.user_id
      });

      new_post.save( function( err, post ){
        if( err ) return next( err );

        success( post );
      });
    },

    update_props : function( args, next, success ){
      var update_data = args.update_data;

      this.findById( args.post_id,
        function( err, post ){
          if( err ) return next( err );

          if( update_data.hasOwnProperty( 'title' )){
            post.title = update_data.title;
          }
          if( update_data.hasOwnProperty( 'body' )){
            post.body = update_data.body;
          }
          if( update_data.hasOwnProperty( 'board' )){
            post.board = update_data.board;
          }
          if( update_data.hasOwnProperty( 'user_id' )){
            post.user_id = update_data.user_id;
          }

          post.save( function( err, updated ){
            if( err ) return next( err );

            success( updated );
          });
        });
    }
  }
};
