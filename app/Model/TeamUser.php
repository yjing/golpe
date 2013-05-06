<?php

App::import('Model', 'AssociativeModel');
class TeamUser extends AssociativeModel {
    
    public $name = 'TeamUser';
    public $useTable = "teams_users";
    public $belongsTo = array('Team', 'User');
}

?>
