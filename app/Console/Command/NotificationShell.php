<?php

App::import('Component', 'Notification');
App::import('Component', 'ComponentController');
//App::import('Controller', 'App');
class NotificationShell extends AppShell {
    
    public function notify() {
        $Collection = new ComponentCollection();
//        $Collection->init(new AppController());
        $Notification = new NotificationComponent($Collection, array('Email'));
        $Notification->notify();
        
    }

}

?>
