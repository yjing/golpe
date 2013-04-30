<?php
require_once '../../../../../Controller/Component/Notification/NotificationProvider.php';

App::import('Model', 'User');
class Android implements NotificationProvider {
    
    private $User = null;
    
    public function notify($notifications) {
    }
    
}