<?php

class HahManyThroughHABTMBehavior extends ModelBehavior {
    
    public function setup(Model $Model, $settings = array()) {
        if(!is_array($settings)) {
            $settings = array($settings);
        }
        
        foreach ($settings as $key => $target_name) {
            App::import('Model', $target_name);
            $target_class = new ReflectionClass($target_name);
            $target_model = $target_class->newInstanceArgs();
            
            $join_model_a = array($target_model->useTable, $Model->useTable);
            sort($join_model_a);
            $join_table_name = implode($join_model_a, '_');
            
            $target_fk = Inflector::underscore($target_model->alias) . '_' . $target_model->primaryKey;
            $model_fk = Inflector::underscore($Model->alias) . '_' . $Model->primaryKey;
            
            $settings[$target_name] = array(
                'target_model' => $target_model,
                'join_table_name' => $join_table_name,
                'target_fk' => $target_fk,
                'model_fk' => $model_fk
            );
            unset($settings[$key]);
        }
        $this->settings[$Model->alias] = $settings;
        
    }

    public function afterFind(Model $model, $results, $primary) {
        parent::afterFind($model, $results, $primary);
        
        foreach ($this->settings[$model->alias] as $m_name => $m) {
            debug($m['model']->alias);
            debug($m['join_table_name']);
            debug(Inflector::underscore($model->alias) . '_' . $model->primaryKey);
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