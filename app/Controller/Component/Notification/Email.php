<?php
require_once 'NotificationProvider.php';
class Email implements NotificationProvider {
    
    public function notify($notifications) {
        $user_ids = array();
        foreach ($notifications as $key => $value) {
            $ids = $value['Notification']['to'];
            if(strlen($ids)>0) {
                $ids = split(", ", $value['Notification']['to']);
                debug($ids);
                $user_ids = array_merge($user_ids, $ids);
            }
        }
        debug(array_unique($user_ids));
    }
    
}