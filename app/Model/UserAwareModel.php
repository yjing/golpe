<?php

App::import("Model", "User");
App::uses('CakeSession', 'Model/Datasource');
abstract class UserAwareModel extends AppModel {

    private $User;
    
    public function __construct($id = false, $table = null, $ds = null) {
        parent::__construct($id, $table, $ds);
        
        // INITIALIZE
        $this->User = new User();
        
    }
    
    public function beforeDelete($cascade = true) {
        $res = parent::beforeDelete($cascade);
        return $res && $this->_checkOwnership();
    }
    
    public function beforeSave($options = array()) {
        $res = parent::beforeSave($options);
        
        if($this->exists()){
            $res = $res && $this->_checkOwnership();
        } else {
            $user = CakeSession::read('Auth.User');
            $this->data[$this->alias]['user_id'] = $user['id'];
            $res = $res && true;
        }
//        
        return $res;
    }
    
    public function beforeFind($queryData) {
        parent::beforeFind($queryData);
        
        $user = CakeSession::read('Auth.User');
        $team = $this->User->getTeam($user['id']);
        
        if($queryData['fields'] == null) {
            $queryData['fields'][] = $this->alias . '.*';
        }
        // Add the namespaced fields and models to be used for authorization
        $queryData['fields'][] = $this->alias . '.visibility_level as AUTHvisibility_level';
        $queryData['fields'][] = 'AUTHUser.id, AUTHUser.username, AUTHUser.role';
        $queryData['fields'][] = 'AUTHTeam.id, AUTHTeam.name, AUTHTeam.project_id';
        $queryData['fields'][] = 'Supervisor.id';
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
        $queryData['joins'][] = array(
            'table' => "supervisors_students",
            'alias' => 'Supervisor',
            'type' => 'LEFT',
            'conditions' => array('Supervisor.student_id = Supervisor.supervisor_id')
        );
        // Add the conditions for the visibility
        if(isset($queryData['conditions'])) {
            $queryData['conditions'] = array("AND" => array($queryData['conditions']));
        }
        $queryData['conditions']["AND"]["OR"] = array(
            $this->alias . '.visibility_level' => 'PUBLIC',
            'AUTHUser.id' => $user['id'],
//            "AND" => array(
//                'AUTHTeam.id' => $team['Team']['id'], 
//                $this->alias . '.visibility_level NOT IN' => array('PRIVATE', 'SUPERVISOR')
//            )
        );
        if ($team != null) {
            $queryData['conditions']["AND"]["OR"]["AND"] = array(
                'AUTHTeam.id' => $team['Team']['id'], 
                $this->alias . '.visibility_level NOT IN' => array('PRIVATE', 'SUPERVISOR')
            );
        }
        
        return $queryData;
    }
    
    public function afterFind($results, $primary = false) {
        parent::afterFind($results, $primary);
        
        foreach ($results as $key => $value) {
            
            if(isset($value[$this->alias]['AUTHvisibility_level'])) {
                unset($results[$key][$this->alias]['AUTHvisibility_level']);
            }
            if(isset($value['AUTHUser'])) {
                if(!isset($value['User'])) {
                    $results[$key]['User'] = $results[$key]['AUTHUser'];
                }
                unset($results[$key]['AUTHUser']);
            }
            if(isset($value['AUTHTeam'])) {
                if(!isset($value['Team'])) {
                    $results[$key]['Team'] = $results[$key]['AUTHTeam'];
                }
                unset($results[$key]['AUTHTeam']);
            }    
        }
        return $results;
        
    }
    
    private function _checkOwnership() {
        $user = CakeSession::read('Auth.User');
        $to_delete = $this->findById($this->id);
        return $to_delete[$this->alias]['user_id'] == $user['id'];
    }
    
}
