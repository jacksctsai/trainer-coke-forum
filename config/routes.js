module.exports = function ( map ){
  map.get(  '/', 'welcome#index' );

  map.get(  '/signup', 'users#new' );
  map.post( '/signup', 'users#create' );

  map.get(  '/login',  'sessions#new' );
  map.post( '/login',  'sessions#create' );
  map.get(  '/logout', 'sessions#destroy' );

  map.get(  '/reset-password',  'passwords#new' );
  map.post( '/reset-password',  'passwords#create' );
  map.get(  '/change-password', 'passwords#edit' );
  map.post( '/change-password', 'passwords#update' );

  map.get(  '/update-profile', 'profiles#edit' );
  map.post( '/update-profile', 'profiles#update' );

  map.resources( 'users', {
    only : [ 'index', 'edit', 'update', 'destroy' ]
  });

  map.resources( 'boards', {
    only : [ 'index', 'new', 'create', 'edit', 'update', 'show' ]
  }, function( board ){
    board.resources( 'posts', {
      only : [ 'new', 'create' ]
    });
  });

  map.resources( 'categories', {
    only : [ 'index', 'new', 'create', 'edit', 'update' ]
  });

  map.resources( 'posts', {
    only : [ 'edit', 'update', 'show' ]
  });
};
