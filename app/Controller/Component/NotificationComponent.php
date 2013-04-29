<?php
App::import('Model', 'ActivityLog');
App::import('Model', 'Comment');
App::import('Model', 'User');
App::import('Model', 'Notification');
App::import('Component', 'Notification/Email');
class NotificationComponent extends Component {
    
    private $Notification = null;
    private $ActivityLog = null;
    private $User = null;
    
    public function initialize(Controller $controller) {
    }
    
    public function notify() {
        
        $this->Notification = new Notification();
        $result = $this->Notification->find('all', array(
            'recursive' => -1
        ));
        
        $Email = new Email();
        $Email->notify($result);
        
    }


    public function createNotification($type, $id, $options = array()) {
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
                
                $this->Notification = new Notification();
                $result = $this->Notification->save($notification);

                break;

            default:
                break;
        }
    }
    
}