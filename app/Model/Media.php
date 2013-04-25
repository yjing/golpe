<?php

App::import("Model", "UserAwareModel");
class Media extends UserAwareModel {

    public $name = 'Media';
    
    public $belongsTo = "User";
}
?>
