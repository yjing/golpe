<?php

App::import('Component', 'Notification');
class NotificationShell extends AppShell {
    
    public function notify() {
        
        $Notification = new NotificationComponent(null, null);
        $Notification->notify();
        
    }

}

?>
