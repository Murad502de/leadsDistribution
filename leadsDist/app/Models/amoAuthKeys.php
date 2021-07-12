<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class amoAuthKeys extends Model
{
    protected $table;

    function __construct()
    {
        $this->table = 'amo_auth_keys';
    }

    public function getAmoAuthKeys () 
    {
        return $this->all()->first();
    }

    public function setAmoAuthKeys ( $authKeys )
    {
        DB::table( $this->table )->truncate();

        $this->client_id = $authKeys[ 'client_id' ];
        $this->client_secret = $authKeys[ 'client_secret' ];

        return $this->save();
    }
}
