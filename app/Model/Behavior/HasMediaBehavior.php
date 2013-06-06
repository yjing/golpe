<?php

App::import('Component', 'Session');
App::import('Model', 'Media');
class HasMediaBehavior extends ModelBehavior {
    
    public static $MediaModelName = "Media";
    private static $MediaModelName_ByPass_HABTM = "MediaTMP";
    
    public static $setting_joinTable_Name = "joinTable";
    public static $setting_joinTable_Model = "joinTableModel";
    public static $setting_uploadsBasePath_Name = "uploadsBasePath";
    public static $setting_uploadsBasePath_Default = "/uploads/";
    
    private $Media = null;
    
    public function setup(Model $Model, $settings = array()) {
        
        if (!isset($this->settings[$Model->alias])) {
            $this->settings[$Model->alias] = array(
                HasMediaBehavior::$setting_joinTable_Name => $this->_defaultJoinTable($Model),
                HasMediaBehavior::$setting_uploadsBasePath_Name => HasMediaBehavior::$setting_uploadsBasePath_Default
            );
        }
        $this->settings[$Model->alias] = array_merge(
            $this->settings[$Model->alias], (array)$settings);
        $this->_normalizeBasePath($Model);
        
        
        $this->Media = new Media();
        
        App::import('Model', $this->settings[$Model->alias][HasMediaBehavior::$setting_joinTable_Name]);
        $join_table_CLASS = new ReflectionClass($this->settings[$Model->alias][HasMediaBehavior::$setting_joinTable_Name]);
        $this->settings[$Model->alias][HasMediaBehavior::$setting_joinTable_Model] = $join_table_CLASS->newInstanceArgs();
        
    }
//
//    public function afterFind(Model $model, $results, $primary) {
//        parent::afterFind($model, $results, $primary);
//        
//        if($primary) {
//            
//            $joinModel = $this->settings[$model->alias][HasMediaBehavior::$setting_joinTable_Model];
//            foreach ($results as $key => $value) {
//                $id = $value[$model->alias]['id'];
//                $media = $this->Media->find('all', array(
//                    'joins' => array(
//                        array(
//                            'table' => $joinModel->table,
//                            'alias' => $joinModel->alias,
//                            'conditions' => $joinModel->alias . '.media_id = ' . $this->Media->alias . '.id'
//                        )
//                    ),
//                    'fields' => array($this->Media->alias . '.*'),
//                    'conditions' => $joinModel->alias . '.activity_log_id = '.$id,
//                    'recursive' => -1
//                ));
//                
//                $results[$key]['Media'] = $media;
//            }
//            
//            return $results;
//        }
//        
//    }
    
    public function beforeSave(Model $model) {
        $model->getDataSource()->begin();
        
        $this->_prepMediaData($model);
        // Used to avoid the DEFAULT CakePhp behaviour of saving HABTM associations
        $this->_changeMediaModelName($model);
        
        return true;
    }
    
    public function afterSave(Model $model, $created) {
        $this->_restoreMediaModelName($model);
        if(isset($model->data[HasMediaBehavior::$MediaModelName])){
            // NEW MODEL OBJECT HAS MEDIA TO SAVE AND LINK
            // GET REFERENCE TO THE SAVED DATA
            $has_media_obj = $model->data[$model->alias];
            $has_media_obj_id = null;
            if($created) {
                $has_media_obj_id = $has_media_obj['id'];
            } else {
                $has_media_obj_id = $model->id;
            }
           
            // SAVE RELATED MEDIA
            $this->Media->getDataSource()->begin();
            $joinModel = $this->settings[$model->alias][HasMediaBehavior::$setting_joinTable_Model];
            $joinModel->getDataSource()->begin();
            
            $media_saved = true;
            foreach ($model->data[HasMediaBehavior::$MediaModelName] as $key => $value) {
                // DO NOT CONSIDER 'EMPTY' MEDIA
                debug($value);die();
                if($value['location'] == null || count($value['location']) == 0) {
                    continue;
                }
                
                // IMAGE RELATED OPERATIONS
                // CALCULATES DIMENSIONS AND CREATE THUMBS
                $img = null;
                $has_thumb = false;
                $thumb_big = false;
                $thumb_small = false;
                if(strpos($value['content-type'],'image/') === 0) {
                    // CALCULATES DIMS
                    $img = new Imagick($value['location']);
                    $d = $img->getimagegeometry();
                    $value['meta'] = "width:" . $d['width'] . ";height:" . $d['height'];
                    
                    // WRITES THUMBS IN /tmp
                    $img->cropthumbnailimage(200, 200);
                    $thumb_big_loc =  $value['location'] . ".200.thumb";
                    $thumb_big = $img->writeimage($thumb_big_loc);
                    
                    $img->cropthumbnailimage(75, 75);
                    $thumb_small_loc =  $value['location'] . ".75.thumb";
                    $thumb_small = $img->writeimage($thumb_small_loc);
                    
                    $has_thumb = $thumb_big && $thumb_small;
                }
                
                
                $this->Media->create();
                // Media have to have the same VISIBILITY_LEVEL of the owning object
                $this->Media->data[HasMediaBehavior::$MediaModelName]['visibility_level'] = $model->data[$model->alias]['visibility_level'];
                $this->Media->data[HasMediaBehavior::$MediaModelName]['has_thumb'] = ($has_thumb);
                $new_media = $this->Media->save($value);
                
                if(!$new_media) {
                    $media_saved = false;
                    break;
                } else {
                    $join = array(
                        $joinModel->alias => array(
                            Inflector::underscore($model->alias) . "_" . $model->primaryKey => $has_media_obj_id,
                            Inflector::underscore($this->Media->alias) . "_" . $this->Media->primaryKey => $new_media[HasMediaBehavior::$MediaModelName]['id']
                        )
                    );
            
                    $joinModel->create();
                    $new_join = $joinModel->save($join);
                    
                    if(!$new_join) {
                        $media_saved = false;
                        break;
                    } else {
                        $move_ok = move_uploaded_file($new_media[HasMediaBehavior::$MediaModelName]['location'], 
                                                      $this->settings[$model->alias][HasMediaBehavior::$setting_uploadsBasePath_Name]
                                                      .  $new_media[HasMediaBehavior::$MediaModelName]['id']);
                        
                        // copying thumbs
                        if($has_thumb) {
                            if ($thumb_big) {
                                $thumb_big = rename($thumb_big_loc, $this->settings[$model->alias][HasMediaBehavior::$setting_uploadsBasePath_Name]
                                                      .  $new_media[HasMediaBehavior::$MediaModelName]['id'] . ".200.thumb");
                            }
                            if ($thumb_small) {
                                $thumb_small = rename($thumb_small_loc, $this->settings[$model->alias][HasMediaBehavior::$setting_uploadsBasePath_Name]
                                                      .  $new_media[HasMediaBehavior::$MediaModelName]['id'] . ".75.thumb");
                            }
                            
                        }
                        
                        
                        if(!$move_ok || ( $has_thumb && (!$thumb_big || !$thumb_small))  ) {
                            
                            if ($thumb_big) {
                                unlink($this->settings[$model->alias][HasMediaBehavior::$setting_uploadsBasePath_Name]
                                                        .  $new_media[HasMediaBehavior::$MediaModelName]['id'] . ".200.thumb");
                            }
                            if ($thumb_small) {
                                unlink($this->settings[$model->alias][HasMediaBehavior::$setting_uploadsBasePath_Name]
                                                            .  $new_media[HasMediaBehavior::$MediaModelName]['id'] . ".75.thumb");
                            }
                            if ($move_ok) {
                                unlink($this->settings[$model->alias][HasMediaBehavior::$setting_uploadsBasePath_Name]
                                    .  $new_media[HasMediaBehavior::$MediaModelName]['id']);
                            }
                            
                            $media_saved = false;
                            break;
                        } else {
                            // UPDATE DATA
                            unset($new_media[HasMediaBehavior::$MediaModelName]['location']);
                            $model->data[HasMediaBehavior::$MediaModelName][$key] = $new_media[HasMediaBehavior::$MediaModelName];
                        }
                    }
                }
            }
            
            if (!$media_saved) {
                $joinModel->getDataSource()->commit();
                $this->Media->getDataSource()->rollback();
                $model->getDataSource()->rollback();
                return;
            }
            
            $joinModel->getDataSource()->commit();
            $this->Media->getDataSource()->commit();
            
        }
        $model->getDataSource()->commit();
    }
    
    
    
    /**
     * PRIVATE UTILITIES
     */
    private function _prepMediaData($model) {
        $this->Session = new SessionComponent(new ComponentCollection());
        $user = $this->Session->read("Auth.User");
        
        if (isset($model->data[HasMediaBehavior::$MediaModelName])) {
            foreach ($model->data[HasMediaBehavior::$MediaModelName] as $key => $value) {
                
                if (isset($model->data[HasMediaBehavior::$MediaModelName][$key]['error'])) {
                    unset($model->data[HasMediaBehavior::$MediaModelName][$key]['error']);
                }
                
                $model->data[HasMediaBehavior::$MediaModelName][$key]['filename'] 
                        = $model->data[HasMediaBehavior::$MediaModelName][$key]['name'];
                if(isset($model->data[HasMediaBehavior::$MediaModelName][$key]['name'])) {
                    unset($model->data[HasMediaBehavior::$MediaModelName][$key]['name']);
                }

                $model->data[HasMediaBehavior::$MediaModelName][$key]['location'] 
                        = $model->data[HasMediaBehavior::$MediaModelName][$key]['tmp_name'];
                if(isset($model->data[HasMediaBehavior::$MediaModelName][$key]['tmp_name'])) {
                    unset($model->data[HasMediaBehavior::$MediaModelName][$key]['tmp_name']);
                }

                $model->data[HasMediaBehavior::$MediaModelName][$key]['content-type'] 
                        = $model->data[HasMediaBehavior::$MediaModelName][$key]['type'];
                if(isset($model->data[HasMediaBehavior::$MediaModelName][$key]['type'])) {
                    unset($model->data[HasMediaBehavior::$MediaModelName][$key]['type']);
                }

                $model->data[HasMediaBehavior::$MediaModelName][$key]['content-size'] 
                        = $model->data[HasMediaBehavior::$MediaModelName][$key]['size'];
                if(isset($model->data[HasMediaBehavior::$MediaModelName][$key]['size'])) {
                    unset($model->data[HasMediaBehavior::$MediaModelName][$key]['size']);
                }

                $model->data[HasMediaBehavior::$MediaModelName][$key]['status'] = 'UPLOADING';

                $model->data[HasMediaBehavior::$MediaModelName][$key]['user_id'] = $user['id'];

                if(isset($model->data[HasMediaBehavior::$MediaModelName][$key]['created'])) {
                    unset($model->data[HasMediaBehavior::$MediaModelName][$key]['created']);
                }
                if(isset($model->data[HasMediaBehavior::$MediaModelName][$key]['modified'])) {
                    unset($model->data[HasMediaBehavior::$MediaModelName][$key]['modified']);
                }

            }
        }
    }
    
    private function _changeMediaModelName ($model){
        if(isset($model->data[HasMediaBehavior::$MediaModelName])) {
            $model->data[HasMediaBehavior::$MediaModelName_ByPass_HABTM] = $model->data[HasMediaBehavior::$MediaModelName];
            unset($model->data[HasMediaBehavior::$MediaModelName]);
        }
    }
    
    private function _restoreMediaModelName ($model){
        if(isset($model->data[HasMediaBehavior::$MediaModelName_ByPass_HABTM])) {
            $model->data[HasMediaBehavior::$MediaModelName] = $model->data[HasMediaBehavior::$MediaModelName_ByPass_HABTM];
            unset($model->data[HasMediaBehavior::$MediaModelName_ByPass_HABTM]);
        }
    }
    
    private function _normalizeBasePath($Model) {
        $this->settings[$Model->alias][HasMediaBehavior::$setting_uploadsBasePath_Name] = 
                realpath($this->settings[$Model->alias][HasMediaBehavior::$setting_uploadsBasePath_Name]) . "/";
    }
    
    private function _defaultJoinTable($Model) {
        $joinTable_a = array($Model->alias, HasMediaBehavior::$MediaModelName);
        sort($joinTable_a);
        return implode($joinTable_a);
    }
    
    private function _joinModel($joinTable_ClassName) {
        App::import('Model', $joinTable_ClassName);
        $CLASS = new ReflectionClass($joinTable_ClassName);
        return $CLASS->newInstanceArgs();
    }
    
}
