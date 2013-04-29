<?php
require_once 'NotificationProvider.php';
class Email implements NotificationProvider {
    
    public function notify($notifications) {
        $user_notifications = array();
        $public_notifications = array();
        foreach ($notifications as $key => $notification) {
            $ids = $notification['Notification']['to'];
            if(strlen($ids)>0) {
                $ids = split(", ", $notification['Notification']['to']);
                
                foreach ($ids as $k => $id) {
                    if(!isset($user_notifications[$id])) {
                        $user_notifications[$id] = array();
                    }
                    $user_notifications[$id][] = $notification;
                }
                
            } elseif ($notification['Notification']['public']) {
                $public_notifications[] = $notification;
            }
        }
        
        $this->_sendUserNotifications($user_notifications);
        $this->_sendPabilcNotifications($public_notifications);
        
        debug($user_notifications);
        
    }
    
    private function _sendUserNotifications($notifications) {
        
    }
    
    private function _sendPabilcNotifications($notifications) {
        
    }
    
}