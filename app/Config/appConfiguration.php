<?php

Configure::write("APPCONFIG", array(
    'roles' => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR', 'ADMIN', 'EXTERNALE'),
    'authorization' => array (
        // RESOURCES/Controllers
        "Users" => array(
            // ACTIONS
            "index" => array("SUPERVISOR"),
            "view" => array("*", "STUDENT"),
//            "view" => array('SUPERVISOR', 'ADMIN'),
        )
    )
));