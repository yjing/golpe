<?php

App::import('Model', 'AssociativeModel');
class Comment extends AssociativeModel {

    public $name = 'Comment';
    public $useTable = "comments";
    public $actsAs = array('HasMedia', 'DataAuthorization');
    public $belongsTo = array(
        "User" => array(
            'fields' => array('id', 'username', 'role')
        )
    );
    public $hasAndBelongsToMany = array(
        "ActivityLog", 
        "Media", 
        "CommentMedia" => array(
            'className' => 'Media',
            'joinTable' => 'comments_media',
            'foreignKey' => 'comment_id',
            'associationForeignKey' => 'media_id'
        )
    );
    
    public $targets = array('ActivityLog');
    
    private $targetModel = null;
    private $targetObject = null;
    private $joinModel = null;
    
    public function beforeSave($options = array()) {
        parent::beforeSave($options);
        
        // A TARGET MODEL id required to save the comment
        if($this->data[$this->alias] 
                && $this->data['Target']
                && $this->data['Target']['alias']
                && $this->data['Target']['id']) {
            
            // TARGET alias has to be listed in the $targets public var
            if(in_array($this->data['Target']['alias'], $this->targets)) {
                
                // Get the LOGGED USER
                $this->Session = new SessionComponent(new ComponentCollection());
                $user = $this->Session->read("Auth.User");
                // Set the user_id on the comment
                $this->data[$this->alias]['user_id'] = $user['id']; 
        
                // Get the TARGET Model
                App::import('Model', $this->data['Target']['alias']);
                $target_CLASS = new ReflectionClass($this->data['Target']['alias']);
                $this->targetModel = $target_CLASS->newInstance();
                
                // And the TARGET object
                $this->targetModel->recursive = -1;
                $this->targetObject = $this->targetModel->find('first', array(
                        'conditions' => array(
                            $this->targetModel->alias . '.' . $this->targetModel->primaryKey => $this->data['Target']['id']
                        )
                    )
                );
                
                // If the object is NULL the comment won't be saved
                if($this->targetObject == null || count($this->targetObject) == 0) {
                    return false;
                }
                
                // Generate JOIN MODEL name
                $joinModel_a = array($this->targetModel->alias, $this->alias);
                sort($joinModel_a);
                $joinModel_name = implode($joinModel_a);
                
                // Import and instantiate JOIN MODEL
                App::import('Model', $joinModel_name);
                $joinTable_CLASS = new ReflectionClass($joinModel_name);
                $this->joinModel = $joinTable_CLASS->newInstanceArgs();

                $this->getDataSource()->begin();
                $this->targetModel->getDataSource()->begin();
                $this->joinModel->getDataSource()->begin();
                
                return true;
                
            }
            
        } 
        
        return false;
        
    }
    
    public function afterSave($created) {
        parent::afterSave($created);
        if ($created) {
            
            // After Comment insertion change Target MODIFICATION DATE
            $this->targetObject[$this->targetModel->alias]['modified'] = $this->data[$this->alias]['modified'];
            $this->targetModel->save($this->targetObject[$this->targetModel->alias]);
            
            $join = array(
                $this->joinModel->alias => array(
                    Inflector::underscore($this->targetModel->alias) . "_" . $this->targetModel->primaryKey => $this->targetObject[$this->targetModel->alias]['id'],
                    Inflector::underscore($this->alias) . "_" . $this->primaryKey => $this->data[$this->alias]['id']
                )
            );
            
            $this->joinModel->create();
            $new_join = $this->joinModel->save($join);
            debug("afterSave::new_join");
            debug($new_join);
            
            
            if(!$new_join) {
                debug("afterSave::rollback");
                $this->getDataSource()->rollback();
                $this->targetModel->getDataSource()->rollback();
                $this->joinModel->getDataSource()->rollback();
                return;
            }
            
        }
        
        $this->getDataSource()->commit();
        $this->targetModel->getDataSource()->commit();
        $this->joinModel->getDataSource()->commit();
        debug("afterSave::COMMITTED");
    }
    
}
?>
