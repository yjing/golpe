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
        
        throw new MethodNotAllowedException();
    }

    public function edit($id = null) {
        parent::edit($id);
        
        throw new MethodNotAllowedException();
        
    }

    public function delete($id = null) {
        parent::delete($id);
        
        $this->Device->id = $id;
        if (!$this->Device->exists()) {
            throw new NotFoundException();
        }
        
        $query = "delete from devices where id = '$id';";
        $deleted = $this->Device->query($query);
        
        $this->_setResponseJSON(array('deleted'=>is_array($deleted)));
        
        
    }
    
    public function setProperty($device_id, $key, $value) {
        parent::add();
        
        $this->Device->id = $device_id;
        if (!$this->Device->exists()) {
            throw new NotFoundException();
        }
//        $device = $this->getDafaultFormattedDevice($this->Device->id);
//        
//        $property = $this->DeviceProperty->find('first', array(
//            'conditions' => array(
//                'device_id' => $device_id,
//                'key' => $key
//            ),
//            'recursive' => -1
//        ));
        
        $property = array(
            'device_id' => $device_id,
            'key' => $key,
            'value' => $value
        );
        if($this->DeviceProperty->save($property)) {
            $this->getDafaultFormattedDevice($device_id);
        } else {
            $this->_ReportDataValidationErrors($this->DeviceProperty->validationErrors);
        }
    }


    public function unsetProperty($device_id, $key) {
        
    }




    private function getDafaultFormattedDevice($id) {
        return $this->Device->find('first', array(
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
