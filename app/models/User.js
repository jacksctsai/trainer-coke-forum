var mailer = require( LIB_DIR + 'mailer' );
var crypt  = require( LIB_DIR + 'crypt' );

module.exports = {
  statics : {

    insert : function( args, next, already_used, created ){
      var self = this;

      this.findOne({
        email: args.email
      }, function( err, user ){
        if( err ) return next( err );
        if( user ) return already_used();

        var new_user = new self({
          email    : args.email,
          password : args.password
        });

        new_user.save( function( err, user, count ){
          if( err ) return next( err );

          mailer({
            template : 'verify_user',
            to       : user.email,
            locals   : {
              user   : user
            }
          });

          created( user );
        });
      })
    },

    login : function( args, next, not_found, failed, not_verified, locked, success ){
      var password = crypt.hash_password( args.password );
      this.findOne({
        email : args.email
      }, function( err, user ){

        if( err )   return next( err );
        if( !user ) return not_found();
        if( user.is_locked ) return locked();
        //if( !user.is_verified ) return not_verified();
        if( user.password === password ) return success( user );

        user.pwd_try_error += 1;

        if( user.pwd_try_error >= 3 ){
          user.is_locked = true;
        }

        user.save( function( err, user, count ){
          if( err ) return next( err );

          return failed();
        });
      });
    },

    verify : function( args, next, success, failed ){
      this.findOne({
        email : args.email,
        verify_code : args.verify_code
      }, function( err, user ){
        if( err )   return next( err );
        if( !user ) return failed();

        user.is_verified = true;
        user.verify_code = '';
        user.save( function( err, user, count ){
          if( err ) return next( user );
          success( user );
        })
      });

    },

    reset_password : function( args, next, invalid_user, success ){
      var self = this;

      this.findOne({
        email : args.email
      }, function( err, user ){
        if( err )   return next( err );
        if( !user ) return invalid_user();

        user.password = crypt.hash_password( UTILS.uid( 12 ));
        user.save( function( err, user, count ){
          if( err ) return next( err );

          mailer({
            template : 'user_reset_password',
            to       : user.email,
            locals   : { user : user }
          });

          success( user );
        });
      });
    },

    index : function( args, next, success ){
      var page_size  = args.page_size || 0;
      var page_no    = args.page_no || 1;
      var page_index = page_no - 1;
      var self       = this;

      this.find().
        select( '-password' ).
        sort( 'email' ).
        skip( page_index * page_size ).
        limit( page_size ).
        exec( function( err, users ){
          if( err ) return next( err );

          self.count( function( err, count ){
            if( err ) return next( err );
            if( !page_size ) page_size = count;

            var current_page_no = page_index + 1;
            var max_page_no = Math.ceil( count / page_size );
            success( users, page_size, current_page_no, max_page_no );
          })
        });
    },

    update_profile : function( args, next, email_conflict, success ){
      var self        = this;
      var user_id     = args.user_id;
      var update_data = args.update_data;

      if( !update_data.is_locked ){
        update_data.pwd_try_error = 0;
      }

      this.find().
        where( 'email' ).equals( update_data.email ).
        where( '_id' ).ne( user_id ).
        select( { _id : 1 } ).
        exec( function( err, users, count ){
          if( err ) return next( err );
          if ( count ) return email_conflict();

          self.findOneAndUpdate({ _id : user_id }, update_data,
            function( err, updated_user ){
              if( err ) return next( err );
              if( !updated_user ) return next( 'User not found.' );

              return success( updated_user );
            });
        });
    },

    change_password : function( args, next, password_missmatch, success ) {
      var user_id = args.user_id;
      var old_password = crypt.hash_password( args.password );
      var new_password = crypt.hash_password( args.new_password );

      this.findOne().
        select( 'password' ).
        where( '_id' ).equals( user_id ).
        exec( function( err, user ){
          if( err ) return next( err );
          if( !user ) return next('User not found' );
          if( old_password !== user.password ) return password_missmatch();

          user.password = new_password;
          user.save( function( err, user ){
            if( err ) return next( err );

            success( user );
          });
        });
    },

    findIdByEmail : function( email, next, success, failed ){
      failed = failed || function(){};

      this.findOne().
        where( 'email' ).equals( email ).
        select( '_id' ).
        exec( function( err, user ){
          if( err ) return next( err );
          if( user ) return success( user._id );

          return failed();
        });
    },

    findById : function( args, next, success ){
      this.find().
        where( '_id' ).equals( args.user_id ).
        limit( 1 ).
        exec( function( err, user, count ){
          if( err ) return next( err );

          success( user[ 0 ] );
        });
    }

  }
}
