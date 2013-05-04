<?php

App::import('Model', 'AssociativeModel');
class Team extends AssociativeModel {
    public $belongsTo = array('Project');
    public $hasAndBelongsToMany = array(
        'Student' => array(
            'className' => 'User',
            'joinTable' => 'teams_users',
            'foreignKey' => 'team_id',
            'associationForeignKey' => 'user_id'
        )
    );
}

?>
