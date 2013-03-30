var mailer = require( LIB_DIR + 'mailer' );
var crypt  = require( LIB_DIR + 'crypt' );

module.exports = {

  statics : {

    insert : function ( args, next, created ){
      var new_user = new this({
        email    : args.email,
        password : args.password
      });

      new_user.save( function ( err, user, count ){
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
    },

    login : function ( args, next, not_found, failed, not_verified, locked, success ){
      var self = this;

      crypt.hash_password( args.password, function ( err, encrypted ){
        if( err ) return next( err );

        self.findOne({
          email : args.email
        }, function ( err, user ){
          if( err )                        return next( err );
          if( !user )                      return not_found();
          if( user.is_locked )             return locked();
          //if( !user.is_verified ) return not_verified();
          if( user.password === encrypted ) return success( user );

          user.pwd_try_error += 1;

          if( user.pwd_try_error >= 3 ){
            user.is_locked = true;
          }

          user.save( function ( err, user, count ){
            if( err ) return next( err );

            return failed();
          });
        });
      });
    },

    verify : function ( args, next, success, failed ){
      this.findOne({
        email       : args.email,
        verify_code : args.verify_code
      }, function ( err, user ){
        if( err )   return next( err );
        if( !user ) return failed();

        user.is_verified = true;
        user.verify_code = '';
        user.save( function ( err, user, count ){
          if( err ) return next( user );

          success( user );
        })
      });
    },

    reset_password : function ( args, next, invalid_user, success ){
      var self = this;

      this.findOne({
        email : args.email
      }, function ( err, user ){
        if( err )   return next( err );
        if( !user ) return invalid_user();

        var new_password = UTILS.uid( 12 );

        crypt.hash_password( new_password,
          function ( err, encrypted ){
            if( err ) return next( err );

            user.password = encrypted;
            user.save( function ( err, user, count ){
              if( err ) return next( err );

              mailer({
                template : 'user_reset_password',
                to       : user.email,
                locals   : {
                  user         : user,
                  new_password : new_password
                }
              });

              success( user );
            });
        });
      });
    },

    index : function ( args, next, success ){
      var page_size  = args.page_size || 0;
      var page_no    = args.page_no || 1;
      var page_index = page_no - 1;
      var self       = this;

      this.find().
        select( '-password' ).
        sort( 'email' ).
        skip( page_index * page_size ).
        limit( page_size ).
        exec( function ( err, users ){
          if( err ) return next( err );

          self.count( function ( err, count ){
            if( err ) return next( err );
            if( !page_size ) page_size = count;

            var current_page_no = page_index + 1;
            var max_page_no     = Math.ceil( count / page_size );

            success( users, page_size, current_page_no, max_page_no );
          })
        });
    },

    update_props : function ( args, next, success ){
      var self        = this;
      var user_id     = args.user_id;
      var update_data = args.update_data;
      var put_data    = function( user ){
        if( update_data.hasOwnProperty( 'email' )){
          user.email = update_data.email;
        }
        if( update_data.hasOwnProperty( 'first_name' )){
          user.first_name = update_data.first_name;
        }
        if( update_data.hasOwnProperty( 'last_name' )){
          user.last_name = update_data.last_name;
        }
        if( update_data.hasOwnProperty( 'is_locked' )){
          user.is_locked = update_data.is_locked;
        }
        if( update_data.hasOwnProperty( 'pwd_try_error' )){
          user.pwd_try_error = update_data.pwd_try_error;
        }
      };

      if( !update_data.is_locked ){
        update_data.pwd_try_error = 0;
      }

      this.fetch_by_id({ user_id : args.user_id }, next,
        function ( user ){
          if( !user ) return next();

          put_data( user );
          user.save(
            function ( err, updated_user ){
              if( err ) return next( err );

              success( updated_user );
            });
        });
    },

    change_password : function ( args, next, auth_fail, success ){
      var self    = this;
      var user_id = args.user_id;

      crypt.hash_password( args.password,
        function ( err, old_password_encrypted ){
          if( err ) return next( err );

          crypt.hash_password( args.new_password,
            function ( err, new_password_encrypted ){
              if( err ) return next( err );

              self.findOne().
                select( 'password' ).
                where( '_id' ).equals( user_id ).
                exec( function ( err, user ){
                  if( err ) return next( err );
                  if( old_password_encrypted !== user.password ){
                    return auth_fail();
                  }

                  user.password = new_password_encrypted;
                  user.save( function ( err, user ){
                    if( err ) return next( err );

                    success( user );
                  });
                });
            });
      });
    },

    email_to_id : function ( email, next, failed, success ){
      failed = failed || function (){};

      this.findOne().
        where( 'email' ).equals( email ).
        select( '_id' ).
        exec( function ( err, user ){
          if( err )  return next( err );
          if( user ) return success( user._id );

          failed();
        });
    },

    fetch_by_id : function ( args, next, success ){
      this.find().
        where( '_id' ).equals( args.user_id ).
        limit( 1 ).
        exec( function ( err, user, count ){
          if( err ) return next( err );

          success( user[ 0 ]);
        });
    },

    delete_by_id : function ( args, next, success ){
      this.fetch_by_id({ user_id : args.user_id }, next,
        function( user ){
          if( !user ) return next();

          user.remove( function( err ){
            if( err ) return next( err );

            success();
          });
        });
    }
  }
}
