<?php

class LogActionsComponent extends Component {
    
    private $config;
    
    public function startup(Controller $controller) {
        parent::startup($controller);
        $this->config = $this->getConfigElement($controller->components, 'LogActions', true);
        debug($controller->action);
    }
    
    public function beforeRender(Controller $controller) {
        parent::beforeRender($controller);
        debug($controller->response->statusCode());
        debug($controller->action);
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