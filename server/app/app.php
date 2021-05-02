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

$start = microtime(true);

\file_put_contents( 'data/app_postDaten.txt', \print_r( $_POST, true ) ); /* Debug */

$settings = \json_decode( \file_get_contents( 'data/settings.json' ), true );

\file_put_contents( 'data/app_settings.txt', \print_r( $settings, true ) ); /* Debug */

$method = $_POST[ 'amoData' ][ 'method' ];
$leads = $_POST[ 'amoData' ][ 'leads' ];
$users = $_POST[ 'amoData' ][ 'users' ];

$lead = new Lead();
$contact = new Contact();
$company = new Company();
$task = new Task();

if ( $method === 'even' )
{
    // Leads bearbeiten
    $leadUpdateData = [];
    $contactUpdateData = [];
    $companyUpdateData = [];
    $tasksUpdate = [];

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

        \file_put_contents( 'data/app_getLeadById_list.txt', \print_r( $leadCurrent, true ), FILE_APPEND );

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

    // Tasks bearbeiten: wechseln verantwortlich
    $task->updateN( $tasksUpdate );
    \file_put_contents( 'data/app_taskUpdateData.txt', \print_r( $tasksUpdate, true ) );

    // Unternehmen bearbeiten: wechseln verantwortlich
    $company->updateN( $companyUpdateData );
    \file_put_contents( 'data/app_companyUpdateData.txt', \print_r( $companyUpdateData, true ) );

    // kontakten bearbeiten: wechseln verantwortlich
    $contact->updateN( $contactUpdateData );
    \file_put_contents( 'data/app_contactUpdateData.txt', \print_r( $contactUpdateData, true ) );

    // Leads bearbeiten: wechseln verantwortlich
    $lead->updateN( $leadUpdateData );
    \file_put_contents( 'data/app_leadUpdateData.txt', \print_r( $leadUpdateData, true ) );
}

echo 200;

$time = microtime(true) - $start;

\file_put_contents( 'data/app_time.txt', $time );