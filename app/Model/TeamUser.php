<?php

App::import('Model', 'AssociativeModel');
class TeamUser extends AssociativeModel {
    
    public $name = 'TeamUser';
    public $useTable = "teams_users";
    public $primaryKey = array('user_id', 'team_id');
    public $belongsTo = array('Team', 'User');
}

?>
