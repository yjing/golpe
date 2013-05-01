<?php

App::import('Model', 'UserAwareModel');
class Log extends AppModel {

    public $name = 'Log';
    public $useTable = "logs";
    
    public function getLastAccess() {
        $result = $this->find('first', array(
            'fields' => 'max(Log.created) as last_access',
            'conditions' => array(
                'Log.session_id !=' => CakeSession::id()
            ),
            'recursive' => -1
        ));
        return $result[0]['last_access'];
    }
}
?>
