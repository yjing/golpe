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
        
    }
    public function afterFind(Model $model, $results, $primary) {
        parent::afterFind($model, $results, $primary);
        
    }
}