<?php

App::import('Model', 'AssociativeModel');
class Project extends AssociativeModel {
    
    public $hasMany = array('Team');
    
    public $validate = array(
        'name' => array(
            'requiredName' => array (
                'rule' => null,
                'required' => true,
                'allowEmpty' => false,
                'message' => 'Project name must be present.'
            )
        )
    );
    
}