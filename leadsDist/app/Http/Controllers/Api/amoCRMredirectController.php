<?php

namespace App\Http\Controllers\Api;

use App\Models\amoCRMredirect;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class amoCRMredirectController extends Controller
{
    function __construct(){}

    public function redirect ( Request $request, amoCRMredirect $amoRedirect )
    {
        $redirectData = $request->all() ? $request->all() : false;

        return $amoRedirect->saveRedirectData( $redirectData );
    }

    public function deleteData ( Request $request, amoCRMredirect $amoRedirect, $subdomain )
    {
        $amoRedirect->deleteRedirectData( $subdomain );
        return response( [ 'OK', $subdomain ], 200 );
    }
}
