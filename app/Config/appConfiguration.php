<?php

Configure::write("APPCONFIG", array(
    'roles' => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR', 'ADMIN', 'EXTERNALE'),
    'authorization' => array (
        // RESOURCES/Controllers
        "Users" => array( 
            // Actions
            "index" => "ADMIN",
            "view" => true,
            "add" => "ADMIN",
            "update" => "ADMIN",
            "edit" => "ADMIN",
            "delete" => "ADMIN"
        ),
        "ActivityLogs" => array( 
            // Actions
            "index" => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR'),
            "view" => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR'),
            "add" => "ADMIN",
            "update" => "ADMIN",
            "edit" => "ADMIN",
            "delete" => "ADMIN"
        )
    )
));