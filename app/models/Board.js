var Flow = require( 'node.flow' );
var User = Model( 'User' );

module.exports = {

  statics : {

    index : function ( args, next, ready ){
      this.find().
        populate( 'category', 'name' ).
        populate( 'admin',    'first_name email' ).
        exec( function ( err, boards, count ){
          if( err ) return next( err );

          return ready( boards );
        });
    },

    show : function ( args, next, ready ){
      var page_size  = args.page_size || 0;
      var page_no    = args.page_no || 1;
      var page_index = page_no - 1;
      var Post       = Model( 'Post' );
      var args       = { board_id : args.board_id };

      this.fetch_by_id( args, next, function ( board ){
        Post.find().
          where( 'board'     ).equals( args.board_id ).
          where( 'reply_to'  ).exists( false ).
          sort( '-update_at' ).
          skip( page_index * page_size ).
          limit( page_size ).
          populate( 'user_id', 'email' ).
          exec( function ( err, posts, count ){
            if( err ) return next( err );

            ready({
              page_no   : page_no,
              page_size : page_size,
              max_page  : Math.ceil( board.posts_count / page_size ),
              board     : board,
              posts     : posts
            });
          });
      });
    },

    insert : function ( args, next, admin_error, success ){
      var self      = this;
      var new_board = new self( args.insert_data );
      var do_insert = function ( _id ) {
        new_board.admin = _id;

        new_board.save( function ( err, board ){
          if( err ) return next( err );

          success( board );
        });
      };

      if( !args.admin ) return do_insert();

      User.findIdByEmail( args.admin, next, admin_error, do_insert );
    },

    update_props : function ( args, next, admin_error, success ){
      var self        = this;
      var flow        = new Flow();
      var update_data = args.update_data;
      var do_update = function (){
        self.find().
          where( '_id' ).equals( args.board_id ).
          limit( 1).
          exec( function( err, boards ){
            if( err ) return next( err );

            var board = boards[ 0 ];

            if( update_data.hasOwnProperty( 'name' )){
              board.name = update_data.name;
            }
            if( update_data.hasOwnProperty( 'admin' )){
              board.admin = update_data.admin || null;
            }
            if( update_data.hasOwnProperty( 'order' )){
              board.order    = update_data.order;
            }
            if( update_data.hasOwnProperty( 'category' )){
              board.category = update_data.category;
            }
            if( update_data.hasOwnProperty( 'posts_count' )){
              board.posts_count = update_data.posts_count;
            }

            board.save( function ( err, updated ){
              if( err ) return next( err );

              success( board );
            });
          });
      };

      if( update_data.hasOwnProperty( 'admin' ) && !update_data.admin ){
        return do_update();
      }

      User.email_to_id( update_data.admin, next, admin_error,
        function ( user_id ){
          update_data.admin = user_id;

          do_update();
        });
    },

    categorized_boards : function ( next, ready ){
      var Category = Model( 'Category' );
      var Board    = this;
      var flow     = new Flow();
      var output   = [];

      Category.find().
        select( '_id, name' ).
        sort( 'order' ).
        lean().
        exec( function ( err, docs ){
          var queryBoard = function ( category, ready ){
            Board.find().
              select( 'name posts_count admin' ).
              where( 'category' ).equals( category._id ).
              sort( 'order' ).
              populate( 'admin', 'first_name' ).
              exec( function ( err, docs ){
                if( err ) return next( err );

                output.push({
                  name   : category.name,
                  boards : docs
                });

                ready();
              });
          };

          docs.forEach( function ( category ){
            flow.series( queryBoard, category );
          });

          flow.end( function (){
            ready( output );
          });
        });
    },

    fetch_by_id : function ( args, next, not_found, ready ){
      var board_id = args.board_id;

      if( !ready ){
        ready     = not_found;
        not_found = function (){};
      }

      this.
        find().
        where( '_id' ).equals( board_id ).
        populate( 'admin', 'email' ).
        limit( 1 ).
        exec( function ( err, data ){
          if( err )          return next( err );
          if( !data.length ) return not_found();

          ready( data[ 0 ]);
        });
    }
  },

  methods : {}
};