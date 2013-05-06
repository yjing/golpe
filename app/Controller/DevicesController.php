<?php

App::import('Controller', 'REST');

class DevicesController extends RESTController {

    public $uses = array('Device', 'DeviceProperty');

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
            $result = array();
            
            $this->Device->getDataSource()->begin();
            $data['Device']['visibility_level'] = 'PRIVATE';
            $saved = $this->Device->save($data);
            
            if($saved) {
                $props = Set::extract('/DeviceProperty', $data);
                $props = Set::insert($props, '{n}.DeviceProperty.device_id', $saved['Device']['id']);
                
                $this->DeviceProperty->getDataSource()->begin();
                $prop_save = $this->DeviceProperty->saveAll($props);
                
                if($prop_save) {
                    $this->DeviceProperty->getDataSource()->commit();
                    $this->Device->getDataSource()->commit();
                    
                    $result = Set::insert($saved, 'DeviceProperty', $props);
                    
                } else {
                    $this->DeviceProperty->getDataSource()->rollback();
                    $this->Device->getDataSource()->rollback();
                }
                
            }
        } else {
            throw new BadRequestException("Data format error.");
        }
        
        $this->_setResponseJSON($result);
    }
    
    public function update($id = null) {
        parent::update($id);
        
        $result = array();
        $this->Device->id = $id;
        if($this->Device->exists()) {
            $data = json_decode($this->request->input(), true);
            
            if ($data) {
                // NO NEED TO UPDATE NOTHING ON THE DEVICE, JUST PROPERTIES
                $props = Set::extract('/DeviceProperty', $data);
                $props = Set::remove($props, '{n}.DeviceProperty.device_id');
                $props = Set::insert($props, '{n}.DeviceProperty.device_id', $id);
                debug($props);
                $props_ids = Set::extract('/DeviceProperty/key', $props);
                debug($props_ids);die();
                
                
                $saved = $this->DeviceProperty->saveAll($props);
                if($saved) {
                    $result = $result;
                }
                
            } else {
                throw new BadRequestException("Data format error.");
            }
        } else {
            throw new BadRequestException("Device doesn't exists.");
        }
        
        $this->_setResponseJSON($result);
        
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
