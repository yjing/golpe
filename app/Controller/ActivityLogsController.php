<?php

App::import('Controller', 'REST');

class ActivityLogsController extends RESTController {

    public $uses = array('ActivityLog', 'TeamUser', 'User', 'Log');
    public $components = array(
        'Session',
        'LogActions',
        'Notification'
    );
    
    public function index() {
        parent::index();
        
        $user = $this->Auth->user();
        $role = $user['role'];
        
        $mode = "";
        $modes = $this->_roles = Configure::read("APPCONFIG.activity_logs_modes");
        if(isset($this->request->query['mode'])) {
            $mode = $this->request->query['mode'];
        }
        if(!in_array($mode, $modes[$role]['modes'])) {
            $mode = $modes[$role]['default'];
        }
        
        $conditions = array();
        switch ($mode) {
            case "all":
                break;
            case "news":
                $last_access = $this->Log->getLastAccess();
                debug($last_access);
                // RETRIEVE NEWS... TODO
                if($role == 'SUPERVISOR') {
                    $conditions["StudentsSupervisor.supervisor_id"] = $user['id'];
                } elseif ($role == 'STUDENT') {
                    $conditions["ActivityLog.user_id !="] =  $user['id'];
                }
                $conditions[] = "timestamp(ActivityLog.modified) > timestamp('$last_access')";
                break;
            case "team":
                $conditions["ActivityLog.user_id"] = $this->User->getTeamComponentsId($user['id']);
                break;
            case "public":
                $conditions["ActivityLog.visibility_level"] = "PUBLIC";
                break;
            default: //"mine"
                $conditions["ActivityLog.user_id"] = $user['id'];
                break;
        }
        
        $results = $this->getDafaultFormattedALs($conditions);
        
        $results = $this->_formatDates($results, time(), array('created', 'modified'));
        $this->_setResponseJSON($results);
        
    }
    
    private function _formatDates($data, $now, $fields) {
        foreach ($data as $key => $value) {
            if(is_array($value)) {
                $data[$key] = $this->_formatDates($value, $now, $fields);
            } else {
                if(in_array($key, $fields)) {
                    // FORMAT DATE
                    $data_time = strtotime($value);
                    $data[$key . '_num'] = $data_time;
                    $delta = $now - $data_time;
                    if ($delta <= 60) {
                        $data[$key . '_human'] = 'now';
                    } elseif ($delta < 1 * 60 * 60) {
                        $data[$key . '_human'] = date("G:i", $data_time);
                    } else {
                        $data[$key . '_human'] = date("d M", $data_time);
                    }
                    
                }
            }
        }
        return $data;
    }

    public function view($id = null) {
        parent::view($id);
        $this->ActivityLog->id = $id;
        
        $result = null;
        if(!$this->ActivityLog->exists()) {
            $this->response->statusCode(204);
        } else {
        
            $result = $this->getExtendedFormattedAL($id);

            if(count($result) == 0) {
                throw new UnauthorizedException();
            }
            
            $result = $this->_formatDates($result, time(), array('created', 'modified'));
        }
        
        $this->_setResponseJSON($result);
        $this->LogActions->setActionResult(count($result) == 1);
    }

    public function add() {
        parent::add();
        
        $saved = false;
        if ($this->request->data) {
            $data = Set::remove($this->request->data, 'ActivityLog.id');

            $saved = $this->ActivityLog->save($this->request->data);
            if ($saved) {
                $saved = $this->getDafaultFormattedAL($saved['ActivityLog']['id']);
                $saved = $this->_formatDates($saved, time(), array('created', 'modified'));
                $this->_setResponseJSON($saved);

                $this->Notification->createNotification('ActivityLog', $saved['ActivityLog']['id']);
            } else {
                $this->_ReportDataValidationErrors($this->ActivityLog->validationErrors);
            }
        } else {
            throw new BadRequestException();
        }
        
        // LOGGING
        if ($saved) {
            $this->LogActions->setResourceId($saved['ActivityLog']['id']);
            
            $importance = 1;
            if(isset($saved['ActivityLog']['question']) && $saved['ActivityLog']['question']=='true') {
                $importance += 1;
            }
            if( isset($this->request->data['Media']) ) {
                $importance += 1;
            }
            $this->LogActions->setImportance($importance);
        } else {
            $this->LogActions->setActionResult(false);
        }
    }

    public function update($id = null) {
        parent::update($id);
        
        $saved = false;
        if ($this->request->data) {
            $this->ActivityLog->id = $id;
            if(!$this->ActivityLog->exists()) {
                throw new NotFoundException();
            }

            $saved = $this->ActivityLog->save($this->request->data);
            if ($saved) {
                $saved = $this->getDafaultFormattedAL($id);
                $saved = $this->_formatDates($saved, time(), array('created', 'modified'));
                $this->_setResponseJSON($saved);

                $this->Notification->createNotification('ActivityLog', $id);
            } else {
                $this->_ReportDataValidationErrors($this->ActivityLog->validationErrors);
            }
        } else {
            throw new BadRequestException();
        }
        
        // LOGGING
        if ($saved) {
            $this->LogActions->setResourceId($id);
            
            $importance = 1;
            if(isset($saved['ActivityLog']['question']) && $saved['ActivityLog']['question']=='true') {
                $importance += 1;
            }
            if( isset($this->request->data['Media']) ) {
                $importance += 1;
            }
            $this->LogActions->setImportance($importance);
        } else {
            $this->LogActions->setActionResult(false);
        }
    }

    public function delete($id = null) {
        parent::delete($id);
        
        $deleted = $this->ActivityLog->delete($id);
        
        $this->_setResponseJSON(array('deleted'=>$deleted));
        
        // LOGGING
        if (!$deleted) {
            $this->LogActions->setActionResult(false);
        }
    }
    
    public function modes() {
        $user = $this->Auth->user();
        $role = $user['role'];
        $modes = $this->_roles = Configure::read("APPCONFIG.activity_logs_modes.$role");
        $this->_setResponseJSON($modes);
    }
    
    private function getDafaultFormattedALs($conditions) {
        return $this->ActivityLog->find('all',
            array(
                'conditions' => $conditions,
                'order' => array( 'ActivityLog.modified DESC', 'ActivityLog.question DESC' ),
                'recursive' => -1,
                'associations' => array(
                    'User' => array(
                        'fields' => array('id', 'username', 'role'),
                        'associations' => array(
                            'Supervisor' => array(
                                'fields' => array('id', 'username', 'role')
                            )
                        )
                    ),
                    'Comment' => array(
                        'fields' => array('id')
                    ),
                    'Media' => array(
                        'fields' => array('id')
                    )
                )
            )
        );
    }
    
    private function getDafaultFormattedAL($id) {
        return $this->ActivityLog->find('first',
            array(
                'conditions' => array(
                    'ActivityLog.id' => $id
                ),
                'recursive' => -1,
                'associations' => array(
                    'User' => array(
                        'fields' => array('id', 'username', 'role'),
                        'associations' => array(
                            'Supervisor' => array(
                                'fields' => array('id', 'username', 'role')
                            )
                        )
                    ),
                    'Media' => array(
                        'fields' => array('id', 'filename', 'content-type', 'content-size', 'meta', 'has_thumb', 'status', 'user_id', 'created', 'modified'),
                        'associations' => array(
                            'User' => array('fields' => array('id', 'username'))
                        )
                    ),
                    'Comment' => array(
                        'fields' => array('id', 'content', 'user_id', 'created', 'modified'),
                        'associations' => array(
                            'User' => array('fields' => array('id', 'username')),
                            'Media'
                        )
                    )
                )
            )
        );
    }
    
    private function getExtendedFormattedAL($id, $show_comment_media = true) {
        $options = array(
            'conditions' => array(
                'ActivityLog.id' => $id
            ),
            'recursive' => -1,
            'associations' => array(
                'User' => array(
                    'fields' => array('id', 'username', 'role'),
                    'associations' => array(
                        'Supervisor' => array(
                            'fields' => array('id', 'username', 'role')
                        )
                    )
                ),
                'Media' => array(
                    'fields' => array('id', 'filename', 'content-type', 'content-size', 'meta', 'has_thumb', 'status', 'user_id', 'created', 'modified'),
                    'associations' => array(
                        'User' => array('fields' => array('id', 'username'))
                    )
                ),
                'Comment' => array(
                    'fields' => array('id', 'content', 'user_id', 'created', 'modified'),
                    'associations' => array(
                        'User' => array('fields' => array('id', 'username'))
                    )
                )
            )
        );
        if($show_comment_media) {
            $options['associations']['Comment']['associations']['Media'] = array(
                'fields' => array('id', 'filename', 'content-type', 'content-size', 'meta', 'has_thumb', 'status', 'user_id'),
                'associations' => array(
                    'User' => array('fields' => array('username'))
                )
            );
        }
        return $this->ActivityLog->find('first', $options);
    }
    
}
