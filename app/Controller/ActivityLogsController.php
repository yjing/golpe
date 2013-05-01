<?php

App::import('Controller', 'REST');

class ActivityLogsController extends RESTController {

    public $uses = array('ActivityLog', 'TeamUser', 'User', 'Log');
    public $components = array('Session', 'RequestHandler', 'Notification' => array('test'=>'TEST'));
    
    public function beforeFilter() {
        parent::beforeFilter();
    }
    
    public function index() {
        parent::index();
        
        $user = $this->Auth->user();
        $role = $user['role'];
        $team = $this->User->getTeam($user['id']);
        
        $mode = "";
        $modes = $this->_roles = Configure::read("APPCONFIG.activity_logs_modes");
        if(isset($this->request->query['mode'])) {
            $mode = $this->request->query['mode'];
        }
        if(!in_array($mode, $modes[$role]['modes'])) {
            $mode = $modes[$role]['default'];
        }
        
        $conditions = array();
        switch ($mode) {
            case "all":
                break;
            case "news":
                $last_access = $this->Log->getLastAccess();
                // RETRIEVE NEWS... TODO
                if($role == 'SUPERVISOR') {
                    $conditions["Supervisor.supervisor_id"] = $user['id'];
                } elseif ($role == 'STUDENT') {
                    $conditions["ActivityLog.user_id !="] =  $user['id'];
                }
                $conditions["ActivityLog.modifieds >"] = 'date(' . $last_access . ')';
                break;
            case "team":
                $conditions["ActivityLog.user_id"] = $this->User->getTeamComponentsId($user['id']);
                break;
            case "public":
                $conditions["ActivityLog.visibility_level"] = "PUBLIC";
                break;
            default: //"mine"
                $conditions["ActivityLog.user_id"] = $user['id'];
                break;
        }
        
        $results = $this->ActivityLog->find('all',
            array(
                'conditions' => $conditions,
                'recursive' => -1,
                'HABTMrecursive' => 3
            )
        );
        
        $results = $this->_formatDates($results, time(), array('created', 'modified'));
        
        $this->_setResponseJSON($results);
        
        // LOGGING
        $this->logs['result'] = true;
        $this->logs['resource'] = 'ActivityLog';
    }
    
    private function _formatDates($data, $now, $fields) {
        foreach ($data as $key => $value) {
            if(is_array($value)) {
                $data[$key] = $this->_formatDates($value, $now, $fields);
            } else {
                if(in_array($key, $fields)) {
                    // FORMAT DATE
                    $data_time = strtotime($value);
                    $delta = $now - $data_time;
                    if ($delta <= 60) {
                        $data[$key . '_human'] = 'now';
                    } elseif ($delta < 1 * 60 * 60) {
                        $data[$key . '_human'] = date("G:i", $data_time);
                    } else {
                        $data[$key . '_human'] = date("d M", $data_time);
                    }
                    
                }
            }
        }
        return $data;
    }

    public function view($id = null) {
        parent::view($id);
        
        $user = $this->Session->read("Auth.User");
        
        $this->_setResponseJSON($this->ActivityLog->find('first',
            array(
                'conditions' => array(
                    'ActivityLog.id' => $id
                ),
                'recursive' => -1,
                'HABTMrecursive' => 3
            )
        ));
        
        // LOGGING
        $this->logs['result'] = true;
        $this->logs['resource'] = 'ActivityLog';
        $this->logs['resource_id'] = $id;
    }

    public function add() {
        parent::add();
        
        if(isset($this->request->data[$this->ActivityLog->alias]['created'])) {
            unset($this->request->data[$this->ActivityLog->alias]['created']);
        }
        if(isset($this->request->data[$this->ActivityLog->alias]['modified'])) {
            unset($this->request->data[$this->ActivityLog->alias]['modified']);
        }
        
        $saved = $this->ActivityLog->save($this->request->data);
        
        $this->Notification->createNotification('ActivityLog', $saved['ActivityLog']['id']);
        
        $this->_setResponseJSON($saved);
        
        // LOGGING
        if ($saved) {
            $this->logs['result'] = true;
            $this->logs['resource'] = 'ActivityLog';
            $this->logs['resource_id'] = $saved['ActivityLog']['id'];
            $this->logs['important'] = $saved['ActivityLog']['question']=='true';
        }
    }

    public function update($id = null) {
        parent::update($id);
        
        if(isset($this->request->data[$this->ActivityLog->alias]['created'])) {
            unset($this->request->data[$this->ActivityLog->alias]['created']);
        }
        if(isset($this->request->data[$this->ActivityLog->alias]['modified'])) {
            unset($this->request->data[$this->ActivityLog->alias]['modified']);
        }
        
        $this->ActivityLog->id = $id;
        $saved = $this->ActivityLog->save($this->data);
        
        $this->_setResponseJSON($saved);
        
        // LOGGING
        if ($saved) {
            $this->logs['result'] = true;
            $this->logs['important'] = $saved['ActivityLog']['question']===1;
        }
        $this->logs['resource_id'] = $id;
    }

    public function delete($id = null) {
        parent::delete($id);
        
        $deleted = $this->ActivityLog->delete($id);
        
        $this->_setResponseJSON(array('deleted'=>$deleted));
        
        // LOGGING
        if ($deleted) {
            $this->logs['result'] = true;
        }
        $this->logs['resource_id'] = $id;
    }
    
    public function modes() {
        $user = $this->Auth->user();
        $role = $user['role'];
        $modes = $this->_roles = Configure::read("APPCONFIG.activity_logs_modes.$role");
        $this->_setResponseJSON($modes);
        
        //LOGGING
        $this->logs['result'] = true;
        $this->logs['resource'] = null;
        $this->logs['resource_id'] = null;
    }
    
}
