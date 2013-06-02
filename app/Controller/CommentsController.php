<?php

App::import('Controller', 'REST');

class CommentsController extends RESTController {

    public $uses = array('Comment', 'ActivityLog');
    public $components = array('LogActions');
    
    public function index() {
        parent::index();
        
        
        $result = $this->Comment->find('all', array(
            'associations' => array(
                'ActivityLog' => array(
                    'fields' => array('id', 'user_id')
                )
            )
        ));
        
        $this->_setResponseJSON($result);
        
    }

    public function view($id = null) {
        parent::view($id);
        
        $this->Comment->id = $id;
        if(!$this->Comment->exists()) {
            throw new NotFoundException();
        }
        
        $result = $this->Comment->find('first', array(
            'conditions' => array('Comment.id' => $id),
            'associations' => array(
                'ActivityLog' => array(
                    'fields' => array('id', 'user_id')
                )
            )
        ));
        
        $this->_setResponseJSON($result);
        $this->LogActions->setActionResult(count($result) == 1);
        
    }

    public function add() {
        parent::add();
        
        if ($this->request->data) {
            $data = Set::remove($this->request->data, 'Comment.id');

            if($this->Comment->save($data)) {
                $this->_setResponseJSON( $this->getDafaultFormattedComment($this->Comment->id) );
            } else {
                if(count($this->Comment->validationErrors) > 0) {
                    $this->_ReportDataValidationErrors($this->Comment->validationErrors);
                } else {
                    throw new BadRequestException();
                }
            }
        } else {
            throw new BadRequestException();
        }
        
    }

    public function update($id = null) {
        parent::update($id);
        throw new MethodNotAllowedException();
    }

    public function delete($id = null) {
        parent::delete($id);
        
        $this->Comment->id = $id;
        if(!$this->Comment->exists()) {
            throw new NotFoundException();
        }
        
        $deleted = $this->Comment->delete($id);
        $this->_setResponseJSON(array('deleted'=>$deleted));
        
    }
    
    private function getDafaultFormattedComment($id) {
        return $this->Comment->find('first', array(
            'conditions' => array('Comment.id' => $id),
            'associations' => array(
                'ActivityLog' => array(
                    'fields' => array('id', 'user_id')
                )
            )
        ));
    }
    
}

?>
