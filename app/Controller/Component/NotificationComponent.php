<?php
class NotificationComponent extends Component {
    public function initialize(Controller $controller) {
        debug($controller->components['Notification']);
    }
    
    public function notify($type, $element, $options = array()) {
        $notification = array();
        switch ($type) {
            case 'ActivityLog':
                debug($type);
                debug($element);

                break;

            default:
                break;
        }
    }
    
}