<?php
/**
 * Description of TestCBBehavior
 *
 * @author susini
 */
class DataAuthorizationBehavior extends ModelBehavior {
    
    private $config;
    private $models;
    
    public function setup(Model $model, $config = array()) {
        $this->config = Configure::read("APPCONFIG.data_access");
        $this->models = array();
    }
    
    public function beforeFind(Model $model, $query) {
        parent::beforeFind($model, $query);
        
//        debug($query);
//        
//        debug($model->hasOne);
//        debug($model->hasMany);
//        debug($model->belongsTo);
//        debug($model->hasAndBelongsToMany);
        
        $logged_user = CakeSession::read('Auth.User');
        if(in_array($logged_user['role'], Configure::read("APPCONFIG.super_roles"))) {
            return $queryData;
        }
        
        $joins_config = $this->getConfigElement($this->config, 'joins');
        $joins = $this->generateJoins($joins_config);
        
        
        
//        foreach ($joins_config as $join_name => $join_config) {
//            $this->normalizeKeyValueToAssociative($join_name, $join_config);
//            
//            debug($this->findAssociation($model, $join_name));
//            
//            $joins[] = array(
//                'table' => "teams",
//                'alias' => 'Team',
//                'type' => 'LEFT',
//                'conditions' => array('Team.id = AUTHtu.team_id')  
//            );
//        }
        
    }
    public function afterFind(Model $model, $results, $primary) {
        parent::afterFind($model, $results, $primary);
        
    }
    
    
    private function generateJoins($parent_model, $join_config) {
        foreach ($join_config as $key => $value) {
            $this->normalizeKeyValueToAssociative($key, $value);
            
            debug($this->findAssociation($parent_model, $key));
            
            if(isset($value['joins'])) {
                $p_model = $this->getModel($key);
                $this->generateJoins($p_model, $value['joins']);
            }
        }
    }
    
    private function getModel($class_name) {
        
        if(array_key_exists($class_name, $this->models)) {
            $model = $this->models[$class_name];
        } else {
            $model = $this->loadModel($class_name);
            $this->models[$class_name] = $model;
        }
        
        return $model;
    }
    
    private function loadModel($model_name) {
        App::import('Model', $model_name);
        $class = new ReflectionClass($model_name);
        return $class->newInstanceArgs();
    } 
    
    private function findAssociation($model, $association_name) {
        if(array_key_exists($association_name, $model->hasOne)) {
            return array(
                'type' => 'hasOne',
                'config' => $model->hasOne[$association_name]
            );
        }
        if(array_key_exists($association_name, $model->hasMany)) {
            return array(
                'type' => 'hasMany',
                'config' => $model->hasMany[$association_name]
            );
        }
        if(array_key_exists($association_name, $model->belongsTo)) {
            return array(
                'type' => 'belongsTo',
                'config' => $model->belongsTo[$association_name]
            );
        }
        if(array_key_exists($association_name, $model->hasAndBelongsToMany)) {
            return array(
                'type' => 'hasAndBelongsToMany',
                'config' => $model->hasAndBelongsToMany[$association_name]
            );
        }
        return null;
    }
    
    // IMPORTANT: HAS SIDE EFFECT!!! MODIFY THE INPUT DATA!!!
    private function normalizeKeyValueToAssociative(&$key, &$value) {
        if(!is_string($key)) {
            $key = $value;
            $value = array();
        }
    }
    
    public function getConfigElement($config_array, $key) {
        $result = null;
        
        if(in_array($key, $config_array, true)) {
            $result = array();
        } elseif (array_key_exists($key, $config_array)) {
            $result = $config_array[$key];
        }
        return $result;
    }
}