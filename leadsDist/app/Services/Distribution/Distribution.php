<?php

namespace App\Services\Distribution;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

use App\Services\amoAPI\Classes\LeadClass\Lead as Lead;
use App\Services\amoAPI\Classes\ContactClass\Contact as Contact;
use App\Services\amoAPI\Classes\CompanyClass\Company as Company;
use App\Services\amoAPI\Classes\TaskClass\Task as Task;

class Distribution
{
    private $lead = null;
    private $contact = null;
    private $company = null;
    private $task = null;

    // Die Massive für aktualisierende Daten
    private $leadUpdateData = null;
    private $contactUpdateData = null;
    private $companyUpdateData = null;
    private $tasksUpdate = null;

    private $method = null;
    private $leads = null;
    private $users = null;
    private $subdomain = null;

    private $settings = null;
    private $accountRequestData = null;

    function __construct ( $amoData = null, $accountRequestData = null, $accountSettings = null )
    {
        $this->method = [ $amoData, $accountRequestData, $accountSettings ];
        
        //FIXME
        // TODO account-Daten abgeben
        $this->lead = new Lead( $accountRequestData );
        $this->contact = new Contact( $accountRequestData );
        $this->company = new Company( $accountRequestData );
        $this->task = new Task( $accountRequestData );

        // Die Massive für aktualisierende Daten
        $this->leadUpdateData = [];
        $this->contactUpdateData = [];
        $this->companyUpdateData = [];
        $this->tasksUpdate = [];

        //FIXME
        // TODO request-Daten abgeben
        $this->method = $amoData[ 'method' ];
        $this->leads = $amoData[ 'leads' ];
        $this->users = $amoData[ 'users' ];
        $this->subdomain = $accountRequestData[ 'subdomain' ];
        $this->settings = $accountSettings;
        $this->accountRequestData = $accountRequestData;
    }

    private function updateData ()
    {
        // Tasks bearbeiten: wechseln verantwortlich
        $this->task->updateN( $this->tasksUpdate );
        \file_put_contents( 'data/debug/' . $this->subdomain . '_taskUpdateData.txt', \print_r( $this->tasksUpdate, true ) ); /* Debug */

        // Unternehmen bearbeiten: wechseln verantwortlich
        $this->company->updateN( $this->companyUpdateData );
        \file_put_contents( 'data/debug/' . $this->subdomain . '_companyUpdateData.txt', \print_r( $this->companyUpdateData, true ) ); /* Debug */

        // kontakten bearbeiten: wechseln verantwortlich
        $this->contact->updateN( $this->contactUpdateData );
        \file_put_contents( 'data/debug/' . $this->subdomain . '_contactUpdateData.txt', \print_r( $this->contactUpdateData, true ) ); /* Debug */

        // Leads bearbeiten: wechseln verantwortlich
        $this->lead->updateN( $this->leadUpdateData );
        \file_put_contents( 'data/debug/' . $this->subdomain . '_leadUpdateData.txt', \print_r( $this->leadUpdateData, true ) ); /* Debug */
    }

    private function tasksBearbeiten ( $entityId, $responsibleUserIdEntity, $newResponsibleUserId )
    {
        // active Tasks suchen mit lead_id und responsible_id des Leads

        $tasks = $this->task->getByQuery( 'filter[entity_id][]=' . $entityId . '&filter[responsible_user_id][]=' . $responsibleUserIdEntity );

        if ( !$tasks[ 'error' ] && $tasks[ 'code' ] !== 204 )
        {
            \file_put_contents( 'data/debug/' . $this->subdomain . '___tasks.txt', \print_r( $tasks, true ) . "\r\n", FILE_APPEND );
            
            $tasks = $tasks[ 'out' ][ '_embedded' ][ 'tasks' ];

            for ( $taskIndex = 0; $taskIndex < \count( $tasks ); $taskIndex++ )
            {
                if ( !$tasks[ $taskIndex ][ 'is_completed' ] )
                {
                    $this->tasksUpdate[] = [
                        'id' => (int)$tasks[ $taskIndex ][ 'id' ],
                        'responsible_user_id' => (int)$newResponsibleUserId
                    ];
                }
            }
        }
    }

    private function companyBearbeiten ( $companies, $responsibleUserIdEntity, $newResponsibleUserId )
    {
        if ( !\count( $companies ) ) return false;

        $companyId = $companies[ 0 ][ 'id' ];

        // Kontakt suchen mit contact_id
        $companyCurrent = $this->company->getById( $companyId );

        // Information aus Contact sammeln: responsible_id, companies
        $responsibleUserId_company = $companyCurrent[ 'out' ][ 'responsible_user_id' ];

        if ( $responsibleUserId_company == $responsibleUserIdEntity )
        {
            $this->companyUpdateData[] = [
                'id' => (int)$companyId,
                'responsible_user_id' => (int)$newResponsibleUserId
            ];
        }

        // Tasks von Unternehmen bearbeiten
        if ( $this->settings[ 'companies' ][ 'tasks' ][ 'value' ] ) $this->tasksBearbeiten( $companyId, $responsibleUserIdEntity, $newResponsibleUserId );
    }

    private function contactsBearbeiten ( $contacts, $responsibleUserId_lead, $newResponsibleUserId )
    {
        if ( !\count( $contacts ) ) return false;

        for ( $contactIndex = 0; $contactIndex < \count( $contacts ); $contactIndex++ )
        {
            $contactId = $contacts[ $contactIndex ][ 'id' ];

            // Kontakt suchen mit contact_id
            $contactCurrent = $this->contact->getById( $contactId );

            //\file_put_contents( 'data/app_getContactById_list.txt', \print_r( $contactCurrent, true ), FILE_APPEND ); // Debug

            // Information aus Contact sammeln: responsible_id, companies
            $responsibleUserId_contact = $contactCurrent[ 'out' ][ 'responsible_user_id' ];
            $companies = $contactCurrent[ 'out' ][ '_embedded' ][ 'companies' ];


            if ( $responsibleUserId_contact == $responsibleUserId_lead )
            {
                // aktualisierte Kontaktsdaten vorbereiten
                $this->contactUpdateData[] = [
                    'id' => ( int )$contactId,
                    'responsible_user_id' => ( int )$newResponsibleUserId
                ];
            }

            // Tasks von Contact bearbeiten
            if ( $this->settings[ 'tasks' ][ 'value' ] ) $this->tasksBearbeiten( $contactId, $responsibleUserId_lead, $newResponsibleUserId );

            // Unternehmen von Kontakten bearbeiten
            if ( $this->settings[ 'companies' ][ 'value' ] ) $this->companyBearbeiten( $companies, $responsibleUserId_lead, $newResponsibleUserId );

            // 0.3 Sekunden warten
            usleep( 300000 );
        }
    }

    /* ================================ */

    public function exec ()
    {
        $start_dist = microtime(true); /* Debug */

        $test = []; // FIXME es ist nur für die Debugsversion

        for ( $leadIndex = 0, $userIndex = 0; $leadIndex < \count( $this->leads ); $leadIndex++, $userIndex++ )
        {
            $leadId = $this->leads[ $leadIndex ][ 'id' ];
            $newRespUserId = $this->leads[ $leadIndex ][ 'newRespUserId' ];

            // aktualisierte Leadsdaten vorbereiten
            $this->leadUpdateData[] = [
                'id' => (int) $leadId,
                'responsible_user_id' => (int) $newRespUserId
            ];

            // Lead suchen mit lead_id
            $leadCurrent = $this->lead->getById( $leadId );

            $test[] = $leadCurrent; // FIXME es ist nur für die Debugsversion

            //\file_put_contents( 'data/debug/app_getLeadById_list.txt', \print_r( $leadCurrent, true ), FILE_APPEND ); /* Debug */

            // Information aus Lead sammeln: responsible_id, contacts, companies
            $responsibleUserId_lead = $leadCurrent[ 'out' ][ 'responsible_user_id' ];
            $contacts = $leadCurrent[ 'out' ][ '_embedded' ][ 'contacts' ];
            $companies = $leadCurrent[ 'out' ][ '_embedded' ][ 'companies' ];

            // Tasks von Lead bearbeiten
            if ( $this->settings[ 'tasks' ][ 'value' ] ) $this->tasksBearbeiten( $leadId, $responsibleUserId_lead, $newRespUserId );

            // Unternehmen von Lead bearbeiten
            if ( $this->settings[ 'companies' ][ 'value' ] ) $this->companyBearbeiten( $companies, $responsibleUserId_lead, $newRespUserId );

            // 0.3 Sekunden warten
            usleep( 300000 );

            // Kontakten von Lead bearbeiten
            if ( $this->settings[ 'contacts' ][ 'value' ] ) $this->contactsBearbeiten( $contacts, $responsibleUserId_lead, $newRespUserId );
        }

        $execResponse =  $this->updateData(); // FIXME es ist nur für die Debugsversion

        $time_dist = microtime(true) - $start_dist; /* Debug */
        \file_put_contents('data/debug/' . $this->subdomain . '___time.txt', $time_dist . "\r\n", FILE_APPEND); /* Debug */

        //return $execResponse; // FIXME es ist nur für die Debugsversion

        return [ $this->leadUpdateData, $test, $this->settings ]; // FIXME es ist nur für die Debugsversion
    }
}