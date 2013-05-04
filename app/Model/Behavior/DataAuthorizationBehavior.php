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
        
        debug($joins);
        
    }
    public function afterFind(Model $model, $results, $primary) {
        parent::afterFind($model, $results, $primary);
        
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