<?php

App::import('Controller', 'REST');
class ProjectsController extends RESTController {
    public function index() {
        parent::index();
        
        $results = $this->Project->find('all', array(
            'associations' => array(
                'Team' => array(
                    'associations' => array(
                        'Student' => array(
                            'fields' => array('id', 'username')
                        )
                    )
                )
            )
        ));
        
        $this->_setResponseJSON($results);
        
    }
    public function view($id = null) {
        parent::view($id);
        
        $results = $this->Project->find('first', array(
            'conditions' => array(
                'Project.id' => $id
            ),
            'associations' => array(
                'Team' => array(
                    'associations' => array(
                        'Student' => array(
                            'fields' => array('id', 'username')
                        )
                    )
                )
            )
        ));
        
        $this->_setResponseJSON($results);
    }
    public function add() {
        parent::add();
        
        $data = Set::remove($this->request->data, 'Project.id');
        $saved = $this->Project->save($data);
        $this->_setResponseJSON($saved);
        
    }
    public function update($id = null) {
        parent::update($id);
        $this->_ReportUnsupportedMethod();
    }
    public function delete($id = null) {
        parent::delete($id);
        $this->_ReportUnsupportedMethod();
    }
}