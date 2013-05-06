<?php

App::import('Controller', 'REST');
class ProjectsController extends RESTController {
    public function index() {
        parent::index();
        
        $results = $this->Project->find('all', array(
            'associations' => array(
                'Team'
            )
        ));
        
        $this->_setResponseJSON($results);
        
    }
    public function view($id = null) {
        parent::view($id);
        $this->_ReportUnsupportedMethod();
    }
    public function add() {
        parent::add();
        $this->_ReportUnsupportedMethod();
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