<?php

App::import('Controller', 'REST');

class ActivityLogsController extends RESTController {

    public $uses = array('ActivityLog', 'TeamUser', 'User');
    public $components = array('Session', 'RequestHandler');
    
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
                // RETRIEVE NEWS... TODO
                break;
            case "team":
                $conditions["AUTHTeam.id"] = $team['Team']['id'];
//                $conditions["ActivityLog.user_id"] = $this->User->getTeamComponentsId($user['id']);
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
                'recursive' => -1
            )
        );
        
        $results = $this->_formatDates($results, time(), array('created', 'modified'));
        
        $this->_setResponseJSON($results);
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
                    if ($delta <= 60000) {
                        $data[$key] = 'now';
                    } elseif ($delta < 12 * 60 * 60 * 1000) {
                        $data[$key] = date("G:i", $data_time);
                    } else {
                        $data[$key] = date("d M", $data_time);
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
                'recursive' => -1
            )
        ));
    }

    public function add() {
        parent::add();
        
        $saved = $this->ActivityLog->save($this->request->data);
        $this->_setResponseJSON($saved);
    }

    public function update($id = null) {
        parent::update($id);
        
        $this->ActivityLog->id = $id;
        $this->_setResponseJSON($this->ActivityLog->save($this->data));
        
    }

    public function delete($id = null) {
        parent::delete($id);
        
        $deleted = $this->ActivityLog->delete($id);
        
        $this->_setResponseJSON(array('deleted'=>$deleted));
        
    }
    
    public function modes() {
        $user = $this->Auth->user();
        $role = $user['role'];
        $modes = $this->_roles = Configure::read("APPCONFIG.activity_logs_modes.$role");
        $this->_setResponseJSON($modes);
    }
    
}
