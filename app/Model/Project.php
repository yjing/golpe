<?php

App::import('Model', 'AssociativeModel');
class Project extends AssociativeModel {
    
    public $hasMany = array('Team');
    public $actsAs = array('DataAuthorization');
    
}