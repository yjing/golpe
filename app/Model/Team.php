<?php

App::import('Model', 'AssociativeModel');
class Team extends AssociativeModel {
    public $belongsTo = array('Project');
    public $hasAndBelongsToMany = array(
        'Students' => array(
            'className' => 'User',
            'joinTable' => 'teams_users',
            'foreignKey' => 'user_id',
            'associationForeignKey' => 'team_id'
        )
    );
}

?>
