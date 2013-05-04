<?php

// app/Model/User.php
class User extends AppModel {
    
    private static $SUPERVISOR_KEY = "supervisor";
    private $supervisor_opt;
    public $hasAndBelongsToMany = array(
        'Team',
        'Supervisor' => array(
            'className' => 'User',
            'joinTable' => 'students_supervisors',
            'foreignKey' => 'student_id',
            'associationForeignKey' => 'supervisor_id'
        )
    );

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
    
    private static $ASSOCIATIONS_KEY = "associations";
    private $links;
    private $models = array();
    
    public function beforeFind($queryData) {
        parent::beforeFind($queryData);
        
        $queryData['recursive'] = -1;
        $this->links = $this->getConfigElement($queryData, self::$ASSOCIATIONS_KEY);
        
        return $queryData;
    }
    
    public function afterFind($results, $primary = false) {
        parent::afterFind($results, $primary);
        
        if(isset($this->links)) {
            foreach ($results as $index => $element) {
                foreach ($this->links as $association_name => $queryData) {
                    
                    $this->normalizeKeyValueToAssociative($association_name, $queryData);
                    
                    $asso = $this->findAssociation($association_name);
                    if(isset($asso)) {
                        $res = call_user_func( array( $this, $asso['function'] ), 
                            $association_name,
                            $asso['config'],
                            $queryData,
                            $element
                        );
                        debug($res);
                        
                        $results[$index][$association_name] = $res;
                    } else {
                        throw new InternalErrorException("The $association_name association doesn't exists.");
                    }
                }
            }
        }
        
        return $results;
    }
    
    // IMPORTANT: HAS SIDE EFFECT!!! MODIFY THE INPUT DATA!!!
    private function normalizeKeyValueToAssociative(&$key, &$value) {
        if(!is_string($key)) {
            $key = $value;
            $value = array();
        }
//        return array("association_name" => $key, "queryData" => $value);
    }


    private function getHasAndBelongsToMany($association_name, $association_config, $queryData, $element) {
        
        if(array_key_exists($association_config['className'], $this->models)) {
            $associated_model = $this->models[$association_config['className']];
        } else {
            $associated_model = $this->loadModel($association_config['className']);
            $this->models[$association_config['className']] = $associated_model;
        }
        
        $join = array(
            'table' => $association_config['joinTable'],
            'alias' => $association_config['with'],
            'type' => 'LEFT',
            'conditions' => $association_config['className'] . '.' . $associated_model->primaryKey 
                . ' = ' . $association_config['with'] . '.' . $association_config['associationForeignKey']
        );
        $conditions = array(
            $association_config['with'] . '.' . $association_config['foreignKey'] . ' = ' . $element[$this->alias]['id']
        );
        
        $options = array(
            'joins' => array($join),
            'conditions' => $conditions,
            'recursive' => 0,
        );
        $nested_associations = $this->getConfigElement($queryData, self::$ASSOCIATIONS_KEY);
        if(isset($nested_associations) && !empty($nested_associations)) {
            $options[self::$ASSOCIATIONS_KEY] = $nested_associations;
        }
        
        $fields = $this->getConfigElement($queryData, 'fields');
        if(isset($fields) && !empty($fields)) {
            $options['fields'] = $fields;
        }
        
        $res = $associated_model->find('all', $options);
        
        $alias = $associated_model->alias;
        $res = Set::extract("/$alias/.", $res);
        
        $unArray_if_single_value = $this->getConfigElement($queryData, 'unArray_if_single_value');
        if (isset($unArray_if_single_value) && $unArray_if_single_value !== false && count($res) == 1) {
            $res = $res[0];
        }
        
        return $res;
        
    }
    
    private function loadModel($model_name) {
        App::import('Model', $model_name);
        $class = new ReflectionClass($model_name);
        return $class->newInstanceArgs();
    } 

    private function findAssociation($association_name) {
        if(array_key_exists($association_name, $this->hasOne)) {
            return array(
                'type' => 'hasOne',
                'config' => $this->hasOne[$association_name],
                'function' => 'getHasOne'
            );
        }
        if(array_key_exists($association_name, $this->hasMany)) {
            return array(
                'type' => 'hasMany',
                'config' => $this->hasMany[$association_name],
                'function' => 'getHasMany'
            );
        }
        if(array_key_exists($association_name, $this->belongsTo)) {
            return array(
                'type' => 'belongsTo',
                'config' => $this->belongsTo[$association_name],
                'function' => 'getBelongsTo'
            );
        }
        if(array_key_exists($association_name, $this->hasAndBelongsToMany)) {
            return array(
                'type' => 'hasAndBelongsToMany',
                'config' => $this->hasAndBelongsToMany[$association_name],
                'function' => 'getHasAndBelongsToMany'
            );
        }
        return null;
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