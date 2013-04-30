<?php

App::import('Model', 'UserAwareModel');
class Device extends UserAwareModel {

    public $name = 'Device';
    public $useTable = "devices";
}
?>
