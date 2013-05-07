<?php

App::import('Controller', 'REST');

class CommentsController extends RESTController {

    public $uses = array('Comment');
    public $components = array('Session', 'RequestHandler');
    
    public function beforeFilter() {
        parent::beforeFilter();
    }

    public function index() {
        parent::index();
        
        $user = $this->Session->read("Auth.User");
        
        $this->_setResponseJSON($this->Comment->find('all',
            array(
                'conditions' => array('Comment.user_id' => $user['id']),
                'recursive' => -1,
                'associations' => array(
                    'ActivityLog' => array(
                        'fields' => array('id', 'user_id')
                    )
                )
            )
        ));
        
        // LOGGING
        $this->logs['result'] = true;
        $this->logs['resource'] = 'Comment';
    }

    public function view($id = null) {
        parent::view($id);
        $this->_setResponseJSON($this->Comment->findById($id));
        
        // LOGGING
        $this->logs['result'] = true;
        $this->logs['resource'] = 'Comment';
        $this->logs['resource_id'] = $id;
    }

    public function add() {
        parent::add();
        
        $saved = $this->Comment->save($this->request->data);
        $this->_setResponseJSON($saved);
        // LOGGING
        if ($saved) {
            $this->logs['result'] = true;
            $this->logs['resource'] = 'Comment';
            $this->logs['resource_id'] = $saved['Comment']['id'];
        }
    }

    public function update($id = null) {
        parent::update($id);
        throw new MethodNotAllowedException();
    }

    public function delete($id = null) {
        parent::delete($id);
        
        $deleted = $this->Comment->delete($id);
        
        $this->_setResponseJSON(array('deleted'=>$deleted));
        // LOGGING
        if ($deleted) {
            $this->logs['result'] = true;
            $this->logs['resource'] = 'Comment';
            $this->logs['resource_id'] = $deleted['Comment']['id'];
        }
        
    }
    
}

?>
