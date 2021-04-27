<?php
header('Content-type: text/html');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");
header("HTTP/1.0 200 OK");

use amoAPI\Auth\OAuthClass\OAuth as OAuth;

function __autoload($class)
{
    $class = str_replace("\\", "/", $class);
    require_once '../' . $class . '.php';
}

$filename = 'data/status.json';

if ( file_exists($filename) )
{
    $status = \json_decode( \file_get_contents($filename), true );

    if ( $status['status'] )
    {
        echo 200;
    }
    else
    {
        echo 4041;
    }
}
else
{
    file_put_contents($filename, \json_encode(['status' => true]));

    $amoDaten = $_POST['amoDaten'];

    /*==================================

    $users = $_POST['amoDaten']['users'];
    $userStatus = [];

    foreach ($users as $key => $value)
    {
        $userStatus[$key] = [
            'name' => $value,
            'status' => false
        ];
    }

    file_put_contents('data/userStatus.json', \json_encode($userStatus));

    =====================================*/

    $OAuthParam = [
        'client_id' => $amoDaten['client_id'],
        'client_secret' => $amoDaten['secret_code'],
        'code' => $amoDaten['auth_code'],
        'redirect_uri' => $amoDaten['redirect_uri'],
        'subdomain' => $amoDaten['subdomain'],
    ];

    //file_put_contents( 'test.txt', \print_r($OAuthParam, true) );
    
    $Integration = new OAuth($OAuthParam);
    $AuthResult = $Integration->auth();

    // Authorisationstatus prüfen
    if ( !$AuthResult )
    {
        echo 401;
    }
    else
    {
        echo 200;
    }
}