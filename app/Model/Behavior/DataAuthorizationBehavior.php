<?php
/**
 * Description of TestCBBehavior
 *
 * @author susini
 */
App::uses('CakeSession', 'Model/Datasource');
class DataAuthorizationBehavior extends ModelBehavior {
    
    private $config;
    private $models;
    
    private $logged_user;
    private $main_resource_name;


    public function setup(Model $model, $config = array()) {
        $this->config = Configure::read("APPCONFIG.data_access");
        $this->models = array();
    }
    
    public function beforeSave(Model $model) {
        
        $this->logged_user = CakeSession::read('Auth.User');
        if(isset($this->logged_user)) {
            $this->logged_user = array('User' => $this->logged_user);
        }
        
        if(in_array($this->logged_user['User']['role'], Configure::read("APPCONFIG.super_roles"))) {
            return true;
        }
        
        if($model->exists()){
            return $this->_checkOwnership($model);
        } else {
            $model->data[$model->alias]['user_id'] = $this->logged_user['User']['id'];
            return true;
        }
    }
    
    private function _checkOwnership($model) {
        $elem = $model->find('first',
            array(
                'conditions' => array(
                    $model->alias . '.' .$model->primaryKey => $model->id
                ),
                'recursive' => -1
            )
        );
//        $elem = $model->findById($model->id);
        return $elem !== false && $elem[$model->alias]['user_id'] == $this->logged_user['User']['id'];
    }
    
    public function beforeFind(Model $model, $query) {
        parent::beforeFind($model, $query);
        
        $this->logged_user = CakeSession::read('Auth.User');
        if(isset($this->logged_user)) {
            $this->logged_user = array('User' => $this->logged_user);
        }
        
        $this->main_resource_name = $model->alias;
        if(in_array($this->logged_user['User']['role'], Configure::read("APPCONFIG.super_roles"))) {
//            debug("SUPERUSER");
            return $query;
        }
        
        $joins_config = $this->getConfigElement($this->config, 'joins');
        $joins = $this->generateJoins($model, $joins_config);
        $query['joins'] = array_merge($query['joins'], $joins);
        
        
        $conditions = $this->getConfigElement($this->config, 'conditions');
        $this->elabConds($conditions);
//        debug($conditions);die();
        if(isset($query['conditions'])) {
            $query['conditions'] = array(
                'AND' => array(
                    $query['conditions'],
                    $conditions
                )
            );
        } else {
            $query['conditions'] = $conditions;
        }
        
        return $query;
        
    }
    public function afterFind(Model $model, $results, $primary) {
        parent::afterFind($model, $results, $primary);
        
    }
    
    private function elabConds(&$conds) {
        if(isset($conds)) {
            foreach ($conds as $key => $value) {

                if(!is_array($value)) {
                    $v = $this->replaceDynamics($value);
                    $conds[$key] = $v;
                } else {
                    $this->elabConds($conds[$key]);
                }

                $k = $this->replaceDynamics($key);
                if($k != $key) {
                    $conds[$k] = $conds[$key];
                    unset($conds[$key]);
                }
                
            }
        }
    }
    
    private function replaceDynamics($source) {
        if(preg_match_all('{\#(?P<pattern>\w+)\#}', $source, $regs, PREG_OFFSET_CAPTURE)) {
            $source = str_replace($regs[0][0][0], $this->main_resource_name, $source);
        }
        if(preg_match_all('{\@\((?P<pattern>[\w|\.]+)\)}', $source, $regs, PREG_OFFSET_CAPTURE)) {
            foreach ($regs[0] as $key => $value) {
                $replacement = Set::extract($regs['pattern'][$key][0], $this->logged_user);
                if(!isset($replacement)) {
                    $replacement = 'NULL';
                }
                
                $source = str_replace($value[0], $replacement, $source);
            }
        }
        return $source;
    }
    
    private function generateJoins($parent_model, $join_config) {
        $ret_joins = array();
        if(isset($join_config)) {
            foreach ($join_config as $join_name => $join_config) {
                
                $this->normalizeKeyValueToAssociative($join_name, $join_config);
                $asso = $this->findAssociation($parent_model, $join_name);
                if(!isset($asso)){
                    $parent_model_alias = $parent_model->alias;
                    throw new InternalErrorException("Model '$parent_model_alias' doesn't have '$join_name' association.");
                }
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
            'table' => Inflector::tableize($asso['config']['className']),
            'alias'=> $association_name,
            'type' => 'LEFT',
            'conditions' => array(
                $asso['config']['with'] . '.' . $asso['config']['associationForeignKey'] . ' = '
                    . $association_name . '.' . $association_model->primaryKey
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
                    . $association_name . '.' . $association_model->primaryKey
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
        try {
            App::import('Model', $model_name);
            $class = new ReflectionClass($model_name);
            return $class->newInstanceArgs();
        } catch (Exception $e) {
            throw new InternalErrorException("Can't load model '$model_name'");
        }
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
        
        if(isset($config_array)) {
            if(in_array($key, $config_array, true)) {
                $result = array();
            } elseif (array_key_exists($key, $config_array)) {
                $result = $config_array[$key];
            }
        }
        return $result;
    }
}