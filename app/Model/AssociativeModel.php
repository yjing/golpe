<?php
abstract class AssociativeModel extends AppModel {
    
    private static $SUPERVISOR_KEY = "supervisor";
    private static $ASSOCIATIONS_KEY = "associations";
    private $links;
    private $models = array();
    
    public function beforeFind($queryData) {
        parent::beforeFind($queryData);
        
        $links = $this->getConfigElement($queryData, self::$ASSOCIATIONS_KEY);
        if (isset($links)) {
            $this->links = $this->getConfigElement($queryData, self::$ASSOCIATIONS_KEY);
            $queryData['recursive'] = -1;
        }
        
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
    }
    
    private function getBelongsTo($association_name, $association_config, $queryData, $element) {
        
        
        $associated_model = $this->getModel($association_config['className']);
        
        $conditions = array(
            $association_config['className'] . '.' . $associated_model->primaryKey . ' = ' 
                . $element[$this->alias][$association_config['foreignKey']]
        );
        
        $options = array(
            'conditions' => $conditions,
            'recursive' => -1,
        );
        $nested_associations = $this->getConfigElement($queryData, self::$ASSOCIATIONS_KEY);
        if(isset($nested_associations) && !empty($nested_associations)) {
            $options[self::$ASSOCIATIONS_KEY] = $nested_associations;
        }
        
        $fields = $this->getConfigElement($queryData, 'fields');
        if(isset($fields) && !empty($fields)) {
            $options['fields'] = $fields;
        }
        
        $alias = $associated_model->alias;
        $res = $associated_model->find('first', $options);
        $res = Set::extract($alias, $res);
        
        return $res;
        
    }
    
    private function getHasMany($association_name, $association_config, $queryData, $element) {
        
        $associated_model = $this->getModel($association_config['className']);
        
        $conditions = array(
            $association_config['className'] . '.' . $association_config['foreignKey'] . ' = ' . $element[$this->alias]['id']
        );
        
        $options = array(
            'conditions' => $conditions,
            'recursive' => -1,
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
        
        // DATA FORMAT
        $alias = $associated_model->alias;
        $alias_data = Set::extract("{n}.$alias", $res);
        $res_without_alias = Set::remove($res, "{n}.$alias");
        $res = Set::merge($alias_data, $res_without_alias);
        
        $unArray_if_single_value = $this->getConfigElement($queryData, 'unArray_if_single_value');
        if (isset($unArray_if_single_value) && $unArray_if_single_value !== false && count($res) == 1) {
            $res = $res[0];
        }
        
        return $res;
        
    }

    private function getHasAndBelongsToMany($association_name, $association_config, $queryData, $element) {
        
//        debug('$association_config');
//        debug($association_config);
//        debug('$association_name');
//        debug($association_name);
//        debug('$queryData');
//        debug($queryData);
//        die();
        
        $associated_model = $this->getModel($association_config['className']);
        
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
            'recursive' => -1,
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
        
        // DATA FORMAT
        $alias = $associated_model->alias;
        $alias_data = Set::extract("{n}.$alias", $res);
        $res_without_alias = Set::remove($res, "{n}.$alias");
        $res = Set::merge($alias_data, $res_without_alias);
        
        $unArray_if_single_value = $this->getConfigElement($queryData, 'unArray_if_single_value');
        if (isset($unArray_if_single_value) && $unArray_if_single_value !== false && count($res) == 1) {
            $res = $res[0];
        }
        
        return $res;
        
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