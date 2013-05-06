<?php

App::import('Model', 'Log');
class LogActionsComponent extends Component {
    
    private $config;
    private $logged_user;
    private $Log;
    
    private $log_id;
    private $resource_name;
    private $resource_id = null;
    private $important = false;
    private $action_rerult = false;
    
    public function startup(Controller $controller) {
        parent::startup($controller);
        
        $this->config = $this->getConfigElement($controller->components, 'LogActions', true);
        $this->log_actions = $this->getConfigElement($this->config, 'log_actions', true);
        if(in_array($controller->action, $this->log_actions)) {
            // GET LOGGED USER
            $this->logged_user = CakeSession::read('Auth.User');
            
            // SET DEFAULT VALUES
            $this->resource_name = $controller->modelClass;
            $this->resource_id = null;
            if(isset($controller->request->params['id'])) {
                $this->resource_id = $controller->request->params['id'];
            }
            $this->important = false;
            $this->action_rerult = false;
            
            $log = array(
                'Log' => array(
                    'user_id' => $this->logged_user['id'],
                    'session_id' => CakeSession::id(),
                    'method' => $controller->request->params['[method]'],
                    'controller' => $controller->request->params['controller'],
                    'action' => $controller->action,
                    'resource' => $this->resource_name,
                    'resource_id' => $this->resource_id,
                    'important' => $this->important,
                    'result' => $this->action_rerult
                )
            );
        
            debug($log);die();
            
            $this->Log = new Log();
            $saved = $this->Log->save($log);
            
            if($saved) {
                $this->log_id = $saved['Log']['id'];
            }
        }
    }
    
    public function beforeRender(Controller $controller) {
        parent::beforeRender($controller);
        if(in_array($controller->action, $this->log_actions)) {
            
            $log = array(
                'Log' => array(
                    'id' => $this->log_id,
                    'resource' => $this->resource_name,
                    'resource_id' => $this->resource_id,
                    'important' => $this->important,
                    'result' => $this->action_rerult && ( $controller->response->statusCode() < 300 )
                )
            );
            $this->Log->save($log);
        }
    }
    
    public function setResourceName($res_name) {
        $this->resource_name = $res_name;
    }
    
    public function setResourceId($res_id) {
        $this->resource_id = $res_id;
    }
    
    public function setImportant($important) {
        $this->important = $important;
    }
    
    public function setActionResult($result) {
        $this->action_rerult = $result;
    }


    public function getConfigElement($config_array, $key, $always_return_array) {
        $result = null;
        if($always_return_array) {
            $result = array();
        }
        
        if(isset($config_array)) {
            if(in_array($key, $config_array, true)) {
                $result = array();
            } elseif (array_key_exists($key, $config_array)) {
                $result = $config_array[$key];
            }
        }
        return $result;
    }
}