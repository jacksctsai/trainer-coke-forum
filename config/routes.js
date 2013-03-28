module.exports = function ( map ){
  map.get(  '/'                    , 'welcome#index' );
  map.get(  '/signup'              , 'users#new' );
  map.post( '/signup'              , 'users#create' );
  map.get(  '/login'               , 'sessions#new' );
  map.post( '/login'               , 'sessions#create' );
  map.get(  '/logout'              , 'sessions#destroy' );
  map.get(  '/resetpwd'            , 'passwords#new' );
  map.post( '/resetpwd'            , 'passwords#create' );
  map.get(  '/change_password'     , 'passwords#edit' );
  map.post( '/change_password'     , 'passwords#update' );
  map.get(  '/update_profile'      , 'profiles#edit' );
  map.post( '/update_profile'      , 'profiles#update' );
  map.get(  '/users'               , 'users#index' );
  map.get(  '/user/:user/edit'     , 'users#edit' );
  map.post( '/user/:user/update'   , 'users#update' );

  map.get(  '/boards'              , 'boards#index' );
  map.get(  '/board/new'           , 'boards#new' );
  map.post( '/board/create'        , 'boards#create' );
  map.get(  '/board/:board'        , 'boards#show' );
  map.get(  '/board/:board/edit'   , 'boards#edit' );
  map.post( '/board/:board/update' , 'boards#update' );

  map.get(  '/categories'                , 'categories#index' );
  map.get(  '/category/new'              , 'categories#new' );
  map.post( '/category/create'           , 'categories#create' );
  map.get(  '/category/:category/edit'   , 'categories#edit' );
  map.post( '/category/:category/update' , 'categories#update' );

  map.get(  '/post/:post'           , 'posts#show' );
  map.get(  '/board/:board/newpost' , 'posts#new' );
  map.post( '/board/:board/newpost' , 'posts#create' );
  map.get(  '/post/:post/edit'      , 'posts#edit' );
  map.post( '/post/:post/update'    , 'posts#update' );
};
