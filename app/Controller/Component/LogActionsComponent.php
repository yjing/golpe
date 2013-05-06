<?php

class LogActionsComponent extends Component {
    
    private $config;
    
    public function startup(Controller $controller) {
        parent::startup($controller);
        if(isset($controller->components[$this->name])) {
            $this->config = $controller->components[$this->name];
        }
    }
    
    public function beforeRender(Controller $controller) {
        parent::beforeRender($controller);
        debug($this->config);
        debug($controller->action);
    }
}