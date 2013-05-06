<?php

App::import('Model', 'AssociativeModel');
class Device extends AssociativeModel {

    public $name = 'Device';
    public $useTable = "devices";
    public $belongsTo = array('User');
    public $hasMany = array('DeviceProperty');
    public $actsAs = array('DataAuthorization');
}
?>
