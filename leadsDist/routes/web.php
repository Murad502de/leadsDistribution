<?php

use Illuminate\Support\Facades\Route;

Route::get( '/privacyPolicy', function () {
    return view( 'privacyPolicy' );
} );

Route::get( '/keys', function () {
    return 'Testseite';
} );