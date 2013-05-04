<?php

App::import('Model', 'AssociativeModel');
class Team extends AssociativeModel {
    public $belongsTo = array('Project');
    public $hasAndBelongsToMany = array('User');
}

?>
