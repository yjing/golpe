<?php

Configure::write("APPCONFIG", array(
    'debug' => 2,
    'roles' => array('STUDENT', 'SUPERVISOR', 'ADMIN', 'SYSTEM', 'SHELL'),
    'super_roles' => array('SHELL', 'SYSTEM'),
    'visibility_levels' => array('PRIVATE', 'SUPERVISOR', 'TEAM', 'PUBLIC', 'SYSTEM'),
    'activity_logs_modes' => array( 
        'STUDENT' => array(
            'modes' => array('all', 'news', 'mine', 'team', 'public'), 
            'default' => 'news'
        ),
        'SUPERVISOR' => array(
            'modes' => array('all', 'news', 'public'), 
            'default' => 'news'
        ),
        'ADMIN' => array(
            'modes' => array('all'), 
            'default' => 'all'
        )
    ),
    'authorization' => array (
        // RESOURCES/Controllers
        "Users" => array( 
            // Actions
            "index" => array("ADMIN", "SUPERVISOR"),
            "view" => true,
            "add" => "ADMIN",
            "update" => "ADMIN",
            "edit" => "ADMIN",
            "delete" => "ADMIN"
        ),
        "ActivityLogs" => array( 
            // Actions
            "index" => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR', 'ADMIN'),
            "view" => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR', 'ADMIN'),
            "add" => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR'),
            "update" => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR'),
            "edit" => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR'),
            "delete" => array('STUDENT', 'TEAM_LEADER', 'SUPERVISOR', 'ADMIN'),
            "modes" => true
        ),
        "Comments" => true,
        "Media" => true,
        "Devices" => true,
//        array(
//            // Actions
//            "index" => true,
//            "view",
//            "add",
//            "update",
//            "delete",
//        ),
        "Projects" => 'ADMIN',
        "Teams" => 'ADMIN'
    ),
    'data_access'=> array(
        'joins' => array(
            'User' => array(
                'joins' => array(
                    'Team',
                    'Supervisor'
                )
            )
        ),
        'conditions' => array(
            'OR' => array(
                // PUBLIC resources can be read by everybody
                '#MainResource#.visibility_level' => 'PUBLIC',
                // OWNER can always read his resources
                'User.id' => '@(User.id)',
                'AND' => array(
                    // No private resource can be read by non OWNERs
                    '#MainResource#.visibility_level !=' => 'PRIVATE',
                    'OR' => array(
                        '#MainResource#.user_id = @(User.Supervisor.id) ' .
                            'AND #MainResource#.visibility_level = \'SUPERVISOR\'',
                        // TEAM MEMEBERS can read each other resources with a TEAM visibility_level
                        'Team.id = @(User.Team.id) ' .
                            'AND \'@(User.role)\' = \'STUDENT\' ' .
                            'AND #MainResource#.visibility_level = \'TEAM\'',
                        // TEAM MEMEBERS can read their_student's resources with a TEAM visibility_level
                        'StudentsSupervisor.supervisor_id = @(User.id) ' .
                            'AND \'@(User.role)\' = \'SUPERVISOR\' ' .
                            'AND #MainResource#.visibility_level IN (\'TEAM\', \'SUPERVISOR\')',
                    )
                )
                
            )
        )
    ),
    'notification' => array(
        'providers' => array(
            'Email'=>array(
                'time_lapse' => 30*60
            ),
//            'Android'=>array(
//                'time_lapse' => 60
//            )
        )
    )
));
