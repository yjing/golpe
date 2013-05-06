<?php

App::import('Controller', 'REST');

class DevicesController extends RESTController {

//    public $actsAs = array();
    public $components = array(
            'Session', 
            'RequestHandler'
        );    
    
    public function index() {
        parent::index();
        
        $result = $this->Device->find('all', array(
            'fields' => array('id', 'user_id'),
            'associations' => array(
                'DeviceProperty' => array(
                    'fields' => array('key', 'value')
                )
            )
        ));
        
        $this->_setResponseJSON($result);
    }

    public function view($id = null) {
        parent::view($id);
        
        $result = $this->Device->find('first', array(
            'conditions' => array('Device.id' => $id),
            'fields' => array('id', 'user_id'),
            'associations' => array(
                'DeviceProperty' => array(
                    'fields' => array('key', 'value')
                )
            )
        ));
        
        $this->_setResponseJSON($result);
    }

    public function add() {
        parent::add();
        
        $data = $this->request->input();
        try {
            $data = json_decode($data);
            debug($data);
        } catch (Exception $e) {
            debug($e->getMessage());
        }
        
        die();
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
