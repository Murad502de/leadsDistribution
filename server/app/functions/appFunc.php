<?php

function tasksBearbeiten( $task, $entityId, $responsibleUserIdEntity, $responsibleUserId, &$tasksUpdate )
{
    // active Tasks suchen mit lead_id und responsible_id des Leads

    if ( $tasks = $task->getByQuery( 'filter[entity_id][]=' . $entityId . '&filter[responsible_user_id][]=' . $responsibleUserIdEntity ) )
    {
        //\file_put_contents( 'data/app___tasks.txt', \print_r( $tasks, true ) . "\r\n", FILE_APPEND );
        $tasks = $tasks[ '_embedded' ][ 'tasks' ];

        for ( $taskIndex = 0; $taskIndex < \count( $tasks ); $taskIndex++ )
        {
            if ( !$tasks[ $taskIndex ][ 'is_completed' ] )
            {
                $tasksUpdate[] = [
                    'id' => (int)$tasks[ $taskIndex ][ 'id' ],
                    'responsible_user_id' => (int)$responsibleUserId
                ];
            }
        }
    }
}

function companyBearbeiten( $company, $companies, &$companyUpdateData, $task, $responsibleUserIdEntity, $responsibleUserId, &$tasksUpdate, $settings )
{
    if ( !\count( $companies ) ) return false;

    $companyId = $companies[ 0 ][ 'id' ];

    // Kontakt suchen mit contact_id
    $companyCurrent = $company->getById( $companyId );

    // Information aus Contact sammeln: responsible_id, companies
    $responsibleUserId_company = $companyCurrent[ 'responsible_user_id' ];

    if ( $responsibleUserId_company == $responsibleUserIdEntity )
    {
        $companyUpdateData[] = [
            'id' => (int)$companyId,
            'responsible_user_id' => (int)$responsibleUserId
        ];
    }

    // Tasks von Unternehmen bearbeiten
    if ( $settings[ 'tasks' ][ 'value' ] ) tasksBearbeiten( $task, $companyId, $responsibleUserIdEntity, $responsibleUserId, $tasksUpdate );
}

function contactsBearbeiten( $contact, $contacts, &$contactUpdateData, $responsibleUserId_lead, $responsibleUserId_target, $task, &$tasksUpdate, $company, &$companyUpdateData, $settings )
{
    if ( !\count( $contacts ) ) return false;

    for ( $contactIndex = 0; $contactIndex < \count( $contacts ); $contactIndex++ )
    {
        $contactId = $contacts[ $contactIndex ][ 'id' ];

        // Kontakt suchen mit contact_id
        $contactCurrent = $contact->getById( $contactId );

        \file_put_contents( 'data/app_getContactById_list.txt', \print_r( $contactCurrent, true ), FILE_APPEND ); /* Debug */

        // Information aus Contact sammeln: responsible_id, companies
        $responsibleUserId_contact = $contactCurrent[ 'responsible_user_id' ];
        $companies = $contactCurrent[ '_embedded' ][ 'companies' ];


        if ( $responsibleUserId_contact == $responsibleUserId_lead )
        {
            // aktualisierte Kontaktsdaten vorbereiten
            $contactUpdateData[] = [
                'id' => ( int )$contactId,
                'responsible_user_id' => ( int )$responsibleUserId_target
            ];
        }

        // Tasks von Contact bearbeiten
        if ( $settings[ 'tasks' ][ 'value' ] ) tasksBearbeiten( $task, $contactId, $responsibleUserId_lead, $responsibleUserId_target, $tasksUpdate );

        // Unternehmen von Kontakten bearbeiten
        if ( $settings[ 'companies' ][ 'value' ] ) companyBearbeiten( $company, $companies, $companyUpdateData, $task, $responsibleUserId_lead, $responsibleUserId_target, $tasksUpdate, $settings[ 'companies' ] );

        // 0.3 Sekunden warten
        usleep( 300000 );
    }
}