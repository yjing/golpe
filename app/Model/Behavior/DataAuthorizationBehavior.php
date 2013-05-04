<?php
/**
 * Description of TestCBBehavior
 *
 * @author susini
 */
class DataAuthorizationBehavior extends ModelBehavior {
    
    private $config;
    private $super_roles;
    
    public function setup(Model $model, $config = array()) {
            $this->config = Configure::read("APPCONFIG.data_access");
    }
    
    public function beforeFind(Model $model, $query) {
        parent::beforeFind($model, $query);
        
        debug($query);
        
        debug($model->hasOne);
        debug($model->hasMany);
        debug($model->belongsTo);
        debug($model->hasAndBelongsToMany);
        
        $logged_user = CakeSession::read('Auth.User');
        if(in_array($logged_user['role'], Configure::read("APPCONFIG.super_roles"))) {
            return $queryData;
        }
        
        $joins = $this->getConfigElement($this->config, 'joins');
        
        foreach ($joins as $join_name => $config) {
            $this->normalizeKeyValueToAssociative($join_name, $config);
            debug($join_name);
            debug($config);
        }
        
    }
    public function afterFind(Model $model, $results, $primary) {
        parent::afterFind($model, $results, $primary);
        
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