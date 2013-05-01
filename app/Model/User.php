<?php

// app/Model/User.php
class User extends AppModel {
    
    private static $SUPERVISOR_KEY = "supervisor";
    private $supervisor_opt;
    public $hasAndBelongsToMany = array('Team');

//    public $actsAs = array(
//        'HahManyThroughHABTM' => array(
//            'Supervisor' => array(
//                'target_model_name' => 'User',
//                'join_table_name'=> 'students_supervisors',
//                'join_type' => 'LEFT',
//                'target_fk' => 'supervisor_id',
//                'model_fk' => 'student_id'
//            )
//        )
//    );
    
    public $validate = array(
        'username' => array(
            'required' => array(
                'rule' => array('notEmpty'),
                'message' => 'A username is required'
            )
        ),
        'password' => array(
            'required' => array(
                'rule' => array('notEmpty'),
                'message' => 'A password is required'
            )
        ),
        'role' => array(
            'valid' => array(
                'rule' => array('inList', array('STUDENT', 'SUPERVISOR', 'ADMIN', 'EXTERNAL')),
                'message' => 'Please enter a valid role',
                'allowEmpty' => false
            )
        )
    );
    
    public function beforeSave($options = array()) {
        if (isset($this->data[$this->alias]['password'])) {
            $this->data[$this->alias]['password'] = AuthComponent::password($this->data[$this->alias]['password']);
        }
        return true;
    }
    
    private $_queryData;
    public function beforeFind($queryData) {
        parent::beforeFind($queryData);
//        debug($queryData);
        $this->_queryData = $queryData;
        $queryData['recursive'] = -1;
    }
    
    public function afterFind($results, $primary = false) {
        parent::afterFind($results, $primary);
        
//        debug($this->_queryData);
        
        return $results;
    }
    
//    public function beforeFind($queryData) {
//        parent::beforeFind($queryData);
//        $this->supervisor_opt = $this->getConfigElement($queryData, User::$SUPERVISOR_KEY);
//    }
//    
//    public function afterFind($results, $primary = false) {
//        parent::afterFind($results, $primary);
//        
//        if(isset($this->supervisor_opt)) {
//            if ($primary) {
//                foreach ($results as $key => $element) {
//                    $element_id = $element[$this->alias][$this->primaryKey];
//                    
//                    $join = array(
//                        'table' => 'students_supervisors',
//                        'alias' => 'join',
//                        'type' => 'LEFT',
//                        'conditions' => 'User.id = join.supervisor_id'
//                    );
//                    $conditions = array(
//                        'join.student_id = ' . $element_id
//                    );
//                    
//                    $findOptions = array(
//                        'joins' => array($join),
//                        'conditions' => $conditions,
//                        'recursive' => 1,
//                    );
//                    if (isset($this->supervisor_opt['fields'])) {
//                        $findOptions['fields'] = $this->supervisor_opt['fields'];
//                    }
//                    
//                    $supervisor = $this->find('first', $findOptions);
//                    
//                    if(count($supervisor) > 0) {
//                        $results[$key]['Supervisor'] = $supervisor[$this->alias];
//                    }
//                    
//                }
//            }
//        }
//        
//        return $results;
//    }
    
    public function getConfigElement($config_array, $key) {
        $result = null;
        if(in_array($key, $config_array, true)) {
            $result = array();
        } elseif (array_key_exists($key, $config_array)) {
            $result = $config_array[$key];
        }
        return $result;
    }
    
    public function getTeam($userId){
        $query = "select Team.* 
                  from users as u join teams_users as tu on (u.id = tu.user_id) 
                  join teams as Team on (Team.id = tu.team_id) where u.id = " . $userId . ";";
        
        $res = $this->query($query);
        if (is_array($res) && count($res) > 0) {
            $res = $res[0];
        }
        
        return $res;
    }
    
    public function getTeamComponents($userId, $withUser = false) {
        $team = $this->getTeam($userId);
        $query = "select User.* 
                  from users as User join teams_users as tu on (User.id = tu.user_id) 
                  join teams as t on (t.id = tu.team_id) where t.id = " . $team['Team']['id'];
        if(!$withUser) {
            $query = $query . " AND User.id != " . $userId;
        }
        $query = $query . ";";
        
        return $this->query($query);
    }
    
    public function getTeamComponentsId($userId, $withUser = false) {
        $comonents = $this->getTeamComponents($userId, $withUser);
        
        return Set::extract("/User/id", $comonents);
    }

}

?>
