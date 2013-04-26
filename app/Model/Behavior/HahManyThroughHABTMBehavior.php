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
            
            $join_model_a = array($model->useTable, $Model->useTable);
            sort($join_model_a);
            $join_table_name = implode($join_model_a, '_');
            
            $settings[$model_name] = array(
                'model' => $model,
                'join_table_name' => $join_table_name
            );
            unset($settings[$key]);
        }
        $this->settings[$Model->alias] = $settings;
        
    }

    public function afterFind(Model $model, $results, $primary) {
        parent::afterFind($model, $results, $primary);
        
        foreach ($this->settings[$model->alias] as $m_name => $m) {
            debug($this->settings[$model->alias]['model']->alias);
            debug($this->settings[$model->alias]['join_table_name']);
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