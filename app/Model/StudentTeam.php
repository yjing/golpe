<?php

App::import('Model', 'AssociativeModel');
class StudentTeam extends AssociativeModel {
    public $belongsTo = array('Team', 'Student');
}

?>
