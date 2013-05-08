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
        
        $result = $this->getDafaultFormattedDevices();
        $this->_setResponseJSON($result);
    }

    public function view($id = null) {
        parent::view($id);
        
        $this->Device->id = $id;
        if(!$this->Device->exists()) {
            throw new NotFoundException();
        }
        
        $result = $this->getDafaultFormattedDevice($id);
        $this->_setResponseJSON($result);
        
    }

    public function add() {
        parent::add();
        
        $this->Device->create();
        $this->Device->data['Device']['visibility_level'] = 'PRIVATE';
        $this->_setResponseJSON( $this->Device->save() );
        return;
        if (isset($this->request->data)) {
            $data = Set::remove($this->request->data, 'Device.id');
            $data['Device']['visibility_level'] = 'PRIVATE';
            
            $props = Set::expand($data, "/Device/DeviceProperty");
            $this->DeviceProperty->set($props);
            if(!$this->DeviceProperty->validates()) {
                debug($this->DeviceProperty->validationErrors);
            }
            
        }
        die();
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
                $rm_props = Set::extract('/RemoveDeviceProperty', $data);
                $rm_props_ids = Set::extract('/RemoveDeviceProperty/key', $rm_props);
                if(count($rm_props_ids) > 0) {
                    $conditions = array(
                        'device_id' => $id
                    );
                    if(count($rm_props_ids) == 1) {
                        $conditions['key'] = $rm_props_ids[0];
                    } else {
                        $conditions['key IN'] = $rm_props_ids;
                    }

                    $this->DeviceProperty->deleteAll($conditions, false);
                }
                
                $props = Set::extract('/DeviceProperty', $data);
                $props = Set::remove($props, '{n}.DeviceProperty.device_id');
                $props = Set::insert($props, '{n}.DeviceProperty.device_id', $id);
                $props_ids = Set::extract('/DeviceProperty/key', $props);
                if(count($props_ids) > 0) {
                    $conditions = array(
                        'device_id' => $id
                    );
                    if(count($props_ids) == 1) {
                        $conditions['key'] = $props_ids[0];
                    } else {
                        $conditions['key'] = $props_ids;
                    }

                    $db_props = $this->DeviceProperty->find('all', array(
                        'recursive' => -1,
                        'conditions' => $conditions
                    ));

                    $props = Set::merge($db_props, $props);

                    $saved = $this->DeviceProperty->saveAll($props);
                    if($saved) {
                        $result = $props;
                    }
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
        
        throw new MethodNotAllowedException();
        
    }

    public function delete($id = null) {
        parent::delete($id);
        
        throw new MethodNotAllowedException();
        
    }
    
    
    private function getDafaultFormattedDevice($id) {
        return $this->Device->find('all', array(
            'conditions' => array( 'Device.id' => $id ),
            'fields' => array('id', 'user_id', 'visibility_level'),
            'associations' => array(
                'DeviceProperty' => array(
                    'fields' => array('key', 'value')
                )
            )
        ));
    }
    
    private function getDafaultFormattedDevices() {
        return $this->Device->find('all', array(
            'fields' => array('id', 'user_id', 'visibility_level'),
            'associations' => array(
                'DeviceProperty' => array(
                    'fields' => array('key', 'value')
                )
            )
        ));
    }
}

?>
