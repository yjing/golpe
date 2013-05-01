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
            if($user['role'] == 'SHELL') {
                return $queryData;
            }
            $this->data[$this->alias]['user_id'] = $user['id'];
            return true;
        }
        
        return $res;
    }
    
    public function beforeFind($queryData) {
        parent::beforeFind($queryData);
        
        $user = CakeSession::read('Auth.User');
        if($user['role'] == 'SHELL') {
            return $queryData;
        }
        $team = $this->User->getTeam($user['id']);
        
        if($queryData['fields'] == null) {
            $queryData['fields'][] = $this->alias . '.*';
        }
        // Add the namespaced fields and models to be used for authorization
        $queryData['fields'][] = $this->alias . '.visibility_level as AUTHvisibility_level';
        $queryData['fields'][] = 'User.id, User.username, User.role';
        $queryData['fields'][] = 'Team.id, Team.name, Team.project_id';
        $queryData['fields'][] = 'Supervisor.*';
        // Add the namespaced joins to retrieve the above-mentioned fields and models
        $queryData['joins'][] = array(
            'table' => "users",
            'alias' => 'User',
            'type' => 'LEFT',
            'conditions' => array('User.id = '. $this->alias .'.user_id')
        );
        $queryData['joins'][] = array(
            'table' => "teams_users",
            'alias' => 'AUTHtu',
            'type' => 'LEFT',
            'conditions' => array('User.id = AUTHtu.user_id')
        );
        $queryData['joins'][] = array(
            'table' => "teams",
            'alias' => 'Team',
            'type' => 'LEFT',
            'conditions' => array('Team.id = AUTHtu.team_id')
        );
        $queryData['joins'][] = array(
            'table' => "students_supervisors",
            'alias' => 'Supervisor',
            'type' => 'LEFT',
            'conditions' => array('Supervisor.student_id = User.id')
        );
        // Add the conditions for the visibility
        if(isset($queryData['conditions'])) {
            $queryData['conditions'] = array("AND" => array($queryData['conditions']));
        }
        $queryData['conditions']["AND"]["OR"] = array(
            $this->alias . '.visibility_level' => 'PUBLIC',
            'User.id' => $user['id'],
            'Supervisor.supervisor_id' => $user['id']
        );
        if ($team != null) {
            $queryData['conditions']["AND"]["OR"]["AND"] = array(
                'Team.id' => $team['Team']['id'], 
                $this->alias . '.visibility_level NOT IN' => array('PRIVATE', 'SUPERVISOR')
            );
        }
//        debug($queryData);
        return $queryData;
    }
    
    public function afterFind($results, $primary = false) {
        parent::afterFind($results, $primary);
        
        foreach ($results as $key => $value) {
            
            if(isset($value[$this->alias]['AUTHvisibility_level'])) {
                unset($results[$key][$this->alias]['AUTHvisibility_level']);
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
