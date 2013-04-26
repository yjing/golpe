<?php

App::import('Controller', 'REST');

class ActivityLogsController extends RESTController {

    public $uses = array('ActivityLog', 'ActivityLogMedia', 'User');
    public $components = array('Session', 'RequestHandler');
    
    public function beforeFilter() {
        parent::beforeFilter();
    }
    
    public function index() {
        parent::index();
        
        $db = $this->User->getDataSource();
        $u = $db->fullTableName($this->ActivityLog);
        $d = $db->fullTableName($this->ActivityLogMedia);
        debug($u);
        debug($d);
        
        $r = $db->buildStatement(
            array(
                'recursive' => -1,
                'joins' => array(
                    array(
                        'table' => $db->fullTableName($this->Uses),
                        'alias' => 'User',
                        'type' => 'LEFT',
                        'conditions' => array('ActivityLog.user_id = User.id')
                    )
                )
            ),
            $this->ActivityLog
        );
        debug($r);
        die();
        $user = $this->Auth->user();
        
        $mode = "";
        if(isset($this->request->query['mode'])) {
            $mode = $this->request->query['mode'];
        }
        if(!in_array($mode, array("mine", "team", "public"))) {
            $mode = "mine";
        }
        
        $conditions = array();
        switch ($mode) {
            case "team":
                $conditions["ActivityLog.user_id"] = $this->User->getTeamComponentsId($user['id']);
                break;
            case "public":
                $conditions["ActivityLog.visibility_level"] = "PUBLIC";
                break;
            default:
                $conditions["ActivityLog.user_id"] = $user['id'];
                break;
        }
        
        
        $this->ActivityLog->contain(array(
            "Media" => array("id", "user_id", "visibility_level"),
            "Comment" => array("id", "user_id", "visibility_level"),
            "User" => array("id", "username", "role")
        ));
        
        $this->_setResponseJSON($this->ActivityLog->find('all',
            array(
                'conditions' => $conditions,
                'recursive' => 1
            )
        ));
    }

    public function view($id = null) {
        parent::view($id);
        
        $user = $this->Session->read("Auth.User");
        
        $this->ActivityLog->contain(array(
            "Media" => array(
                "id", 
                "filename", 
                "content-type", 
                "content-size", 
                "status",
                "visibility_level",
                "created", 
                "modified",
                "meta",
                "has_thumb",
                "User" => array("id", "username")
            ),
            "Comment" => array(
                "id", 
                "content",
                "visibility_level", 
                "created", 
                "modified",
                "User" => array("id", "username"),
                "Media" => array(
                    "id", 
                    "filename", 
                    "content-type", 
                    "content-size", 
                    "status",
                    "visibility_level",
                    "created", 
                    "modified",
                    "meta",
                    "User" => array("id", "username")
                )
            ),
            "User" => array("id", "username", "role", "created", "modified")
        ));
        
        $this->_setResponseJSON($this->ActivityLog->find('first',
            array(
                'conditions' => array(
                    'ActivityLog.id' => $id
                ),
                'recursive' => 2
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
    
}

?>
