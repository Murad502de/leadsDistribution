<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\amoAuthKeys;

class amoAuthKeysController extends Controller
{
    function __construct()
    {
    }

    public function handle ( Request $request, amoAuthKeys $keysModel )
    {
        $data = $request->all();
        
        return $keysModel->setAmoAuthKeys( [
            'client_id' => $data[ 'client_id' ],
            'client_secret'=> $data[ 'client_secret' ]
        ] );
    }
}
