<?php

Configure::write("APPCONFIG", array(
    'authorization' => array (
        // RESOURCES/Controllers
        "Users" => array(
            // ACTIONS
            "index" => array('*'),
            "view" => array('SUPERVISOR', 'ADMIN'),
        )
    )
));