module.exports = {

  emailCase : function ( value ){
    var tmp    = value.split( '@' );
    var name   = tmp[ 0 ];
    var domain = tmp[ 1 ] ? '@' + tmp[ 1 ].toLowerCase() : '';

    return name + domain;
  },

  toBooleanStrict : function ( value ){
    if( value === undefined )             return undefined;
    if( value == '1' || value == 'true' ) return true;

    return false;
  }
};
