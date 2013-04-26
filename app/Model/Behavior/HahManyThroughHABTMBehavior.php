<?php

class HahManyThroughHABTMBehavior extends ModelBehavior {
    
    public function setup(Model $Model, $settings = array()) {
        if(!is_array($settings)) {
            $settings = array($settings);
        }
        
        foreach ($settings as $key => $model_name) {
            App::import('Model', $model_name);
            $model_class = new ReflectionClass($model_name);
            $model = $model_class->newInstanceArgs();
            $settings[$model_name] = $model;
            unset($settings[$key]);
        }
        $this->settings[$Model->alias] = $settings;
        
    }

    public function afterFind(Model $model, $results, $primary) {
        parent::afterFind($model, $results, $primary);
        
        foreach ($this->settings[$model->alias] as $model_name => $m) {
            debug($model_name);
            debug($m->useTable);
            debug($m->primary_key);
            debug("---");
            debug($model->alias);
            debug($model->useTable);
            debug($model->primary_key);
        }
        
//        foreach ($results as $key => $value) {
//            $id = $value[$model->alias]['id'];
//            $media = $this->Media->find('all', array(
//                'joins' => array(
//                    array(
//                        'table' => $joinModel->table,
//                        'alias' => $joinModel->alias,
//                        'conditions' => $joinModel->alias . '.media_id = ' . $this->Media->alias . '.id'
//                    )
//                ),
//                'fields' => array($this->Media->alias . '.*'),
//                'conditions' => $joinModel->alias . '.activity_log_id = '.$id,
//                'recursive' => -1
//            ));
//
//            $results[$key]['Media'] = $media;
//        }

        return $results;
    }
     
}