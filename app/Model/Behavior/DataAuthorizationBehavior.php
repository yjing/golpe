<?php
/**
 * Description of TestCBBehavior
 *
 * @author susini
 */
class DataAuthorizationBehavior extends ModelBehavior {
    
    private $config;
    
    public function beforeFind(Model $model, $query) {
        parent::beforeFind($model, $query);
        $this->config = array($model->alias . ' ' . rand(5, 15));
    }
    public function afterFind(Model $model, $results, $primary) {
        parent::afterFind($model, $results, $primary);
        
        debug($this->config);
    }
}