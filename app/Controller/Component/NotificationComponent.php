<?php
App::uses('Model', 'ActivityLog');
App::uses('Model', 'Comment');
App::uses('Model', 'Media');
class NotificationComponent extends Component {
    
    private $ActivityLog = null;
    
    public function initialize(Controller $controller) {
        debug($controller->components['Notification']);
    }
    
    public function notify($type, $id, $options = array()) {
        $notification = array();
        switch ($type) {
            case 'ActivityLog':
                $this->ActivityLog = new ActivityLog();
                debug($id);
                debug($this->ActivityLog->find('first', array(
                    'ActivityLog.id' => $id,
                    'recursive' => -1
                )));

                break;

            default:
                break;
        }
    }
    
}