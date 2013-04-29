<?php
App::uses('Model', 'ActivityLog');
App::uses('Model', 'Comment');
App::uses('Model', 'User');
class NotificationComponent extends Component {
    
    private $ActivityLog = null;
    private $User = null;
    
    public function initialize(Controller $controller) {
        debug($controller->components['Notification']);
        $this->User = new User();
    }
    
    public function notify($type, $id, $options = array()) {
        $notification = array();
        switch ($type) {
            case 'ActivityLog':
                $this->ActivityLog = new ActivityLog();
                $element = $this->ActivityLog->find('first', array(
                    'conditions' => array('ActivityLog.id' => $id),
                    'recursive' => -1
                ));
                debug($element);
                $team_users = $this->User->find('all', array(
                    'conditions' => array(
                        'Team.id' => $element['Team']['id']
                    ),
                    'recursive' => -1
                ));
                debug($team_users);
//                $team_users = $this->User->find('all', array(
//                    'conditions' => array(
//                        'Team.id' => $element['Team']['id']
//                    ),
//                    'recursive' => -1
//                ));
//                debug($team_users);

                break;

            default:
                break;
        }
    }
    
}