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
            } else {
                App::import('Model', $target_name);
                $target_class = new ReflectionClass($target_name);
            }
            
            if(isset($options['join_table_name'])) {
                $join_table_name = $options['join_table_name'];
            } else {
                $join_model_a = array(Inflector::tableize($target_name), $Model->useTable);
                sort($join_model_a);
                $join_table_name = implode($join_model_a, '_');
            }
            
            if(isset($options['target_fk'])) {
                $target_fk = $options['target_fk'];
            } else {
                $target_fk = Inflector::underscore($target_name) . '_id';
            }
            
            if(isset($options['model_fk'])) {
                $model_fk = $options['model_fk'];
            } else {
                $model_fk = Inflector::underscore($Model->alias) . '_' . $Model->primaryKey;
            }
            
            if(isset($options['join_type'])) {
                $join_type = $options['join_type'];
            } else {
                $join_type = 'LEFT';
            }

            $settings[$target_name] = array(
                'target_model_class' => $target_class,
                'target_model_alias' => $target_name,
                'join_table_name' => $join_table_name,
                'join_type' => $join_type,
                'target_fk' => $target_fk,
                'model_fk' => $model_fk
            );
//            debug($settings);
        }
        
        $this->settings[$Model->alias] = $settings;
        
    }

    public function beforeFind(Model $model, $query) {
        parent::beforeFind($model, $query);
        
        if($query['fields'] == null) {
            $query['fields'] = array();
            $query['fields'][] = $model->alias . '.*';
        }
        $query['fields'][] = $model->alias . '.id as HahManyThroughHABTM_ID';
        
        $HABTMrecursive = 1;
        if(isset($query['HABTMrecursive'])) {
            $HABTMrecursive = $query['HABTMrecursive'];
        }
//        $query['fields'][] = '\'' . $HABTMrecursive . '\' as HABTMrecursive';
        
        $this->query = $query;
        return $query;
    }
    
    public function afterFind(Model $model, $results, $primary) {
        parent::afterFind($model, $results, $primary);
        
        foreach ($results as $i => $element) {
//            $HABTMrecursive = $element[0]['HABTMrecursive'];
//            if($HABTMrecursive > 0) {
                $element_id = $element[$model->alias]['HahManyThroughHABTM_ID'];

                foreach ($this->settings[$model->alias] as $target_name => $target_meta) {
                    $target_model_class = $target_meta['target_model_class'];
                    $target_model = $target_model_class->newInstanceArgs();
                    
                    $fields = array( $target_model->alias . '.*' );
                    $join = array(
                        'table' => $target_meta['join_table_name'],
                        'alias' => 'join',
                        'type' => $target_meta['join_type'],
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
//                        'HABTMrecursive' => $HABTMrecursive - 1,
                    ));
                    
                    foreach ($target_list as $key => $value) {
                        unset($target_list[$key][$target_model->alias]);
                        unset($value[$target_model->alias]['HahManyThroughHABTM_ID']);
                        $target_list[$key][$target_meta['target_model_alias']] = $value[$target_model->alias];
                    }
                    
                    $results[$i][$target_meta['target_model_alias']] = $target_list;
                    

                }
                
                unset($results[$i][$model->alias]['HahManyThroughHABTM_ID']);
                
//            }
            unset($results[$i][0]);
            
        }
                
        return $results;
        
    }
     
}