<?php

class HahManyThroughHABTMBehavior extends ModelBehavior {
    
    private $query;
    
    public function setup(Model $Model, $settings = array()) {
        if(!is_array($settings)) {
            $settings = array($settings);
        }
        
        foreach ($settings as $target_name => $options) {
            if(isset($options['target_model_name'])) {
                $target_model_name = $options['target_model_name'];
                App::import('Model', $options['target_model_name']);
                $target_class = new ReflectionClass($options['target_model_name']);
//                $target_model = $target_class->newInstanceArgs();
            } else {
                $target_model_name = $target_name;
                App::import('Model', $target_name);
                $target_class = new ReflectionClass($target_name);
//                $target_model = $target_class->newInstanceArgs();
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
                'model_alias' => $target_name,
                'join_table_name' => $join_table_name,
                'target_fk' => $target_fk,
                'model_fk' => $model_fk
            );
            
            if(isset($options['join_type'])) {
                $settings[$target_name]['join_type'] = $options['join_type'];
            }
        }
        
        $this->settings[$Model->alias] = $settings;
        
    }

    public function beforeFind(Model $model, $query) {
        parent::beforeFind($model, $query);
        
        if($query['fields'] == null) {
            $query['fields'][] = $model->alias . '.*';
        }
        $query['fields'][] = $model->alias . '.id as HahManyThroughHABTM_ID';
        
        $HABTMrecursive = 1;
        if(isset($query['HABTMrecursive'])) {
            $HABTMrecursive = $query['HABTMrecursive'];
        }
        $query['fields'][] = $HABTMrecursive . ' as HABTMrecursive';
        
        debug($query);return false;
        
        $this->query = $query;
        return $query;
    }
    
    public function afterFind(Model $model, $results, $primary) {
        parent::afterFind($model, $results, $primary);
        
        foreach ($results as $i => $element) {
            $HABTMrecursive = $element[$model->alias]['HABTMrecursive'];
            debug($HABTMrecursive);
            if($HABTMrecursive > 0) {
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
                        'HABTMrecursive' => $HABTMrecursive - 1,
                    ));

                    $results[$i][$target_model->alias] = $target_list;

                }
                unset($results[$i][$model->alias]['HahManyThroughHABTM_ID']);
                
            }
            unset($results[$i][$model->alias]['HABTMrecursive']);
            
        }
                
        return $results;
        
    }
     
}