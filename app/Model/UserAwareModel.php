<?php

App::import("Model", "User");
abstract class UserAwareModel extends AppModel {

    private $User;
    
    public function __construct($id = false, $table = null, $ds = null) {
        parent::__construct($id, $table, $ds);
        
        // INITIALIZE
        $this->User = new User();
        
    }
    
    public function beforeFind($queryData) {
        parent::beforeFind($queryData);
        debug("BEFORE FIND...");
        
        if($queryData['fields'] == null) {
            $queryData['fields'][] = $this->alias . '.*';
        }
        $queryData['fields'][] = $this->alias . '.visibility_level as AUTHvisibility_level';
        $queryData['fields'][] = 'AUTHUser.*';
        $queryData['fields'][] = 'AUTHTeam.*';
        $queryData['joins'][] = array(
            'table' => "users",
            'alias' => 'AUTHUser',
            'type' => 'LEFT',
            'conditions' => array('AUTHUser.id = '. $this->alias .'.user_id')
        );
        $queryData['joins'][] = array(
            'table' => "teams_users",
            'alias' => 'AUTHtu',
            'type' => 'LEFT',
            'conditions' => array('AUTHUser.id = AUTHtu.user_id')
        );
        $queryData['joins'][] = array(
            'table' => "teams",
            'alias' => 'AUTHTeam',
            'type' => 'LEFT',
            'conditions' => array('AUTHTeam.id = AUTHtu.team_id')
        );
        
        return $queryData;
    }
    
//    public function afterFind($results, $primary = false) {
//        
//        App::uses('CakeSession', 'Model/Datasource');
//        $user = CakeSession::read('Auth.User');
//        
//        if ($user == null) {
//            return null;
//        }
//        
//        if ($user['id'] == -1 && $user['username'] == 'msc.shell' && $user['role'] == 'SHELL') {
//            return $results;
//        }
//        
//        if ($primary) {
//            foreach ($results as $key => $result) {
//                if(isset($results[$key][$this->alias])) {
//                    if(!$this->_canRead($results[$key][$this->alias], $user)) {
//                        unset($results[$key]);
//                    }
//                }
//            }
//        } else {
//            foreach ($results as $key => $result) {
//                if(isset($results[$key][$this->alias])) {
//                    foreach ($results[$key][$this->alias] as $k => $v) {
//                        if(!$this->_canRead($v, $user)) {
//                            unset($results[$key][$this->alias][$k]);
//                        }
//                    }
//                }
//            }
//        }
//        return $results;
//    }
//    
//    private function _canRead($val, $user){
//        
//        if($val['visibility_level'] == 'PUBLIC') {
//            return true;
//        }
//        
//        if($val['user_id'] == $user['id']) {
//            return true;
//        }
//        
//        if($val['visibility_level'] == 'PRIVATE') {
//            return false;
//        }
//        
//        $team_members = $this->User->getTeamComponentsId($user['id']);
//        if (in_array($val['user_id'], $team_members)) {
//            return true;
//        }
//        
//        return false;
//    }
    
    
}
