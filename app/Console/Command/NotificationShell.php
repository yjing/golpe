<?php

App::import('Component', 'Notification');
App::import('Component', 'ComponentController');
class NotificationShell extends AppShell {
    
    public function notify() {
        
        $Collection = new ComponentCollection();
        $Notification = new NotificationComponent($Collection, Configure::read("APPCONFIG.notification.providers"));
        $Notification->notify();
        
    }

}

?>
