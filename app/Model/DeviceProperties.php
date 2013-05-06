<?php

App::import('Model', 'UserAwareModel');
class DeviceProperty extends AppModel {

    public $name = 'DeviceProperty';
    public $useTable = "device_properties";
    public $belongsTo = array('Device');
}
?>
