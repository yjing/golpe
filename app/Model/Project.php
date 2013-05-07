<?php

App::import('Model', 'AssociativeModel');
class Project extends AssociativeModel {
    
    public $hasMany = array('Team');
    
    public $validate = array(
        'name' => array(
            'requiredName' => array (
                'required' => true,
                'allowEmpty' => false,
                'message' => 'Usernames must be at least 3 characters long.'
            )
        )
    );
    
}