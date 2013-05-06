<?php

App::import('Model', 'Log');
class LogActionsComponent extends Component {
    
    private $config;
    private $logged_user;
    private $Log;
    
    private $log_id;
    private $method;
    private $controller_path;
    private $resource_name;
    private $resource_id = null;
    private $importance = 0;
    private $action_result = false;
    private $action_user_result = true;
    
    public function startup(Controller $controller) {
        parent::startup($controller);
        
        $this->config = $this->getConfigElement($controller->components, 'LogActions', true);
        $this->log_actions = $this->getConfigElement($this->config, 'log_actions', true);
        if(count($this->log_actions) == 0 || in_array($controller->action, $this->log_actions)) {
            // GET LOGGED USER
            $this->logged_user = CakeSession::read('Auth.User');
            
            // SET DEFAULT VALUES
            $this->resource_name = $controller->modelClass;
            $this->resource_id = null;
            if(isset($controller->request->params['pass'][0])) {
                $this->resource_id = $controller->request->params['pass'][0];
            }
            $this->importance = false;
            $this->action_result = false;
            
            if(isset($controller->request->params['[method]'])) {
                $this->method = $controller->request->params['[method]'];
            }
            if(isset($controller->request->params['controller'])) {
                $this->controller_path = $controller->request->params['controller'];
            }
            
            $log = array(
                'Log' => array(
                    'user_id' => $this->logged_user['id'],
                    'session_id' => CakeSession::id(),
                    'method' => $this->method,
                    'controller' => $this->controller_path,
                    'action' => $controller->action,
                    'resource' => $this->resource_name,
                    'resource_id' => $this->resource_id,
                    'importance' => $this->importance,
                    'result' => $this->action_result
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
        if(count($this->log_actions) == 0 || in_array($controller->action, $this->log_actions)) {
            $log = array(
                'Log' => array(
                    'id' => $this->log_id,
                    'resource' => $this->resource_name,
                    'resource_id' => $this->resource_id,
                    'importance' => $this->importance,
                    'result' => $this->action_user_result && ( $controller->response->statusCode() < 300 )
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
    
    public function setImportance($important) {
        $this->importance = $important;
    }
    
    public function setActionResult($result) {
        $this->action_user_result = $result;
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