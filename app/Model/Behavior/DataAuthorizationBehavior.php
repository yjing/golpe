<?php
/**
 * Description of TestCBBehavior
 *
 * @author susini
 */
class DataAuthorizationBehavior extends ModelBehavior {
    
    private $config;
    
    public function setup(Model $model, $config = array()) {
        
    }
    
    public function beforeFind(Model $model, $query) {
        parent::beforeFind($model, $query);
        
        debug($query);
        
        debug($model->hasOne);
        debug($model->hasMany);
        debug($model->belongsTo);
        debug($model->hasAndBelongsToMany);
        
    }
    public function afterFind(Model $model, $results, $primary) {
        parent::afterFind($model, $results, $primary);
        
    }
}