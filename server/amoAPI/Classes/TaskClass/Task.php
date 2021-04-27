<?php

namespace amoAPI\Classes\TaskClass;

use amoAPI\Http\HttpClass\Http as Http;
use amoAPI\Data\Datenbank as Datenbank;

class Task
{
    private $Http = null;
    private $TaskDatenbank = null;
    private $requestData = null;

    function __construct()
    {
        $this->TaskDatenbank = new Datenbank();
        $this->requestData = $this->TaskDatenbank->getData('requestData');

        $this->Http = new Http();

        //echo "Task\r\n";
    }

    public function updateN( $updateData = null )
    {
        if ( !$updateData ) return false;

        \file_put_contents( 'data/Task_update.txt', \print_r( $updateData, true ) );

        // Accesstoken prufen und aktualisieren, wenn es benotigt ist 
        $this->requestData = $this->Http->accessTokenVerification($this->requestData);
            
        //Формируем Httpheaders для запроса
        $this->Http->Httpheaders = [
            'Content-Type: application/json-patch+json',
            'Authorization: Bearer ' . $this->requestData['access_token']
        ];

        //Формируем URL для запроса
        $this->Http->link = 'https://' . $this->requestData['subdomain'] . '.amocrm.ru/api/v4/tasks';

        // Serveranfrage ausführen
        return $this->Http->sendRequest( $updateData, 'PATCH' );
    }

    public function getByQuery( $query = null )
    {
        if ( !$query ) return false;

        // Accesstoken prufen und aktualisieren, wenn es benotigt ist 
        $this->requestData = $this->Http->accessTokenVerification( $this->requestData );
        
        //Формируем Httpheaders для запроса
        $this->Http->Httpheaders = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->requestData[ 'access_token' ]
        ];

        //Формируем URL для запроса
        $this->Http->link = 'https://' . $this->requestData[ 'subdomain' ] . '.amocrm.ru/api/v4/tasks?' . $query;

        // Serveranfrage ausführen
        return $this->Http->sendRequest( false, 'GET' );
    }
}