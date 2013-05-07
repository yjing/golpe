<?php

App::import('Controller', 'REST');

class UsersController extends RESTController {

    public $uses = array('User', 'Profile');
    
    public function beforeFilter() {
        $this->Auth->allow(array('add', 'login', 'logout'));
        parent::beforeFilter();
    }
    
    public function index() {
        parent::index();
        
        $result = $this->getDafaultFormattedUsers();
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
                $saved = $this->User->save($data);
                
                if($saved) {
                    
                    if(!empty($profile)) {
                        $profile = Set::insert($profile, 'user_id', $saved['User']['id']);
                        $this->Profile->set($profile);
                        $saved_profile = $this->User->save($profile);

                        if(!$saved_profile) {
                            $this->User->getDataSource()->rollback();
                            throw new InternalErrorException();
                        }
                    }
                    
                    $saved = $this->getDafaultFormattedUser($saved['User']['id'], FALSE);
                    $this->User->getDataSource()->commit();
                    
                } else {
                    $this->User->getDataSource()->rollback();
                    throw new InternalErrorException();
                }
            } else {
                $this->_ReportValidationErrors($errors);
            }
            
        } else {
            throw new BadRequestException();
        }
        
        $this->_setResponseJSON($saved);
    }

    public function update($id = null) {
        parent::update($id);
        
        $data = $this->request->data;
        if($data) {
            
            $this->User->id = $id;
            if($this->User->exists()) {
                $data = Set::remove($data, 'User.id');
                $data = Set::remove($data, 'User.username');
                
                $this->User->getDataSource()->begin();
                $saved = $this->User->save($data);
                if($saved) {
                    
                    $profile = Set::get($data, '/User/Profile');
                    if(isset($profile)) {
                        $profile = array('Profile'=>$profile);
                        $profile = Set::insert($profile, 'Profile.user_id', $id);
                        
                        $saved_p = $this->Profile->save($profile);
                        
                        if($saved_p) {
                            $this->User->getDataSource()->commit();
                        } else {
                            $this->User->getDataSource()->rollback();
                        }
                    }
                    
                    $saved = $this->getDafaultFormattedUser($id, false);
                    
                }
                
            } else {
                throw new NotFoundException();
            }
            
        } else {
            throw new BadRequestException();
        }
        $this->_setResponseJSON($saved);
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
    
    private function getDafaultFormattedUsers($show_activity_logs = false) {
        $options = array(
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