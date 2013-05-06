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
        debug($result);die();
        $this->_setResponseJSON($result);
    }

    public function add() {
        parent::add();
        
        $data = json_decode($this->request->input(), true);
        if($data) {
            $this->Device->getDataSource()->begin();
            $saved = $this->Device->save($data);
            if($saved) {
                debug($saved['Device']['id']);
                $props = Set::extract('/DeviceProperty', $data);
//                $props = Set::insert($props, '/DeviceProperty/device_id', $saved['Device']['id']);
                debug($props);
                
//                $this->_setResponseJSON($result);
                $this->Device->getDataSource()->rollback();
            }
        } else {
            throw new BadRequestException("Data format error.");
        }
        
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
