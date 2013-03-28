var Schema = function ( Schema ){

/**
 * Module dependencies.
 * @private
 */
  var ObjectId = Schema.ObjectId;

  var Models = {
    User: new Schema({
      email         : { type : String, required : true },
      password      : { type : String, required : true },
      first_name    : { type : String, required : false },
      last_name     : { type : String, required : false },
      is_sys_admin  : { type : Boolean, default : false },
      is_locked     : { type : Boolean, default : false },
      pwd_try_error : { type : Number, default : 0 },
      verify_code   : { type : String, default : UTILS.uid.bind( UTILS, 12 ) },
      is_verified   : { type : Boolean, default : false },
      last_login    : { type : Date },
      create_at     : { type : Date, default : Date.now },
      update_at     : { type : Date, default : Date.now }
    }),

    Board: new Schema({
      name        : { type : String, required : true },
      admin       : { type : ObjectId, ref : 'User' },
      order       : { type : Number, default: 9999 },
      category    : { type : ObjectId, ref : 'Category' },
      latest_post : { type : ObjectId, ref : 'Post' },
      posts_count : { type : Number, default : 0 },
      create_at   : { type : Date, default : Date.now },
      update_at   : { type : Date, default : Date.now }
    }),

    Post : new Schema({
      title       : { type : String, required : true },
      body        : { type : String, required : true },
      user_id     : { type : ObjectId, required : true, ref : 'User' },
      board       : { type : ObjectId, required : true, ref : 'Board' },
      reply_to    : { type : ObjectId, ref : 'Post' },
      tags        : [{ type : ObjectId, ref : 'Tag' }],
      comments    : [{ type : ObjectId, ref : 'Comment' }],
      create_at   : { type : Date, default : Date.now },
      update_at   : { type : Date, default : Date.now }
    }),

    Category : new Schema({
      name        : { type : String, required : true },
      order       : { type : Number, default : 9999 },
      create_at   : { type : Date, default : Date.now },
      update_at   : { type : Date, default : Date.now }
    }),

    Tag : new Schema({
      name        : { type : String, required : true },
      create_at   : { type : Date, default : Date.now },
      update_at   : { type : Date, default : Date.now }
    }),

    test : new Schema({
      name      : { type : String, required : true, default : 'test' },
      create_at : { type : Date, default : Date.now },
      update_at : { type : Date, default : Date.now }
    })
  };

  // auto update `updated_at` on save
  Object.keys( Models ).forEach( function ( model ){
    if( Models[ model ].tree.updated_at !== undefined ){
      Models[ model ].pre( 'save', function ( next ){
        this.updated_at = this.isNew?
          this.created_at :
          Date.now();

        next();
      });
    }
  });

  return Models;
};

/**
 * Exports module.
 */
module.exports = Schema;