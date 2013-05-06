<?php

App::import('Model', 'AssociativeModel');
class Device extends AssociativeModel {

    public $name = 'Device';
    public $useTable = "devices";
    public $hasMany = array('DeviceProperty');
    public $actsAs = array('DataAuthorization');
}
?>
