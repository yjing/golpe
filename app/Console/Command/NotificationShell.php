<?php

class NotificationShell extends AppShell {
    
    public $components = array('Notification');
    
    public function notify() {
        
        // This user is used to inform the UserAwareModel (Media) that the 
        // call has been issued by the SHELL and has access to all data.
        App::uses('CakeSession', 'Model/Datasource');
        CakeSession::write("Auth.User", array(
            'id' => '-1',
            'username' => 'msc.shell',
            'role' => 'SHELL'
        ));
        
        $this->Notification->notify();
        
    }

}

?>
