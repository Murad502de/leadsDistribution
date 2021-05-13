<?php

$N = 11;
$total = $N;
$users = [
    [
        'id' => 111111,
        'percentage' => 30
    ],
    [
        'id' => 222222,
        'percentage' => 50
    ],
    [
        'id' => 333333,
        'percentage' => 20
    ],
    /*[
        'id' => 444444,
        'percentage' => 1
    ],*/
];

$rest = $total;

echo "full rest: $rest\r\n"; /* Debug */

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

    echo "$numberOfLeads\r\n"; /* Debug */
    echo "rest: $rest\r\n"; /* Debug */
}

echo "=================================\r\n"; /* Debug */
print_r( $usersTarget ); /* Debug */

for ( $targetUserIndex = 0, $leadIndex = 0; $targetUserIndex < \count( $usersTarget ); $targetUserIndex++ )
{
    for ( $numberOfLeadsIndex = 0; $numberOfLeadsIndex < $usersTarget[ $targetUserIndex ][ 'numberOfLeads' ]; $numberOfLeadsIndex++, $leadIndex++ )
    {
        echo $usersTarget[ $targetUserIndex ][ 'id' ] . " i:" . ( $numberOfLeadsIndex + 1 ) . " lead: " . $leadIndex . "\r\n"; /* Debug */
    }

    echo "\r\n"; /* Debug */
}