<?php
App::import('Model', 'ActivityLog');
App::import('Model', 'Comment');
App::import('Model', 'User');
App::import('Model', 'Notification');
App::import('Model', 'NotificationTime');

class NotificationComponent extends Component {
    
    private $Notification = null;
    private $NotificationTime = null;
    private $ActivityLog = null;
    private $User = null;
    
    public function initialize(Controller $controller) {
    }
    
    public function notify() {
        
        $this->Notification = new Notification();
        $this->NotificationTime = new NotificationTime();
        $now = time();
        
        foreach ($this->settings as $provider => $options) {
            
            $time_lapse = $options['time_lapse'];
            
            $this->NotificationTime->id = $provider;
            $last_notification_time = $this->NotificationTime->field('last_notification_time');
            
            $last_notification_time = strtotime($last_notification_time);
            $time_limit = $last_notification_time + $time_lapse;
            
            $do_notify = $now - $time_limit >= 0;
            debug($do_notify);
            
            if($do_notify) {
                $result = $this->Notification->find('all', array(
                    'conditions' => array('Notification.created >' => $last_notification_time),
                    'recursive' => -1
                ));

                $count = count($result);

                if($count > 0) {

    //                App::uses($provider, 'Controller/Component/Notification');
    //                $target_class = new ReflectionClass($provider);
    //                $provider_obj = $target_class->newInstanceArgs();
    //                $provider_obj->notify($result);

                    $new_time = $result[$count - 1]['Notification']['created'];
                    $this->NotificationTime->saveField('last_notification_time', $new_time);
                }
            }
            
        }
        
        
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