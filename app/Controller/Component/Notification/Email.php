<?php
require_once 'NotificationProvider.php';
class Email implements NotificationProvider {
    
    public function notify($notifications) {
        $user_ids = array();
        foreach ($notifications as $key => $value) {
            $ids = split(", ", $value['Notification']['to']);
            array_merge($user_ids, $ids);
        }
        debug($user_ids);
    }
    
}