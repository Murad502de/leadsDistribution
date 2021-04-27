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

function companyBearbeiten( $company, $companies, &$companyUpdateData, $task, $responsibleUserIdEntity, $responsibleUserId, &$tasksUpdate )
{
    if ( !\count( $companies ) ) return false;

    $companyUpdateData[] = [
        'id' => (int)$companies[ 0 ][ 'id' ],
        'responsible_user_id' => (int)$responsibleUserId
    ];

    // Tasks von Unternehmen bearbeiten
    tasksBearbeiten( $task, $companies[ 0 ][ 'id' ], $responsibleUserIdEntity, $responsibleUserId, $tasksUpdate );
}