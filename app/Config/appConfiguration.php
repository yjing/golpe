<?php

Configure::write("APPCONFIG", array(
    'roles' => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR', 'ADMIN', 'EXTERNALE'),
    'authorization' => array (
        // RESOURCES/Controllers
        "Users" => array( 
            "index" => "ADMIN",
            "view" => true,
            "add" => "ADMIN",
            "edit" => "ADMIN",
            "delete" => "ADMIN"
        )
    )
));