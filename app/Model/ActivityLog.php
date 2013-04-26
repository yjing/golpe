<?php

App::import('Model', 'Media');
App::import('Model', 'ActivityLogMedia');
App::import('Model', 'UserAwareModel');
App::import('Component', 'Session');
App::import('Behavior', 'HasMedia');

// app/Model/User.php
class ActivityLog extends AppModel {
//class ActivityLog extends UserAwareModel {

    public $name = 'ActivityLog';
    public $useTable = "activity_logs";
    public $actsAs = array('Containable', 'HasMedia');

    public $belongsTo = "User";
    public $hasAndBelongsToMany = array(
        "Media" => array(
            'order' => 'Media.modified DESC'
        ) 
        ,"Comment" => array(
            'order' => 'Comment.modified DESC'
        )
    );
    
    public function beforeSave($options = array()) {
        parent::beforeSave($options);
        
        if($this->data[$this->alias]) {
            
            $this->Session = new SessionComponent(new ComponentCollection());
            $user = $this->Session->read("Auth.User");

            $this->data[$this->alias]['user_id'] = $user['id'];
            $this->data[$this->alias]['draft'] = false;
            
            return true;
            
        } else {
            
            return false;
            
        }
    }
    
    public function beforeFind($queryData) {
        parent::beforeFind($queryData);
        
        if($queryData['fields'] == null) {
            $queryData['fields'][] = $this->alias . '.*';
        }
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
    
    public function afterFind($results, $primary = false) {
        parent::afterFind($results, $primary);
        
        debug($results);
        
        foreach ($results as $key => $value) {
            if(isset($value['AUTHUser'])) {
                unset($results[$key]['AUTHUser']);
            }
            if(isset($value['AUTHTeam'])) {
                unset($results[$key]['AUTHTeam']);
            }    
        }
        return $results;
        
    }
    
}

?>
