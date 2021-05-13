<?php

namespace amoAPI\Classes\LeadClass;

use amoAPI\Http\HttpClass\Http as Http;
use amoAPI\Data\Datenbank as Datenbank;

class Lead
{
    private $Http = null;
    private $LeadData = null;
    private $requestData = null;

    private $name = null;
    private $createdBy = null;
    private $price = null;
    private $responsibleUserId = null;
    private $statusId = null;
    private $pipelineId = null;
    private $visitorUid = null;

    private $customFieldsValues = [];

    function __construct( $subdomain = null )
    {
        $this->LeadData = new Datenbank();
        $this->requestData = $this->LeadData->getData( 'requestData__' . $subdomain );

        $this->Http = new Http();

        //echo "Lead\r\n";
    }

    public function create()
    {
        // Accesstoken prufen und aktualisieren, wenn es benotigt ist 
        $this->requestData = $this->Http->accessTokenVerification($this->requestData);

        //Формируем URL для запроса
        $this->Http->link = 'https://' . $this->requestData['subdomain'] . '.amocrm.ru/api/v4/leads';
        
        //Формируем Httpheaders для запроса
        $this->Http->Httpheaders = [
            'Content-Type:application/json',
            'Authorization: Bearer ' . $this->requestData['access_token']
        ];

        $leadCreateData = [
            [
                "name" => $this->name,
                "created_by" => $this->createdBy ? $this->createdBy : 0,
                "price" => $this->price,
                "created_at" => time(),
                "responsible_user_id" => $this->responsibleUserId,
                "status_id" => $this->statusId,
                "pipeline_id" => $this->pipelineId,
                "visitor_uid" => $this->visitorUid ? $this->visitorUid : ''
            ]
        ];

        //echo "create: \r\n"; print_r($leadCreateData); echo "\r\n";

        $newLead = $this->Http->sendRequest($leadCreateData);

        return 0;
    }

    public function delete(){}

    public function updateN( $updateData = null )
    {
        if ( !$updateData ) return false;

        \file_put_contents( 'data/Leads_update.txt', \print_r( $updateData, true ) );

        // Accesstoken prufen und aktualisieren, wenn es benotigt ist 
        $this->requestData = $this->Http->accessTokenVerification($this->requestData);
            
        //Формируем Httpheaders для запроса
        $this->Http->Httpheaders = [
            'Content-Type: application/json-patch+json',
            'Authorization: Bearer ' . $this->requestData['access_token']
        ];

        //Формируем URL для запроса
        $this->Http->link = 'https://' . $this->requestData['subdomain'] . '.amocrm.ru/api/v4/leads';

        // Serveranfrage ausführen
        return $this->Http->sendRequest( $updateData, 'PATCH' );
    }

    public function update( $updateData = null )
    {
        if ( !$updateData ) return false;

        if ( isset( $updateData[ 'id' ] ) )
        {
            $updateData[ 'updated_at' ] = \time();

            $leadUpdateData = [ $updateData ];

            \file_put_contents( 'data/Lead_update.txt', \print_r( $leadUpdateData, true ) );

            // Accesstoken prufen und aktualisieren, wenn es benotigt ist 
            $this->requestData = $this->Http->accessTokenVerification($this->requestData);
            
            //Формируем Httpheaders для запроса
            $this->Http->Httpheaders = [
                'Content-Type: application/json-patch+json',
                'Authorization: Bearer ' . $this->requestData['access_token']
            ];

            //Формируем URL для запроса
            $this->Http->link = 'https://' . $this->requestData['subdomain'] . '.amocrm.ru/api/v4/leads';

            // Serveranfrage ausführen
            return $this->Http->sendRequest( $leadUpdateData, 'PATCH' );
        }
    }

    public function associateWithContact(){}
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
        $this->Http->link = 'https://' . $this->requestData['subdomain'] . '.amocrm.ru/api/v4/leads/' . $id . '?with=contacts';

        // Serveranfrage ausführen
        return $this->Http->sendRequest( false, 'GET' );
    }

    public function list()
    {
        $limit = 100;
        $page = 1;
        $leadList = [];

        // Accesstoken prufen und aktualisieren, wenn es benotigt ist 
        $this->requestData = $this->Http->accessTokenVerification($this->requestData);
        
        //Формируем Httpheaders для запроса
        $this->Http->Httpheaders = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->requestData['access_token']
        ];

        for (;; $page++)
        {
            usleep(500000);

            //Формируем URL для запроса
            $this->Http->link = 'https://' . $this->requestData['subdomain'] . '.amocrm.ru/api/v4/leads?limit=' . $limit . '&page=' . $page;
            
            $leadList[$page - 1] = $this->Http->sendRequest(false, 'GET');

            if (\count($leadList[$page - 1]['_embedded']['leads']) < $limit) break;


        }

        //echo "list\r\n";

        return $leadList;
    }

    public function __set($property, $value)
    {
        switch ($property) {
            case 'name':
                $this->name = $value;
                break;

            case 'createdBy':
                $this->createdBy = $value;
                break;

            case 'price':
                $this->price = $value;
                break;

            case 'responsibleUserId':
                $this->responsibleUserId = $value;
                break;

            case 'statusId':
                $this->statusId = $value;
                break;

            case 'pipelineId':
                $this->pipelineId = $value;
                break;

            case 'visitorUid':
                $this->visitorUid = $value;
                break;
            case 'customFieldsValues':
                $this->addCustomField($value);
                break;
        }
    }

    /*======================================================================*/

    private function addCustomField($item)
    {
        //echo "addCustomField \r\n";
        //print_r($item);
        //echo "\r\n";

        switch ($item['type']) {
            case 'text':
            case 'numeric':
            case 'textarea':
            case 'price':
            case 'streetaddress':
            case 'tracking_data':
                break;

            case 'checkbox':
                break;

            case 'select':
            case 'multiselect':
            case 'radiobutton':
            case 'category':
                break;
    
            case 'date':
            case 'date_time':
            case 'birthday':
                break;

            case 'url':
                break;
        
            case 'smart_address':
                break;

            case 'legal_entity':
                break;
    
            case 'items':
                break;
    
            case 'multitext':
                break;
        }
    }
}