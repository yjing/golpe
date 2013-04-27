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
            "add" => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR'),
            "update" => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR'),
            "edit" => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR'),
            "delete" => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR')
        ),
        "Comments" => true,
        "Media" => true
    )
));