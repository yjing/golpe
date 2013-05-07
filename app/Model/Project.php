<?php

App::import('Model', 'AssociativeModel');
class Project extends AssociativeModel {
    
    public $hasMany = array('Team');
    
    public $validate = array(
        'name' => array(
            'requiredName' => array (
                'required' => true,
                'message' => 'Project name must be at least present.'
            )
        )
    );
    
}