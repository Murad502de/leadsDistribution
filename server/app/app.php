<?php
header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");
header("HTTP/1.0 200 OK");

use amoAPI\Classes\LeadClass\Lead as Lead;
use amoAPI\Classes\ContactClass\Contact as Contact;
use amoAPI\Classes\CompanyClass\Company as Company;
use amoAPI\Classes\TaskClass\Task as Task;

require_once 'functions/appFunc.php';

function __autoload($class)
{
    $class = str_replace("\\", "/", $class);
    require_once '../' . $class . '.php';
}

/* ============================================================== */

$start = microtime(true); /* Debug */

\file_put_contents( 'data/debug/app_postDaten.txt', \print_r( $_POST, true ) ); /* Debug */

$method = $_POST[ 'amoData' ][ 'method' ];
$leads = $_POST[ 'amoData' ][ 'leads' ];
$users = $_POST[ 'amoData' ][ 'users' ];
$subdomain = $_POST[ 'amoData' ][ 'subdomain' ];

$lead = new Lead( $subdomain );
$contact = new Contact( $subdomain );
$company = new Company( $subdomain );
$task = new Task( $subdomain );

// Die Massive für aktualisierende Daten
$leadUpdateData = [];
$contactUpdateData = [];
$companyUpdateData = [];
$tasksUpdate = [];

// Verteilungseinstellungen erhalten
$settings = \json_decode( \file_get_contents( 'data/settings__' . $subdomain . '.json' ), true );

\file_put_contents( 'data/debug/app_settings.txt', \print_r( $settings, true ) ); /* Debug */

if ( $method === 'even' )
{
    for( $leadIndex = 0, $userIndex = 0; $leadIndex < \count( $leads ); $leadIndex++, $userIndex++ )
    {
        if ( $userIndex >= \count( $users ) ) $userIndex = 0;

        $leadId = $leads[ $leadIndex ][ 'id' ];

        // aktualisierte Leadsdaten vorbereiten
        $leadUpdateData[] = [
            'id' => (int)$leadId,
            'responsible_user_id' => (int)$users[ $userIndex ]
        ];

        // Lead suchen mit lead_id
        $leadCurrent = $lead->getById( $leadId );

        \file_put_contents( 'data/debug/app_getLeadById_list.txt', \print_r( $leadCurrent, true ), FILE_APPEND ); /* Debug */

        // Information aus Lead sammeln: responsible_id, contacts, companies
        $responsibleUserId_lead = $leadCurrent[ 'responsible_user_id' ];
        $contacts = $leadCurrent[ '_embedded' ][ 'contacts' ];
        $companies = $leadCurrent[ '_embedded' ][ 'companies' ];

        // Tasks von Lead bearbeiten
        if ( $settings[ 'tasks' ][ 'value' ] ) tasksBearbeiten( $task, $leadId, $responsibleUserId_lead, $users[ $userIndex ], $tasksUpdate );

        // Unternehmen von Lead bearbeiten
        if ( $settings[ 'companies' ][ 'value' ] ) companyBearbeiten( $company, $companies, $companyUpdateData, $task, $responsibleUserId_lead, $users[ $userIndex ], $tasksUpdate, $settings[ 'companies' ] );

        // 0.3 Sekunden warten
        usleep( 300000 );

        // Kontakten von Lead bearbeiten
        if ( $settings[ 'contacts' ][ 'value' ] ) contactsBearbeiten( $contact, $contacts, $contactUpdateData, $responsibleUserId_lead, $users[ $userIndex ], $task, $tasksUpdate, $company, $companyUpdateData, $settings[ 'contacts' ] );
    }
}

if ( $method === 'percent' )
{
    $total = \count( $leads );
    $rest = $total;
    $usersTarget = [];

    for ( $userIndex = 0; $userIndex < count( $users ) && $rest > 0; $userIndex++ )
    {
        $currentUserPercentage = $users[ $userIndex ][ 'percentage' ];
        $numberOfLeads = ( $total / 100 ) * $currentUserPercentage;

        $fractionalPart = ( $numberOfLeads - floor( $numberOfLeads ) ) * 10;

        if ( $fractionalPart >= 5 )
        {
            if ( ceil( $numberOfLeads ) <= $rest ) $numberOfLeads = ceil( $numberOfLeads );
            else $numberOfLeads = floor( $numberOfLeads );
        }
        else
        {
            if ( $userIndex == ( count( $users ) - 1 ) ) $numberOfLeads = $rest;
            else $numberOfLeads = floor( $numberOfLeads );
        }

        $rest -= $numberOfLeads;

        $userTarget = $users[ $userIndex ];
        $userTarget[ 'numberOfLeads' ] = ( int ) $numberOfLeads;

        $usersTarget[] = $userTarget;
    }

    for ( $targetUserIndex = 0, $leadIndex = 0; $targetUserIndex < \count( $usersTarget ); $targetUserIndex++ )
    {
        for ( $numberOfLeadsIndex = 0; $numberOfLeadsIndex < $usersTarget[ $targetUserIndex ][ 'numberOfLeads' ]; $numberOfLeadsIndex++, $leadIndex++ )
        {
            $newResponsibleUser = $usersTarget[ $targetUserIndex ][ 'id' ];

            \file_put_contents( 'data/debug/app_percent.txt', $newResponsibleUser . "\r\n", FILE_APPEND ); /* Debug */

            $leadId = $leads[ $leadIndex ][ 'id' ];

            // aktualisierte Leadsdaten vorbereiten
            $leadUpdateData[] = [
                'id' => ( int ) $leadId,
                'responsible_user_id' => ( int ) $newResponsibleUser
            ];

            // Lead suchen mit lead_id
            $leadCurrent = $lead->getById( $leadId );

            \file_put_contents( 'data/debug/app_getLeadById_list__percent.txt', \print_r( $leadCurrent, true ), FILE_APPEND ); /* Debug */

            // Information aus Lead sammeln: responsible_id, contacts, companies
            $responsibleUserId_lead = $leadCurrent[ 'responsible_user_id' ];
            $contacts = $leadCurrent[ '_embedded' ][ 'contacts' ];
            $companies = $leadCurrent[ '_embedded' ][ 'companies' ];

            // Tasks von Lead bearbeiten
            if ( $settings[ 'tasks' ][ 'value' ] ) tasksBearbeiten( $task, $leadId, $responsibleUserId_lead, $newResponsibleUser, $tasksUpdate );

            // Unternehmen von Lead bearbeiten
            if ( $settings[ 'companies' ][ 'value' ] ) companyBearbeiten( $company, $companies, $companyUpdateData, $task, $responsibleUserId_lead, $newResponsibleUser, $tasksUpdate, $settings[ 'companies' ] );

            // 0.3 Sekunden warten
            usleep( 300000 );

            // Kontakten von Lead bearbeiten
            if ( $settings[ 'contacts' ][ 'value' ] ) contactsBearbeiten( $contact, $contacts, $contactUpdateData, $responsibleUserId_lead, $newResponsibleUser, $task, $tasksUpdate, $company, $companyUpdateData, $settings[ 'contacts' ] );
        }
    }
}

/* DATENAKTUALISIERUNG */

// Tasks bearbeiten: wechseln verantwortlich
$task->updateN( $tasksUpdate );
\file_put_contents( 'data/debug/app_taskUpdateData.txt', \print_r( $tasksUpdate, true ) ); /* Debug */

// Unternehmen bearbeiten: wechseln verantwortlich
$company->updateN( $companyUpdateData );
\file_put_contents( 'data/debug/app_companyUpdateData.txt', \print_r( $companyUpdateData, true ) ); /* Debug */

// kontakten bearbeiten: wechseln verantwortlich
$contact->updateN( $contactUpdateData );
\file_put_contents( 'data/debug/app_contactUpdateData.txt', \print_r( $contactUpdateData, true ) ); /* Debug */

// Leads bearbeiten: wechseln verantwortlich
$lead->updateN( $leadUpdateData );
\file_put_contents( 'data/debug/app_leadUpdateData.txt', \print_r( $leadUpdateData, true ) ); /* Debug */

/* DATENAKTUALISIERUNG */

echo 200;

$time = microtime(true) - $start; /* Debug */
\file_put_contents( 'data/debug/app_time.txt', $time ); /* Debug */