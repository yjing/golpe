<?php

App::import('Controller', 'REST');

class ActivityLogsController extends RESTController {

    public $uses = array('ActivityLog', 'TeamUser', 'User');
    public $components = array('Session', 'RequestHandler');
    
    public function beforeFilter() {
        parent::beforeFilter();
    }
    
    public function index() {
        parent::index();
        
//        $db = $this->User->getDataSource();
//        $u = $db->fullTableName($this->ActivityLog);
//        $d = $db->fullTableName($this->ActivityLogMedia);
//        debug($u);
//        debug($d);
//        
//        $r = $db->buildStatement(
//            array(
//                'fields' => array('ActivityLog.*, User.*, Team.*'),
//                'table' => $db->fullTableName($this->ActivityLog),
//                'alias' => 'ActivityLog',
//                'group' => array(),
//                'conditions' => array(),
//                'order' => null,
//                'limit' => null,
//                'joins' => array(
//                    array(
//                        'table' => "users",
//                        'alias' => 'User',
//                        'type' => 'LEFT',
//                        'conditions' => array('ActivityLog.user_id = User.id')
//                    ),
//                    array(
//                        'table' => "teams_users",
//                        'alias' => 'tu',
//                        'type' => 'LEFT',
//                        'conditions' => array('User.id = tu.user_id')
//                    ),
//                    array(
//                        'table' => "teams",
//                        'alias' => 'Team',
//                        'type' => 'LEFT',
//                        'conditions' => array('Team.id = tu.team_id')
//                    )
//                )
//            ),
//            $this->ActivityLog
//        );
//        
//        $r = $this->ActivityLog->query($r);
//        debug($r);
//        $user = $this->Auth->user();
//        $team = $this->User->getTeam($user['id']);
//        debug($user);
//        debug($team);
//        
//        $r = $this->ActivityLog->find('all', 
//            array(
//                'fields' => array('ActivityLog.*', 'AUTHUser.*', 'AUTHTeam.*'),
////                'table' => $db->fullTableName($this->ActivityLog),
////                'alias' => 'ActivityLog',
////                'group' => array(),
//                'conditions' => array("OR"=>array('AUTHTeam.id' => $team['Team']['id'], 'AUTHUser.id' => $user['id'])),
////                'order' => null,
////                'limit' => null,
////                'recursive' => -1,
//                'joins' => array(
//                    array(
//                        'table' => "users",
//                        'alias' => 'AUTHUser',
//                        'type' => 'LEFT',
//                        'conditions' =>array(
//                            '`ActivityLog`.`user_id` = `AUTHUser`.`id`'
//                        )
//                    ),
//                    array(
//                        'table' => "teams_users",
//                        'alias' => 'tu',
//                        'type' => 'LEFT',
//                        'conditions' => array('AUTHUser.id = tu.user_id')
//                    ),
//                    array(
//                        'table' => "teams",
//                        'alias' => 'AUTHTeam',
//                        'type' => 'LEFT',
//                        'conditions' => array('AUTHTeam.id = tu.team_id')
//                    )
//                )
//            )    
//        );
//        
//        $active_logs = $this->ActivityLog->find('all', array(
//            'fields' => array('ActivityLog.id','ActivityLog.title'),
//            'conditions' => 'ActivityLog.modified >= '. (time() - (7 * 24 * 60 * 60)),
//            'recursive' => -1
//        ));
//        
//        debug($active_logs);
//        die();
        
        
        
        $user = $this->Auth->user();
        $team = $this->User->getTeam($user['id']);
        
        $mode = "";
        $modes = $this->_roles = Configure::read("APPCONFIG.activity_logs_modes");
        if(isset($this->request->query['mode'])) {
            $mode = $this->request->query['mode'];
        }
        if(!in_array($mode, $modes['modes'])) {
            $mode = $modes['default'];
        }
        
        $conditions = array();
        switch ($mode) {
            case "all":
                break;
            case "news":
                // RETRIEVE NEWS... TODO
                break;
            case "team":
                $conditions["AUTHTeam.id"] = $team['Team']['id'];
//                $conditions["ActivityLog.user_id"] = $this->User->getTeamComponentsId($user['id']);
                break;
            case "public":
                $conditions["ActivityLog.visibility_level"] = "PUBLIC";
                break;
            default: //"mine"
                $conditions["ActivityLog.user_id"] = $user['id'];
                break;
        }
        
        $results = $this->ActivityLog->find('all',
            array(
                'conditions' => $conditions,
                'recursive' => -1
            )
        );
        
        $this->_setResponseJSON($results);
    }

    public function view($id = null) {
        parent::view($id);
        
        $user = $this->Session->read("Auth.User");
        
        $this->_setResponseJSON($this->ActivityLog->find('first',
            array(
                'conditions' => array(
                    'ActivityLog.id' => $id
                ),
                'recursive' => -1
            )
        ));
    }

    public function add() {
        parent::add();
        
        $saved = $this->ActivityLog->save($this->request->data);
        $this->_setResponseJSON($saved);
    }

    public function update($id = null) {
        parent::update($id);
        
        $this->ActivityLog->id = $id;
        $this->_setResponseJSON($this->ActivityLog->save($this->data));
        
    }

    public function delete($id = null) {
        parent::delete($id);
        
        $deleted = $this->ActivityLog->delete($id);
        
        $this->_setResponseJSON(array('deleted'=>$deleted));
        
    }
    
    public function modes() {
        $user = $this->Auth->user();
        $role = $user['role'];
        $modes = $this->_roles = Configure::read("APPCONFIG.activity_logs_modes.$role");
        $this->_setResponseJSON($modes);
    }
    
}
