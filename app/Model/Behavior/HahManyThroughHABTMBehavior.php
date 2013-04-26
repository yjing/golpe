<?php

class HahManyThroughHABTMBehavior extends ModelBehavior {
    
    public function setup(Model $Model, $settings = array()) {
        
        debug($settings);
        debug($this->settings[$Model->alias]);
        
    }

    public function afterFind(Model $model, $results, $primary) {
        parent::afterFind($model, $results, $primary);
        
        if($primary) {
            
            $joinModel = $this->settings[$model->alias][HasMediaBehavior::$setting_joinTable_Model];
            foreach ($results as $key => $value) {
                $id = $value[$model->alias]['id'];
                $media = $this->Media->find('all', array(
                    'joins' => array(
                        array(
                            'table' => $joinModel->table,
                            'alias' => $joinModel->alias,
                            'conditions' => $joinModel->alias . '.media_id = ' . $this->Media->alias . '.id'
                        )
                    ),
                    'fields' => array($this->Media->alias . '.*'),
                    'conditions' => $joinModel->alias . '.activity_log_id = '.$id,
                    'recursive' => -1
                ));
                
                $results[$key]['Media'] = $media;
            }
            
            return $results;
        }
        
    }
    
}