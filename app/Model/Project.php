<?php

App::import('Model', 'AssociativeModel');
class Project extends AssociativeModel {
    
    public $hasMany = array('Team');
    
}