<?php

App::import("Model", "AssociativeModel");
class Media extends AssociativeModel {

    public $name = 'Media';
    
    public $belongsTo = "User";
}
?>
