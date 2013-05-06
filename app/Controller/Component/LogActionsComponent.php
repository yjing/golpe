<?php

class LogActionsComponent extends Component {
    public function startup(Controller $controller) {
        parent::startup($controller);
        debug($controller->action);
    }
    
    public function beforeRender(Controller $controller) {
        parent::beforeRender($controller);
        debug($controller->action);
    }
}