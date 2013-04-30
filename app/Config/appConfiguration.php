<?php

Configure::write("APPCONFIG", array(
    'roles' => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR', 'ADMIN', 'EXTERNAL'),
    'activity_logs_modes' => array( 
        'STUDENT' => array(
            'modes' => array('all', 'news', 'mine', 'team', 'public'), 
            'default' => 'news'
        ),
        'TEAM_LEADER' => array(
            'modes' => array('all', 'news', 'mine', 'team', 'public'), 
            'default' => 'news'
        ),
        'SUPERVISOR' => array(
            'modes' => array('all', 'news', 'public'), 
            'default' => 'news'
        ),
        'ADMIN' => array(
            'modes' => array('public'), 
            'default' => 'public'
        ),
        'EXTERNAL' => array(
            'modes' => array('public'), 
            'default' => 'public'
        )
    ),
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
            "delete" => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR'),
            "modes" => true
        ),
        "Comments" => true,
        "Media" => true,
        "Devices" => true
    ),
    'notification' => array(
        'providers' => array(
            'Email'=>array(
                'time_lapse' => 30*60
            ),
            'Android'=>array(
                'time_lapse' => 60
            )
        )
    )
));