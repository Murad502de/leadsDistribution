<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\amoAuthKeysController;

Route::get( '/privacyPolicy', function () {
    return view( 'privacyPolicy' );
} );

Route::get( '/keys', function () {
    return view( 'keys' );
} );

Route::post( '/keys/add', [ amoAuthKeysController::class, 'handle' ] )->name( 'keys' );