<?php

class HahManyThroughHABTMBehavior extends ModelBehavior {
    
    private $query;
    
    public function setup(Model $Model, $settings = array()) {
        if(!is_array($settings)) {
            $settings = array($settings);
        }
        
        foreach ($settings as $target_name => $options) {
            if(isset($options['target_model_name'])) {
                App::import('Model', $options['target_model_name']);
                $target_class = new ReflectionClass($options['target_model_name']);
                $target_model = $target_class->newInstanceArgs();
                
            } else {
                App::import('Model', $target_name);
                $target_class = new ReflectionClass($target_name);
                $target_model = $target_class->newInstanceArgs();
            }
            
            if(isset($options['join_table_name'])) {
                $join_table_name = $options['join_table_name'];
            } else {
                $join_model_a = array($target_model->useTable, $Model->useTable);
                sort($join_model_a);
                $join_table_name = implode($join_model_a, '_');
            }
            
            if(isset($options['target_fk'])) {
                $target_fk = $options['target_fk'];
            } else {
                $target_fk = Inflector::underscore($target_model->alias) . '_' . $target_model->primaryKey;
            }
            
            if(isset($options['model_fk'])) {
                $model_fk = $options['model_fk'];
            } else {
                $model_fk = Inflector::underscore($Model->alias) . '_' . $Model->primaryKey;
            }

            $settings[$target_name] = array(
                'target_model' => $target_model,
                'join_table_name' => $join_table_name,
                'target_fk' => $target_fk,
                'model_fk' => $model_fk
            );
        }
        debug($settings);die();
        $this->settings[$Model->alias] = $settings;
        
    }

    public function beforeFind(Model $model, $query) {
        parent::beforeFind($model, $query);
        
        if($query['fields'] == null) {
            $query['fields'][] = $model->alias . '.*';
        }
        $query['fields'][] = $model->alias . '.id as HahManyThroughHABTM_ID';
        
        $this->query = $query;
        return $query;
    }
    
    public function afterFind(Model $model, $results, $primary) {
        parent::afterFind($model, $results, $primary);
        
        foreach ($results as $i => $element) {
            $element_id = $element[$model->alias]['HahManyThroughHABTM_ID'];
            
            foreach ($this->settings[$model->alias] as $target_name => $target_meta) {
                $target_model = $target_meta['target_model'];
                $fields = array( $target_model->alias . '.*' );
                $join = array(
                    'table' => $target_meta['join_table_name'],
                    'alias' => 'join',
                    'conditions' => 'join.' . $target_meta['target_fk'] . ' = ' 
                    . $target_model->alias . '.' . $target_model->primaryKey
                );
                $conditions = array(
                    'join.' . $target_meta['model_fk'] . ' = ' . $element_id
                );
                
                $target_list = $target_model->find('all', array(
                    'fields' => $fields,
                    'joins' => array($join),
                    'conditions' => $conditions,
                    'recursive' => -1,
                ));
                
//                $tmp_list = array();
//                foreach ($target_list as $j => $value) {
//                    
//                    foreach ($target_list[$j][$target_model->alias] as $k => $v) {
//                        $tmp_list[$k] = $v;
//                    }
//                    
//                    foreach ($target_list as $k => $v) {
//                        if($k != $target_model->alias) {
//                            $tmp_list[$k] = $v;
//                        }
//                    }
//                    
//                }
//                $target_list = $tmp_list;
                $results[$i][$target_model->alias] = $target_list;
                
            }
            unset($results[$i][$model->alias]['HahManyThroughHABTM_ID']);
            
        }
                
//        debug($results);
        return $results;
        
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