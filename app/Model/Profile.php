<?php

App::import('Model', 'AssociativeModel');
class Profile extends AssociativeModel {
    public  $primaryKey = "user_id";
    
    
    public $validate = array(
        'name' => array(
            'length' => array (
                'rule'    => array('minLength', 2),
                'message' => 'Name must be at least 2 characters long.'
            )
        )
    );
}

?>
