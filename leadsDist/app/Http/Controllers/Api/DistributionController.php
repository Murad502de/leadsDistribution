<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\Response;
use App\Models\Authorization;
use App\Models\AmoSession;
use App\Services\Distribution\Distribution;

use App\Services\amoAPI\Classes\TaskClass\Task as Task; // test

class DistributionController extends Controller
{
    private $dist;
    private $amoSession;

    function __construct()
    {
        $this->middleware( 'SessionСheck' )->except('testTask');

        // auth prüfen
        $this->middleware( 'amoAuth' )->except('testTask');

        // access_token überprüfen und aktualisieren es bei Bedarf
        $this->middleware( 'amoAccessTokenVerification' )->except('testTask');
    }

    

    public function exec ( Request $request, Authorization $authorization )
    {
        $subdomain = $request->query( 'subdomain' );

        $this->amoSession = new AmoSession();

        $this->amoSession->startSession( $subdomain );

        // TODO
        // request-Daten und account-daten im dist weiter abgeben
        $amoData = \json_decode( $request->all()[ 'amoDaten' ], true );

        $accountData = $authorization->getAccountData( $subdomain );

        $accountRequestData = [
            'subdomain' => $accountData->subdomain,
            'access_token' => $accountData->access_token,
            'redirect_uri' => $accountData->redirect_uri,
        ];

        $accountSettings = \json_decode( $accountData->settings, true );
        
        $this->dist = new Distribution( $amoData, $accountRequestData, $accountSettings );

        $execResponse =  $this->dist->exec();

        // sleep for 90 seconds
        //sleep( 90 ); // FIXME

        $this->amoSession->endSession( $subdomain );

        // FIXME man muss $execResponse überprüfen, ob es Fehler enthaltet
        return response( $execResponse, 200 );
    }

    public function testTask ( Request $request, Authorization $authorization )
    {
        echo 'testTask<br>';

        $responsible_user_id = $request->query( 'resp' );

        echo 'responsible_user_id: ';
        echo $responsible_user_id . '<br>';

        $accountData = $authorization->getAccountData( 'integrat3' );

        $accountRequestData = [
            'subdomain' => $accountData->subdomain,
            'access_token' => $accountData->access_token,
            'redirect_uri' => $accountData->redirect_uri,
        ];

        $task = new Task( $accountRequestData );

        $responsibleUserIdEntity = 7001125;
        $query = 'filter[responsible_user_id][]=' . $responsibleUserIdEntity;

        $tasks = $task->getByQuery( $query );

        if ()
        {
            echo 'Es wurde folgende Aufgaben gefunden<br>';
            echo "<pre>";
                print_r( $tasks );
            echo "</pre>";
        }
        else
        {
            echo 'Aufgaben wurden nicht gefunden<br>';
        }
    }
}