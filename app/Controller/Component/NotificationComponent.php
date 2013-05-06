<?php
App::import('Model', 'ActivityLog');
App::import('Model', 'Comment');
App::import('Model', 'User');
App::import('Model', 'Notification');
App::import('Model', 'NotificationTime');

class NotificationComponent extends Component {
    
    private $models = array();
    
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
            $last_notification_t = $this->NotificationTime->field('last_notification_time');
            $last_notification_time = strtotime($last_notification_t);
            
            echo "$provider provider:\n";
            if(($now - $last_notification_time) > $time_lapse) {
                echo "$provider provider: start notification procedure.\n";
                
                $result = $this->Notification->find('all', array(
                    'conditions' => array('Notification.created >' => $last_notification_t),
                    'recursive' => -1
                ));
                
                $count = count($result);
                if($count > 0) {

                    App::uses($provider, 'Controller/Component/Notification');  
                    $target_class = new ReflectionClass($provider);
                    $provider_obj = $target_class->newInstanceArgs();
                    $provider_obj->notify($result);
                    
                    echo "Notified $count elements.\n";

                    $new_time = $result[$count - 1]['Notification']['created'];
                    $this->NotificationTime->saveField('last_notification_time', $new_time);
                    
                } else {
                    echo "No elements to notify.\n";
                }
                
            } else {
                echo "Not started\n";
            }
            echo "---------------------------------------------------------------\n";
            
        }
        
        
    }


    public function createNotification($type, $id, $options = array()) {
        
        $model = $this->getModel($type);
        if(isset($model->belongsTo['User'])){
            $element = $model->find('first', array(
                'conditions' => array(
                    $model->alias . '.' . $model->primaryKey => $id
                ),
                'associations' => array(
                    'User' => array(
                        'associations' => array(
                            'Supervisor' => array("unArray_if_single_value"),
                            'Team' => array(
                                "unArray_if_single_value",
                                'associations' => array(
                                    'Student'
                                )
                            )
                        )
                    )
                )
            ));
            if($element) {
                
                $visibility_level = Set::get($element, "/$model->alias/visibility_level");
                if($visibility_level != 'PUBLIC') {
                    $recipients = $this->generateRecipients($element);
                }
                
                $notification = array(
                    'Notification' => array(
                        'type' => $type,
                        'public' => ($visibility_level == 'PUBLIC'),
                        'to' => implode($recipients, ', ')
                    )
                );
                switch ($type) {
                    case 'ActivityLog':
                        //message & priority
                        $res_id = Set::get($element, "/ActivityLog/id");
                        $notification['Notification']['resource'] = "ActivityLog:$res_id";
                        $notification['Notification']['message'] = Set::get($element, "/ActivityLog/title");
                        $notification['Notification']['priority'] = Set::get($element, "/ActivityLog/question") == true;
                        break;

                    default:
                        break;
                }
                debug($notification);die();
            }
            debug(Set::get($element, "/$model->alias/visibility_level"));
            debug(Set::get($element, "/$model->alias/title"));
            debug(Set::get($element, "/$model->alias/User/Supervisor/id"));
            debug(Set::extract($element, "/$model->alias/User/Team/Student/id"));
            die();
        }
        switch ($type) {
            case 'ActivityLog':
                $this->ActivityLog = new ActivityLog();
                $element = $this->ActivityLog->find('first',
                    array(
                        'conditions' => array(
                            'ActivityLog.id' => $id
                        ),
                        'recursive' => -1,
                        'associations' => array(
                            'User' => array(
                                'associations' => array(
                                    'Supervisor' => array("unArray_if_single_value"),
                                    'Team' => array(
                                        "unArray_if_single_value",
                                        'associations' => array(
                                            'Student'
                                        )
                                    )
                                )
                            )
                        )
                    )
                );
                
//                debug($element);
//                die();
                
                $visibility_level = $element['ActivityLog']['visibility_level'];
                if($visibility_level == 'PRIVATE') {
                    break;
                }
                
                $notification['Notification']['message'] = $element['ActivityLog']['title'];
                if($element['ActivityLog']['question']) {
                    $notification['Notification']['priority'] = true;
                }
                
                if(in_array($visibility_level, array('SUPERVISOR'))) {
                    $notification_users[] = $element['ActivityLog']['User']['Supervisor']['id'];
                }
                
                if(in_array($visibility_level, array('TEAM'))) {
                    // TEAM AL go also to Supervisor
                    $notification_users[] = $element['ActivityLog']['User']['Supervisor']['id'];
                    
//                    $team_users = $this->User->getTeamComponents($element['ActivityLog']['User']['Team']['id']);
                    foreach ($element['ActivityLog']['User']['Team']['Student'] as $key => $value) {
                        $notification_users[] = $value['id'];
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


    private function getModel($class_name) {
        
        if(array_key_exists($class_name, $this->models)) {
            $model = $this->models[$class_name];
        } else {
            $model = $this->loadModel($class_name);
            $this->models[$class_name] = $model;
        }
        
        return $model;
    }
    
    private function loadModel($model_name) {
        App::import('Model', $model_name);
        $class = new ReflectionClass($model_name);
        return $class->newInstanceArgs();
    } 
    
}