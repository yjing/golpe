<?php

//App::import('Component', 'Notification');
//App::import('Component', 'ComponentController');
App::uses('Notification', 'Controller/Component');
class NotificationShell extends AppShell {
    
    public $components = array('Notification');


    public function notify() {
        
//        $Notification = new NotificationComponent(new ComponentCollection(), null);
        $this->Notification->notify();
        
    }

}

?>
