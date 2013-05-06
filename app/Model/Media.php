<?php

App::import("Model", "AssociativeModel");
class Media extends AssociativeModel {

    public $name = 'Media';
    public $belongsTo = "User";
    public $hasAndBelongsToMany = array('Comment', 'ActivityLog');
    public $actsAs = array('DataAuthorization');
}
?>
