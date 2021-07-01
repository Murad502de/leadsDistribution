<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAmoAuthKeysTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create( 'amo_auth_keys', function ( Blueprint $table ) {
            $table->bigIncrements( 'id' );
            $table->string( 'client_id' );
            $table->string( 'client_secret' );
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists( 'amo_auth_keys' );
    }
}
