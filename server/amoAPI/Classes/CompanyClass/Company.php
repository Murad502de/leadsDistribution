<?php

namespace amoAPI\Classes\CompanyClass;

use amoAPI\Http\HttpClass\Http as Http;
use amoAPI\Data\Datenbank as Datenbank;

class Company
{
    private $Http = null;
    private $CompanyDatenbank = null;
    private $requestData = null;

    function __construct( $subdomain = null )
    {
        $this->CompanyDatenbank = new Datenbank();
        $this->requestData = $this->CompanyDatenbank->getData( 'requestData__' . $subdomain );

        $this->Http = new Http();

        //echo "Company\r\n";
    }

    public function create(){}
    public function delete(){}
    public function update(){}
    public function addToLead(){}
    public function addNote(){}
    public function addTask(){}

    public function getById( $id = null )
    {
        if ( !$id ) return false;

        // Accesstoken prufen und aktualisieren, wenn es benotigt ist 
        $this->requestData = $this->Http->accessTokenVerification($this->requestData);
        
        //Формируем Httpheaders для запроса
        $this->Http->Httpheaders = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->requestData['access_token']
        ];

        //Формируем URL для запроса
        $this->Http->link = 'https://' . $this->requestData['subdomain'] . '.amocrm.ru/api/v4/companies/' . $id;

        // Serveranfrage ausführen
        return $this->Http->sendRequest( false, 'GET' );
    }

    public function updateN( $updateData = null )
    {
        if ( !$updateData ) return false;

        \file_put_contents( 'data/Companies_update.txt', \print_r( $updateData, true ) );

        // Accesstoken prufen und aktualisieren, wenn es benotigt ist 
        $this->requestData = $this->Http->accessTokenVerification($this->requestData);
            
        //Формируем Httpheaders для запроса
        $this->Http->Httpheaders = [
            'Content-Type: application/json-patch+json',
            'Authorization: Bearer ' . $this->requestData['access_token']
        ];

        //Формируем URL для запроса
        $this->Http->link = 'https://' . $this->requestData['subdomain'] . '.amocrm.ru/api/v4/companies';

        // Serveranfrage ausführen
        return $this->Http->sendRequest( $updateData, 'PATCH' );
    }
}