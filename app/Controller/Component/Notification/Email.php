<?php
require_once 'NotificationProvider.php';
class Email implements NotificationProvider {
    
    public function notify($notifications) {
        $user_notifications = array();
        foreach ($notifications as $key => $notification) {
            $ids = $notification['Notification']['to'];
            if(strlen($ids)>0) {
                $ids = split(", ", $value['Notification']['to']);
                
                foreach ($ids as $k => $id) {debug($id);
                    if(!isset($user_notifications[$id])) {
                        $user_notifications[$id] = array();
                    }
                    $user_notifications[$id][] = $notification;
                }
                
            } elseif ($notification['Notification']['public']) {
                
            }
        }
        
        debug($user_notifications);
        
    }
    
}