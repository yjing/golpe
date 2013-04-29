<?php

App::import('Component', 'Notification');
App::import('Component', 'ComponentController');
class NotificationShell extends AppShell {
    
    public function notify() {
        
        $Notification = new NotificationComponent(new ComponentCollection(), null);
        $Notification->notify();
        
    }

}

?>
