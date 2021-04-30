<?php
header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");
header("HTTP/1.0 200 OK");

if ( $_GET['param'] == 'destroy' )
{
    $filename = 'data/status.json';
    $filenameSettings = 'data/settings.json';

    if ( file_exists( $filename ) )
    {
        unlink( $filename );
        unlink( $filenameSettings );
        unlink( 'data/userStatus.json' );
        
        echo 200;
    }
}

if ( $_GET[ 'param' ] == 'user' )
{
    $filename = 'data/userStatus.json';

    if ( file_exists( $filename ) )
    {
        $users = \json_decode( \file_get_contents( $filename ), true );
        $user = $users[ $_GET[ 'user' ] ];

        echo \json_encode( $user );
    }
}

if ( $_GET[ 'param' ] == 'setStatus' )
{
    $filename = 'data/userStatus.json';

    if ( file_exists( $filename ) )
    {
        $users = \json_decode(\file_get_contents($filename), true);
        
        $users[$_POST['user']]['status'] = $_POST['setStatus'] == 'off' ? false : true;

        file_put_contents($filename, \json_encode($users));

        echo 201;
    }
}

if ( $_GET[ 'param' ] == 'setSettings' )
{
    $filename = 'data/settings.json';

    //file_put_contents($filename, \json_encode(  ));
}

if ( $_GET[ 'param' ] == 'getSettings' )
{
    $filename = 'data/settings.json';

    if ( file_exists( $filename ) )
    {
        echo \file_get_contents( $filename );
    }
    else
    {
        echo 404;
    }
}