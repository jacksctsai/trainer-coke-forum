var Flow = require( 'node.flow' );

module.exports = {

  statics : {

    index : function( args, next, ready ){
      this.find().
        populate( 'category', 'name' ).
        populate( 'admin', 'first_name email' ).
        exec(
         function( err, boards, count) {
          if( err ) return next( err );

          return ready( boards );
        });
    },

    show : function( args, next, ready ){
      var page_size  = args.page_size || 0;
      var page_no    = args.page_no || 1;
      var page_index = page_no - 1;
      var Post       = Model( 'Post' );
      var args       = { board_id : args.board_id };

      this.findById( args, next, function( board ){
        Post.find().
          where( 'board' ).equals( args.board_id ).
          where( 'reply_to' ).exists( false ).
          sort( '-update_at' ).
          skip( page_index * page_size ).
          limit( page_size ).
          populate( 'user_id', 'email' ).
          exec( function( err, posts, count ){
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

    insert : function( args, next, admin_error, success ){
      var self = this;
      var User = Model( 'User' );
      var new_board = new self( args.insert_data );
      var flow = new Flow();

      flow.series( function( ready ){
        User.findIdByEmail( args.admin, next,
          function( _id ) {
            new_board.admin = _id;
            return ready();
          }, ready );
      });
      flow.end( function(){
        if( args.admin && !new_board.admin ) return admin_error();

        new_board.save( function( err, board ){
          if( err ) return next( err );

          return success( board );
        });
      });
    },

    update : function( args, next, admin_error, success ){
      var self  = this;
      var User  = Model( 'User' );
      var flow  = new Flow();

      args.update_data.admin = null;

      flow.series( function( ready ){
        User.findIdByEmail( args.admin, next,
          function( user_id ) {
            args.update_data.admin = admin;
            ready();
          }, ready );
      });
      flow.end( function(){
        if( args.admin && !args.update_data.admin ) return admin_error();

        args.update_data.category = args.update_data.category || null;
        console.log(args);

        self.findOneAndUpdate({ _id : args.board_id }, args.update_data,
          function( err, board ){
            if( err ) return next( err );

            success( board );
        });
      });
    },


    categorized_boards : function( next, ready ){
      var Category  = Model( 'Category' );
      var Board     = this;
      var flow      = new Flow();
      var output    = [];

      Category.find().
        select( '_id, name' ).
        sort( 'order' ).
        lean().
        exec( function( err, docs ){
          var queryBoard = function( category, ready ){
            Board.find().
              select( 'name posts_count admin').
              where( 'category' ).equals( category._id ).
              sort( 'order' ).
              populate( 'admin', 'first_name' ).
              exec( function( err, docs ){
                if( err ) return next( err );

                output.push({
                  name   : category.name,
                  boards : docs
                });
                ready();
              });
          };
          docs.forEach( function( category ){
            flow.series( queryBoard, category );
          });
          flow.end( function(){
            ready( output );
          });
        });
    },

    findById : function( args, next, not_found, ready ){
      var board_id = args.board_id;

      if( !ready ){
        ready = not_found;
        not_found = function() {
          next( 'Board not found' );
        };
      }

      this.
        find().
        where( '_id' ).equals( board_id ).
        populate( 'admin', 'email' ).
        limit( 1 ).
        exec( function( err, data ){
          if( err ) return next( err );
          if( !data.length ) return not_found();

          ready( data[ 0 ] );
        });
    }

  },

  methods : {


  }
};