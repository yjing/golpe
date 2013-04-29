<?php

App::import('Component', 'Notification');
class NotificationShell extends AppShell {
    
    public function notify() {
        
        $Notification = new NotificationComponent();
        $Notification->notify();
        
    }

}

?>
