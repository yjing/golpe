<?php

Configure::write("APPCONFIG", array(
    'roles' => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR', 'ADMIN', 'EXTERNALE'),
    'authorization' => array (
        // RESOURCES/Controllers
        "Users" => array(
            // ACTIONS
            "index" => false,
            "view" => "*",
//            "view" => array('SUPERVISOR', 'ADMIN'),
        )
    )
));