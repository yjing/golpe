<?php

App::import('Component', 'Notification');
require_once '../../../lib/Cake/Controller/ComponentCollection.php';
class NotificationShell extends AppShell {
    
    public function notify() {
        
        $Notification = new NotificationComponent(new ComponentCollection(), null);
        $Notification->notify();
        
    }

}

?>
