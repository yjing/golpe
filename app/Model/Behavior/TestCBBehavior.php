<?php
/**
 * Description of TestCBBehavior
 *
 * @author susini
 */
class TestCBBehavior extends ModelBehavior {
    public function beforeFind(Model $model, $query) {
        parent::beforeFind($model, $query);
        
        debug("TestCBBehavior beforeFind");
    }
    public function afterFind(Model $model, $results, $primary) {
        parent::afterFind($model, $results, $primary);
        
        debug("TestCBBehavior afterFind");
    }
}