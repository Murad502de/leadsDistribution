<?php

namespace amoAPI\Auth\OAuthClass;

use amoAPI\Http\HttpClass\Http as Http;
use amoAPI\Data\Datenbank as Datenbank;

class OAuth extends Http
{
    // Формируем массив авторизации
    private $oAuthDaten = [
        'client_id' => null,
        'client_secret' => null,
        'grant_type' => 'authorization_code',
        'code' => null,
        'redirect_uri' => null,
        'subdomain' => null
    ];

    private $AuthData = null;

    function __construct($OAuthParam = null)
    {
        //Формируем URL для запроса
        $link = 'https://' . $OAuthParam['subdomain'] . '.amocrm.ru/oauth2/access_token';

        //Формируем Httpheaders для запроса
        $Httpheaders = [
            'Content-Type:application/json'
        ];

        parent::__construct( $link, $Httpheaders );

        $this->AuthData = new Datenbank();

        $this->oAuthDaten['client_id'] = $OAuthParam['client_id'];
        $this->oAuthDaten['client_secret'] = $OAuthParam['client_secret'];
        $this->oAuthDaten['code'] = $OAuthParam['code'];
        $this->oAuthDaten['redirect_uri'] = $OAuthParam['redirect_uri'];
        $this->oAuthDaten['subdomain'] = $OAuthParam['subdomain'];
    }

    public function auth()
    {
        $response = $this->sendRequest( $this->oAuthDaten );

        if ( !$response ) return false; // error bei der Authorisation

        $response['when_expires'] = time() + $response['expires_in'] - 400;
        $response['client_id'] = $this->oAuthDaten['client_id'];
        $response['client_secret'] = $this->oAuthDaten['client_secret'];
        $response['redirect_uri'] = $this->oAuthDaten['redirect_uri'];
        $response['subdomain'] = $this->oAuthDaten['subdomain'];

        $this->AuthData->setData( 'requestData__' . $this->oAuthDaten['subdomain'], $response );

        return $response;
    }
}