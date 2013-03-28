var moment = require( 'moment' );

module.exports = function ( app ){
  app.helpers({

    selected : function ( target, current ){
      return target === current ? 'selected' : '';
    },

    val : function ( obj, prop ){
      return obj === undefined ? '' : obj[ prop ];
    },

    date : function ( date, format ){
      return moment( date ).format( format || 'MMM Do YYYY, h:m:s' );
    },

    exist : function ( arg ){
      return arg || '';
    },

    show_form_err : function ( type ){
      return this.get_form_err()[ type ] ?
        '<p class="error">' + this.get_form_err()[ type ][ 0 ] + '</p>' :
        '';
    },

    display_pager : function ( args ){
      var elements = [];
      var null_function   = function(){};
      var current_page_no = args.current_page_no || 1;
      var max_page_no     = args.max_page_no || 1;
      var first_page      = args.first_page || null_function;
      var previous_page   = args.previous_page || null_function;
      var next_page       = args.previous_page || null_function;
      var last_page       = args.last_page || null_function;
      var current_page    = args.current_page || null_function;
      var page            = args.page || null_function;
      var start_page_no   = Math.max( 1, current_page_no - 5 );
      var end_page_no     = Math.min( current_page_no + 5, max_page_no);
      var prev_page_no    = Math.max( start_page_no, current_page_no - 1 );
      var next_page_no    = Math.min( current_page_no + 1, end_page_no );

      first_page( start_page );
      previous_page( prev_page_no );
      for (var i = start_page + 1; i < end_page ; i++ ) {
        page( i );
      };
      next_page( next_page_no );
      last_page( end_page );
    },

    pager: function( current_page_no, max_page_no ){
      max_page_no         = max_page_no > 0 ? max_page_no : 1;
      current_page_no     = Math.min( current_page_no, max_page_no );
      var start_page_no   = Math.max( 1, current_page_no - 5 );
      var end_page_no     = Math.min( current_page_no + 5, max_page_no);
      var prev_page_no    = Math.max( start_page_no, current_page_no - 1 );
      var next_page_no    = Math.min( current_page_no + 1, end_page_no );
      var elements        = [];

      elements.push( '<a href="?page=1" title="First page">«</a>' );
      elements.push( '<a href="?page=' + prev_page_no + '" title="Previous page">‹</a>' );
      for( var i = start_page_no; i <= end_page_no ; i++ ){
        if( i != current_page_no ){
          elements.push( '<a href="?page=' + i + '" title="Page ' + i + '">' + i + '</a>' );
        } else {
          elements.push( '<span>' + i + '</span>' );
        }
      };
      elements.push( '<a href="?page=' + next_page_no + '" title="Next page">›</a>' );
      elements.push( '<a href="?page=' + max_page_no + '" title="Last page">»</a>' );

      return elements.join('\n');
    }
  });

  app.dynamicHelpers({
    messages : require( 'express-messages' ),

    get_form_err : function ( req, res ){
      return function (){
        return req.form ?
          req.form.getErrors() : {};
      }
    },

    loggedin : function( req, res ){
      return req.session.user_id;
    }

  });
};
