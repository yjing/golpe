<?php

App::import('Model', 'AssociativeModel');
class Profile extends AssociativeModel {
    public  $primaryKey = "user_id";
    
    
    public $validate = array(
        'name' => array(
            'first' => array (
                'rule'    => array('maxLength', 3),
                'message' => 'Usernames must be at least 3 characters long.'
            )
        )
    );
}

?>
