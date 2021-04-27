<?php

namespace amoAPI\Http\HttpClass;

use amoAPI\Data\Datenbank as Datenbank;

class Http
{
    private $link = null;
    private $Httpheaders = null;
    private $requestData = null;
    private $errors = [
        400 => 'Bad request',
        401 => 'Unauthorized',
        403 => 'Forbidden',
        404 => 'Not found',
        500 => 'Internal server error',
        502 => 'Bad gateway',
        503 => 'Service unavailable',
    ];

    function __construct($link = null, $Httpheaders = null)
    {
        $this->requestData = new Datenbank();

        $this->link = $link;
        $this->Httpheaders = $Httpheaders;
    }

    public function sendRequest($AusfuhrDaten = null, $method = 'POST')
    {
        /**
         * Нам необходимо инициировать запрос к серверу.
         * Воспользуемся библиотекой cURL (поставляется в составе PHP).
         * Вы также можете использовать и кроссплатформенную программу cURL, если вы не программируете на PHP.
         */
        $curl = curl_init(); //Сохраняем дескриптор сеанса cURL

        /** Устанавливаем необходимые опции для сеанса cURL  */
        curl_setopt($curl,CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl,CURLOPT_USERAGENT,'amoCRM-oAuth-client/1.0');
        curl_setopt( $curl,CURLOPT_URL, $this->link );
        curl_setopt($curl,CURLOPT_HTTPHEADER, $this->Httpheaders);
        curl_setopt($curl,CURLOPT_HEADER, false);
        curl_setopt($curl,CURLOPT_CUSTOMREQUEST, $method);

        if ( $AusfuhrDaten ) curl_setopt( $curl,CURLOPT_POSTFIELDS, json_encode( $AusfuhrDaten ) );

        curl_setopt($curl,CURLOPT_SSL_VERIFYPEER, 1);
        curl_setopt($curl,CURLOPT_SSL_VERIFYHOST, 2);

        //Инициируем запрос к API и сохраняем ответ в переменную
        $out = curl_exec($curl);
        $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        curl_close($curl);

        /** 
         * Теперь мы можем обработать ответ, полученный от сервера.
         * Это пример. Вы можете обработать данные своим способом.
        */

        $code = (int)$code;

        try
        {
            // Если код ответа не успешный - возвращаем сообщение об ошибке  
            if ( $code < 200 || $code > 204 )
            {
                throw new \Exception( isset( $this->errors[ $code ] ) ? $this->errors[ $code ] : 'Undefined error', $code );
            }
        }
        catch( \Exception $e )
        {
            \file_put_contents( 'serverQuery_error.txt', "Error:\r\n", FILE_APPEND );
            \file_put_contents( 'serverQuery_error.txt', "Errorscode:" . $e->getMessage() . "\r\n" . $e->getCode() . "\r\n", FILE_APPEND );
            \file_put_contents( 'serverQuery_error.txt', "Serveranfragelink:\r\n" . $this->link . "\r\n", FILE_APPEND );
            \file_put_contents( 'serverQuery_error.txt', "Ausfuhrdaten:\r\n", FILE_APPEND );
            \file_put_contents( 'serverQuery_error.txt', \print_r( $out, true ) . "\r\n", FILE_APPEND );

            return false;
        }

        /**
         * Данные получаем в формате JSON, поэтому, для получения читаемых данных,
         * нам придётся перевести ответ в формат, понятный PHP
        */

        return \json_decode( $out, true );
    }

    public function accessTokenVerification($ServerAnfrageDaten)
    {
        if ((time() >= (int)$ServerAnfrageDaten['when_expires']))
        {
            //echo "token ist verlauf\r\n";
            return $this->accessTokenUpdate($ServerAnfrageDaten);
        }

        return $ServerAnfrageDaten;
    }

    public function __set($property, $value)
    {
        switch ($property) {
            case 'link':
                $this->link = $value;
                break;

            case 'Httpheaders':
                $this->Httpheaders = $value;
                break;
        }
    }

    /* =============================================================================== */

    private function accessTokenUpdate($ServerAnfrageDaten)
    {
        //Формируем URL для запроса
        $this->link = 'https://' . $ServerAnfrageDaten['subdomain'] . '.amocrm.ru/oauth2/access_token';

        //Формируем Httpheaders для запроса
        $this->Httpheaders = [
            'Content-Type:application/json'
        ];

        /** Соберем данные для запроса */
        $data = [
            'client_id' => $ServerAnfrageDaten['client_id'],
            'client_secret' => $ServerAnfrageDaten['client_secret'],
            'grant_type' => 'refresh_token',
            'refresh_token' => $ServerAnfrageDaten['refresh_token'],
            'redirect_uri' => $ServerAnfrageDaten['redirect_uri'],
        ];
        
        $response = $this->sendRequest($data);

        $response['when_expires'] = time() + $response['expires_in'] - 400;
        $response['client_id'] = $ServerAnfrageDaten['client_id'];
        $response['client_secret'] = $ServerAnfrageDaten['client_secret'];
        $response['redirect_uri'] = $ServerAnfrageDaten['redirect_uri'];
        $response['subdomain'] = $ServerAnfrageDaten['subdomain'];

        $this->requestData->setData('requestData', $response);

        //echo "token update \r\n";

        return $response;
    }
}