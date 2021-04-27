<?php

namespace amoAPI\Data;

class Datenbank
{
    function __construct()
    {
        //echo "Datenbank\r\n";
    }

    public function getData($fileName)
    {
        $Daten = \file_get_contents(__DIR__ . '/' . $fileName . '.json');
        
        return \json_decode($Daten, true);
    }

    public function setData($fileName, $Data)
    {
        \file_put_contents(__DIR__ . '/' . $fileName . '.json', json_encode($Data));
    }
}
