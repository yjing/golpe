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
            array('conditions' => array('Comment.user_id' => $user['id']))
        ));
    }

    public function view($id = null) {
        parent::view($id);
        $this->_setResponseJSON($this->Comment->findById($id));
    }

    public function add() {
        parent::add();
        
        $saved = $this->Comment->save($this->request->data);
        $this->_setResponseJSON($saved);
    }

    public function update($id = null) {
        parent::update($id);
        
        $this->_ReportUnsupportedMethod();
    }

    public function delete($id = null) {
        parent::delete($id);
        
        $deleted = $this->Comment->delete($id);
        
        $this->_setResponseJSON(array('deleted'=>$deleted));
        
    }
    
}

?>
