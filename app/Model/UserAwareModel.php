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
        
        App::uses('CakeSession', 'Model/Datasource');
        $user = CakeSession::read('Auth.User');
        $team = $this->User->getTeam($user['id']);
        
        if($queryData['fields'] == null) {
            $queryData['fields'][] = $this->alias . '.*';
        }
        // Add the namespaced fields and models to be used for authorization
        $queryData['fields'][] = $this->alias . '.visibility_level as AUTHvisibility_level';
        $queryData['fields'][] = 'AUTHUser.*';
        $queryData['fields'][] = 'AUTHTeam.*';
        // Add the namespaced joins to retrieve the above-mentioned fields and models
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
        // Add the conditions for the visibility
        if(isset($queryData['conditions'])) {
            $queryData['conditions'] = array("AND" => array($queryData['conditions']));
        }
        $queryData['conditions']["AND"]["OR"] = array(
            $this->alias . '.visibility_level' => 'PUBLIC',
            'AUTHUser.id' => $user['id'],
            "AND" => array(
                'AUTHTeam.id' => $team['Team']['id'], 
                $this->alias . '.visibility_level NOT IN' => array('PRIVATE', 'SUPERVISOR')
            )
        );
        
        return $queryData;
    }
    
    public function afterFind($results, $primary = false) {
        parent::afterFind($results, $primary);
        
        foreach ($results as $key => $value) {
            
            if(isset($value[$this->alias]['AUTHvisibility_level'])) {
                unset($results[$key][$this->alias]['AUTHvisibility_level']);
            }
            if(isset($value['AUTHUser'])) {
                $results[$key]['User'] = $results[$key]['AUTHUser'];
                unset($results[$key]['AUTHUser']);
            }
            if(isset($value['AUTHTeam'])) {
                $results[$key]['Team'] = $results[$key]['AUTHTeam'];
                unset($results[$key]['AUTHTeam']);
            }    
        }
        return $results;
        
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
