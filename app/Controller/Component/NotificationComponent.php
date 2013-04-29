<?php
App::uses('Model', 'ActivityLog');
App::uses('Model', 'Comment');
App::uses('Model', 'User');
class NotificationComponent extends Component {
    
    private $ActivityLog = null;
    private $User = null;
    
    public function initialize(Controller $controller) {
        debug($controller->components['Notification']);
    }
    
    public function notify($type, $id, $options = array()) {
        $this->User = new User();
        $notification = array();
        switch ($type) {
            case 'ActivityLog':
                $this->ActivityLog = new ActivityLog();
                $element = $this->ActivityLog->find('first', array(
                    'conditions' => array('ActivityLog.id' => $id),
                    'recursive' => -1
                ));
//                debug($element);
                debug('NOTIFICATIONS:');
                
                $visibility_level = $element['ActivityLog']['visibility_level'];
                if($visibility_level == 'PRIVATE') {
                    debug("NONE!");
                    break;
                }
                
                if(in_array($visibility_level, array('SUPERVISOR'))) {
                    $supervisor_id = $element['Supervisor']['supervisor_id'];
                    debug("Supervisor: $supervisor_id");
                }
                
                if(in_array($visibility_level, array('TEAM'))) {
                    $team_users = $this->User->getTeamComponents($element['Team']['id']);
                    debug('TEAM:');
                    debug($team_users);
                    
                    $supervisor_id = $element['Supervisor']['supervisor_id'];
                    debug("Supervisor: $supervisor_id");
                }
                
                if(in_array($visibility_level, array('PUBLIC'))) {
                    debug('ALL');
                }
//                $team_users = $this->User->find('all', array(
//                    'conditions' => array(
//                        'Team.id' => $element['Team']['id']
//                    ),
//                    'recursive' => -1
//                ));
//                debug($team_users);

                break;

            default:
                break;
        }
    }
    
}