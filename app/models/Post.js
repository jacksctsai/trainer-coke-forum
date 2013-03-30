
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

    show : function( id, next, ready ){
      var self = this;

      this.fetch_by_id( id,
        function( err, post ){
          if( err ) return next( err );

          self.find().
            where( 'reply_to' ).eq( id )
            sort( 'create_at' ).
            lean().
            exec( function( err, reply_posts, count ){
              if( err ) return next( err );

              ready({
                main_post   : post,
                reply_posts : reply_posts
              });
            })
        });
    },

    search : function( keyword, next, ready ){
      var pat        = new RegExp( keyword, 'i' );
      var conditions = [
        { title : pat },
        { body  : pat },
        { email : pat }
      ];

      this.find().
        or( conditions ).
        select( 'title, user_id, board, reply_to' ).
        exec( function( err, posts, count) {
          if( err ) return next( err );

          ready( posts );
        });
    },

    insert : function( args, next, ready ){
      var Post     = this;
      var new_post = new Post({
        title   : args.title,
        body    : args.body,
        board   : args.board,
        user_id : args.user_id
      });

      new_post.save( function( err, post ){
        if( err ) return next( err );

        ready( post );
      });
    },

    update_props : function( args, next, ready ){
      var post_id     = args.post_id;
      var update_data = args.update_data;

      this.fetch_by_id({ post_id : post_id }, next, next,
        function( post ){
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

            ready( updated );
          });
        });
    },

    fetch_by_id : function( args, next, not_found, ready ){
      var post_id = args.post_id;

      if( !ready ){
        ready     = not_found;
        not_found = function(){};
      }

      this.find().
        where( '_id' ).equals( post_id ).
        limit( 1 ).
        exec( function( err, post ){
          if( err )          return next( err );
          if( !post.length ) return not_found();

          ready( post[ 0 ]);
        });
    }
  }
};
