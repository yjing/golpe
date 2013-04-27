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
        foreach ($results as $i => $element) {
            foreach ($this->settings[$model->alias] as $target_name => $target_meta) {
                $element_id = $element[$model->alias]['id'];
                $target_model = $target_meta['target_model'];
                $join = array(
                    'table' => $target_meta['join_table_name'],
                    'alias' => 'join',
                    'conditions' => 'join.' . $target_meta['target_fk'] . ' = ' 
                    . $target_model->alias . '.' . $target_model->primaryKey
                );
                $conditions = array(
                    'join.' . $target_meta['model_fk'] . ' = ' . $model->alias . '.' . $model->primaryKey
                );
                debug($join);
                debug($conditions);die();
            }
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