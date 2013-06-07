<?php

App::import('Controller', 'REST');

class UsersController extends RESTController {

    public $uses = array('User', 'Profile');
    
    public function beforeFilter() {
        $this->Auth->allow(array('add', 'login', 'logout', 'user'));
        parent::beforeFilter();
    }
    
    public function index() {
        parent::index();
        
        $logged_user = $this->Auth->user();
        
        $result = $this->getDafaultFormattedUsers();
        $final = array();
        if ($logged_user['role'] == 'SUPERVISOR') {
            foreach ($result as $index => $user) {
                if(isset($user['User']['Supervisor']) 
                        && isset($user['User']['Supervisor']['id'])
                        && $user['User']['Supervisor']['id'] == $logged_user['id']) {
                    $final[] = $user;
                }
            }
            $result = $final;
        }
        $this->_setResponseJSON($result);
    }

    public function view($id = null) {
        parent::view($id);
        
        $this->User->id = $id;
        if (!$this->User->exists()) {
            throw new NotFoundException();
        }
        $result = $this->getDafaultFormattedUser($id);
        $this->_setResponseJSON($result);
    }

    public function add() {
        parent::add();
        
        $data = $this->request->data;
        if($data) {
            // REMOVE EVENTUAL CLIENT PROVIDED USER.ID
            $data = Set::remove($this->request->data, 'User.id');
            $profile = Set::get($data, '/User/Profile');
            
            // DATA VALIDATION
            $validation_errors = array();
            $this->User->set($data);
            if(!$this->User->validates()) {
                $validation_errors['User'] = $this->User->validationErrors;
            }
            if(!empty($profile)) {
                $this->Profile->set($profile);
                if(!$this->Profile->validates()) {
                    $validation_errors['User']['Profile'] = $this->Profile->validationErrors;
                }
            }
            
            if(empty($validation_errors)) {
                $this->User->getDataSource()->begin();
                $saved = $this->User->save();
                
                if($saved) {
                    
                    if(!empty($profile)) {
                        $profile = Set::insert($profile, 'user_id', $saved['User']['id']);
                        $this->Profile->set($profile);
                        $saved_profile = $this->Profile->save();

                        if(!$saved_profile) {
                            $this->User->getDataSource()->rollback();
                            throw new InternalErrorException();
                        }
                    }
                    
                    $this->User->getDataSource()->commit();
                    $saved = $this->getDafaultFormattedUser($saved['User']['id'], false);
                    $this->_setResponseJSON($saved);
                    
                } else {
                    $this->User->getDataSource()->rollback();
                    throw new InternalErrorException();
                }
            } else {
                $this->_ReportDataValidationErrors($validation_errors);
            }
            
        } else {
            throw new BadRequestException();
        }
        
    }

    public function update($id = null) {
        parent::update();
        
        $data = $this->request->data;
        if($data) {
            // REMOVE EVENTUAL CLIENT PROVIDED USER.ID
            $data = Set::remove($this->request->data, 'User.id');
            $profile = Set::get($data, '/User/Profile');
            
            // DATA VALIDATION
            $validation_errors = array();
            $this->User->id = $id;
            $this->User->set($data);
            if(!$this->User->validates()) {
                $validation_errors['User'] = $this->User->validationErrors;
            }
            if(!empty($profile)) {
                $this->Profile->set($profile);
                if(!$this->Profile->validates()) {
                    $validation_errors['User']['Profile'] = $this->Profile->validationErrors;
                }
            }
            
            if(empty($validation_errors)) {
                $this->User->getDataSource()->begin();
                $saved = $this->User->save();
                
                if($saved) {
                    
                    if(!empty($profile)) {
                        $profile = Set::insert($profile, 'user_id', $id);
                        $this->Profile->set($profile);
                        $saved_profile = $this->Profile->save();

                        if(!$saved_profile) {
                            $this->User->getDataSource()->rollback();
                            throw new InternalErrorException();
                        }
                    }
                    
                    $this->User->getDataSource()->commit();
                    $saved = $this->getDafaultFormattedUser($id, false);
                    $this->_setResponseJSON($saved);
                    
                } else {
                    $this->User->getDataSource()->rollback();
                    throw new InternalErrorException();
                }
            } else {
                $this->_ReportDataValidationErrors($validation_errors);
            }
            
        } else {
            throw new BadRequestException();
        }
        
    }
    
    public function edit($id = null) {
        parent::edit($id);
        throw new MethodNotAllowedException();
    }

    public function delete($id = null) {
        parent::delete($id);
        $this->User->id = $id;
        if (!$this->User->exists()) {
            throw new NotFoundException();
        }
        
        $query = "delete from users where id = $id";
        $deleted = $this->User->query($query);
        
        $this->_setResponseJSON(array('deleted'=>is_array($deleted)));
        
    }

    public function user() {
        $this->_setResponseJSON(array(
                'logged'=>$this->Auth->loggedIn(),    
                'User'=>$this->Auth->user()
            )
        );
    }
    
    public function assignSupervisor($u_id = null, $s_id = null) {
        if($u_id == null || $s_id == null) {
            debug("IDS = NULL");
            throw new BadRequestException();
        }
        $student = $this->User->find('first', array(
            'conditions' => array('User.id' => $u_id),
            'recursive' => -1
        ));
        $sup = $this->User->find('first', array(
            'conditions' => array('User.id' => $s_id),
            'recursive' => -1
        ));
        if($student == null || $sup == null) {
            debug("SOMEONE NOT EXISTS");
            throw new BadRequestException();
        }
        
        debug($student);
        $existing = $student['User']['Supervisor'];
        debug("EXISTING");
        debug($existing);
        if($existing) {
            $query = "update students_supervisors set supervisor_id = $s_id where student_id = $u_id";
            $result = $this->User->query($query);
        } else {
            $query = "insert into students_supervisors values ($u_id, $s_id)";
            $result = $this->User->query($query);
        }
        if($result){
            $result = $this->getDafaultFormattedUser($id);
            $this->_setResponseJSON($result);
        } else {
            debug("NO RESULT");
            throw new BadRequestException();
        }
    }
    
    public function login() {
        if ($this->request->is('post')) {
            $this->Auth->logout();
            $loggedIn = $this->Auth->login();
            
            
            $this->_setResponseJSON(array(
                    'logged'=>$loggedIn,    
                    'User'=>$this->Auth->user()
                )
            );
        } else {
            throw new MethodNotAllowedException();
        }
    }

    public function logout() {
        $this->Auth->logout();
        $this->_setResponseJSON(array(
                'logged'=>false, 
                'user'=>null
            )
        );
    }
    
    /**
     * HELPERS 
     */
    
    private function getDafaultFormattedUser($id, $show_activity_logs = true) {
        $options = array(
            'conditions' => array('User.id' => $id),
            'associations' => array(
                'Profile',
                'Team' => array(
                    'fields' => array('id', 'name', 'project_id'),
                    'associations' => array(
                        'Project' => array(
                            'fields' => array('id', 'name')
                        )
                    )
                ),
                'Supervisor' => array(
                    "unArray_if_single_value",
                    "fields" => array('id', 'username', 'role')
                )
            ));
        
        if($show_activity_logs) {
            $options['associations']['ActivityLog'] = array(
                "unArray_if_single_value",
                "fields" => array('id', 'title', 'content')
            );
        }
        
        $result = $this->User->find('first', $options);
        $result = Set::remove($result, 'User.password');
        $result = Set::remove($result, 'User.Supervisor.password');
        $result = Set::remove($result, 'User.{n}.Supervisor.password');
        return $result;
    }
    
    private function getDafaultFormattedUsers($conditions = null, $show_activity_logs = false) {
        $options = array(
            'associations' => array(
                'Profile',
                'Team' => array(
                    'fields' => array('id', 'name', 'project_id'),
                    'associations' => array(
                        'Project' => array(
                            "unArray_if_single_value",
                            'fields' => array('id', 'name')
                        )
                    )
                ),
                'Supervisor' => array(
                    "unArray_if_single_value",
                    "fields" => array('id', 'username', 'role')
                )
            )
        );
        if($show_activity_logs) {
            $options['associations']['ActivityLog'] = array(
                "unArray_if_single_value",
                "fields" => array('id', 'title', 'content')
            );
        }
        
        $result = $this->User->find('all', $options);
        
        $result = Set::remove($result, '{n}.User.password');
        $result = Set::remove($result, '{n}.User.Supervisor.password');
        $result = Set::remove($result, '{n}.User.{n}.Supervisor.password');
        return $result;
    }

    private function _CheckUniqueUsername($username, $throw = true) {
        $user = $this->User->findByUsername($username);
        if ($user && count($user) > 0 && $throw) {
            throw new BadRequestException();
        }
        return !($user && count($user) > 0);
    }

}
