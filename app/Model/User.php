<?php

App::import('Model', 'AssociativeModel');
class User extends AssociativeModel {
    
    public $hasAndBelongsToMany = array(
        'Team',
        'Supervisor' => array(
            'className' => 'User',
            'joinTable' => 'students_supervisors',
            'foreignKey' => 'student_id',
            'associationForeignKey' => 'supervisor_id'
        )
    );
    public $hasMany = array('ActivityLog');
    public $hasOne = array('Profile');


    public $validate = array(
        'username' => array(
            'req' => array('rule'=>'required'),
            'lenght' => array (
                'rule'    => array('minLength', 3),
                'message' => 'Usernames must be at least 3 characters long.',
                'last' => false
            ),
            'format' => array(
                'rule' => 'alphaNumeric',
                'message' => 'Only alphabets and numbers allowed'
            ),
            'uniqueness' => array (
                'rule'    => 'isUnique',
                'message' => 'This username has already been taken.'
            )
        ),
        'password' => array(
            'req' => array('rule'=>'required'),
            'rule'    => array('minLength', 6),
            'message' => 'Password must be at least 6 characters long.'
        ),
        'email' => array(
            'req' => array('rule'=>'required'),
            'rule'    => array('email'),
            'message' => 'Password must be at least 6 characters long.',
            'allowEmpty' => false
        ),
        'role' => array(
            'allowedChoice' => array(
                'rule' => array('inList', array('STUDENT', 'SUPERVISOR', 'ADMIN', 'SYSTEM', 'SHELL')),
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