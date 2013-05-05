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
            return $query;
        }
        
        $joins_config = $this->getConfigElement($this->config, 'joins');
        $joins = $this->generateJoins($model, $joins_config);
        
        array_merge($query['joins'], $joins);
        
        debug($query);
        
    }
    public function afterFind(Model $model, $results, $primary) {
        parent::afterFind($model, $results, $primary);
        
    }
    
    
    private function generateJoins($parent_model, $join_config) {
        $ret_joins = array();
        if(isset($join_config)) {
            foreach ($join_config as $join_name => $join_config) {
                
                $this->normalizeKeyValueToAssociative($join_name, $join_config);
                $asso = $this->findAssociation($parent_model, $join_name);
                
                $asso_model = $this->getModel($asso['config']['className']);

                $joins_array = call_user_func( array( $this, $asso['function'] ), 
                    $asso,
                    $join_name,
                    $parent_model,
                    $asso_model
                );
                foreach ($joins_array as $j) {
                    $ret_joins[] = $j;
                }


                $recursive_joins = null;
                if(isset($join_config['joins'])) {
                    $recursive_joins = $this->generateJoins($asso_model, $join_config['joins']);
                }
                if(isset($recursive_joins)) {
                    foreach ($recursive_joins as $j) {
                        $ret_joins[] = $j;
                    }
                }

            }
        }
        return $ret_joins;
    }
    
    private function notSupported($asso, $association_name, Model $parent_model, Model $association_model) {
        return array();
    }
    
    
    private function generateHasAndBelongsToManyJoin($asso, $association_name, Model $parent_model, Model $association_model) {
        $join = array();
        $join[] = array(
            'table' => $asso['config']['joinTable'],
            'alias'=> $asso['config']['with'],
            'type' => 'LEFT',
            'conditions' => array(
                $parent_model->alias . '.' . $parent_model->primaryKey . ' = ' 
                    . $asso['config']['with'] . '.' . $asso['config']['foreignKey']
            )
        );
        $join[] = array(
            'table' => $asso['config']['className'],
            'alias'=> $association_name,
            'type' => 'LEFT',
            'conditions' => array(
                $asso['config']['with'] . '.' . $asso['config']['associationForeignKey'] . ' = '
                    . $association_model->alias . '.' . $association_model->primaryKey
            )
        );
        return $join;
    }
    
    private function generateBelongsToJoin($asso, $association_name, Model $parent_model, Model $association_model) {
        $join = array();
        $join[] = array(
            'table' => Inflector::tableize($asso['config']['className']),
            'alias' => $association_name,
            'type' => 'LEFT',
            'conditions' => array(
                $parent_model->alias . '.' . $asso['config']['foreignKey'] . ' = '
                    . $asso['config']['className'] . '.' . $association_model->primaryKey
            )
        );
        return $join;
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
                'config' => $model->hasOne[$association_name],
//                'function' => 'generateHasOneJoin'
                'function' => 'notSupported'
            );
        }
        if(array_key_exists($association_name, $model->hasMany)) {
            return array(
                'type' => 'hasMany',
                'config' => $model->hasMany[$association_name],
//                'function' => 'generateHasManyJoin'
                'function' => 'notSupported'
            );
        }
        if(array_key_exists($association_name, $model->belongsTo)) {
            return array(
                'type' => 'belongsTo',
                'config' => $model->belongsTo[$association_name],
                'function' => 'generateBelongsToJoin'
            );
        }
        if(array_key_exists($association_name, $model->hasAndBelongsToMany)) {
            debug($model->hasAndBelongsToMany[$association_name]);
            return array(
                'type' => 'hasAndBelongsToMany',
                'config' => $model->hasAndBelongsToMany[$association_name],
                'function' => 'generateHasAndBelongsToManyJoin'
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