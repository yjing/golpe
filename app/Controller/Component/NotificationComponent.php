<?php
App::uses('Model', 'ActivityLog');
App::uses('Model', 'Comment');
App::uses('Model', 'User');
class NotificationComponent extends Component {
    
    private $ActivityLog = null;
    private $User = null;
    
    public function initialize(Controller $controller) {
        debug($controller->components['Notification']);
    }
    
    public function notify($type, $id, $options = array()) {
        $notification = array(
            'Notification' => array(
                'type' => $type,
                'resource' => $type . ":" . $id,
                'message' => '',
                'priority' => false,
                'public' => false,
                'to' => ""
            )
        );
        $notification_users = array();
        
        $this->User = new User();
        switch ($type) {
            case 'ActivityLog':
                $this->ActivityLog = new ActivityLog();
                $element = $this->ActivityLog->find('first', array(
                    'conditions' => array('ActivityLog.id' => $id),
                    'recursive' => -1
                ));
                $visibility_level = $element['ActivityLog']['visibility_level'];
                if($visibility_level == 'PRIVATE') {
                    break;
                }
                
                $notification['Notification']['message'] = $element['ActivityLog']['title'];
                if($element['ActivityLog']['question']) {
                    $notification['Notification']['priority'] = true;
                }
                
                if(in_array($visibility_level, array('SUPERVISOR'))) {
                    $notification_users[] = $element['Supervisor']['supervisor_id'];
                }
                
                if(in_array($visibility_level, array('TEAM'))) {
                    // TEAM AL go also to Supervisor
                    $notification_users[] = $element['Supervisor']['supervisor_id'];
                    
                    $team_users = $this->User->getTeamComponents($element['Team']['id']);
                    foreach ($team_users as $key => $value) {
                        $notification_users[] = $value['User']['id'];
                    }
                }
                
                if($visibility_level == 'PUBLIC') {
                    $notification['Notification']['public'] = true;
                }
                $notification['Notification']['to'] = implode($notification_users, ', ');
                
                debug($notification);

                break;

            default:
                break;
        }
    }
    
}