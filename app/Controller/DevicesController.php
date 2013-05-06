<?php

App::import('Controller', 'REST');

class DevicesController extends RESTController {

//    public $actsAs = array();


    public function beforeFilter() {
        parent::beforeFilter();
    }
    
    public function index() {
        parent::index();
        
        $result = $this->Device->find('all', array(
            'associations' => array(
                'DeviceProperty'
            )
        ));
        
        $this->_setResponseJSON($result);
    }

    public function view($id = null) {
        parent::view($id);
        
        $this->_ReportUnsupportedMethod();
    }

    public function add() {
        parent::add();
        
        $this->_ReportUnsupportedMethod();
        
    }

    public function edit($id = null) {
        parent::edit($id);
        
        $this->_ReportUnsupportedMethod();
    }

    public function delete($id = null) {
        parent::delete($id);
        
        $this->_ReportUnsupportedMethod();
        
    }

}

?>
