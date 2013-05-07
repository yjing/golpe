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
        
        $this->User->recursive = 0;
        $result = $this->User->find('all', array(
            'associations' => array(
                'ActivityLog' => array(
                    "unArray_if_single_value",
                    "fields" => array('id', 'title', 'content')
                ),
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
                    "fields" => array('id', 'username', 'role'),
                    'associations' => array(
                        'Supervisor' => array(
                            "unArray_if_single_value",
                            "fields" => array('id', 'username', 'role')
                        )
                    )
                )
            )
        ));
        
        $result = Set::insert($result, '{n}.User.password', '*****');
        $result = Set::insert($result, '{n}.Supervisor.{n}.Supervisor.password', '*****');
        $this->_setResponseJSON($result);
    }

    public function view($id = null) {
        parent::view($id);
        
        $this->User->id = $id;
        if (!$this->User->exists()) {
            $this->_ReportNotExistingUser($id);
        }
        $result = $this->getDafaultFormattedUser($id);
//        $result = $this->User->find('first', array(
//            'conditions' => array('User.id' => $id),
//            'associations' => array(
//                'Profile'
//                ,'ActivityLog' => array(
//                    "unArray_if_single_value",
//                    "fields" => array('id', 'title', 'content')
//                ),
//                'Team' => array(
//                    'fields' => array('id', 'name', 'project_id'),
//                    'associations' => array(
//                        'Project' => array(
//                            'fields' => array('id', 'name')
//                        )
//                    )
//                ),
//                'Supervisor' => array(
//                    "unArray_if_single_value",
//                    "fields" => array('id', 'username', 'role'),
//                    'associations' => array(
//                        'Supervisor' => array(
//                            "unArray_if_single_value",
//                            "fields" => array('id', 'username', 'role')
//                        )
//                    )
//                )
//            )
//        ));
        $this->_setResponseJSON($result);
    }

    public function add() {
        parent::add();
        
        if($this->request->data) {
            $this->_CheckUniqueUsername($this->request->data['User']['username']);
            $data = Set::remove($this->request->data, 'User.id');
            
            $this->User->getDataSource()->begin();
            $saved = $this->User->save($data);
            if($saved) {
                $profile = array('Profile' => Set::get($data, '/User/Profile'));
                $profile = Set::insert($profile, 'Profile.user_id', $saved['User']['id']);
                
                $saved_p = $this->Profile->save($profile);
                
                if($saved_p) {
                    $this->User->getDataSource()->commit();
                    
                    $saved = $this->User->find('first', array(
                        'conditions' => array('User.id' => $saved['User']['id']),
                        'associations' => array(
                            'Profile'
                            ,'ActivityLog' => array(
                                "unArray_if_single_value",
                                "fields" => array('id', 'title', 'content')
                            ),
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
                                "fields" => array('id', 'username', 'role'),
                                'associations' => array(
                                    'Supervisor' => array(
                                        "unArray_if_single_value",
                                        "fields" => array('id', 'username', 'role')
                                    )
                                )
                            )
                        )
                    ));
                } else {
                    $this->User->getDataSource()->rollback();
                    $saved = array();
                }
            }
            
        } else {
            throw new BadRequestException("User: wrong data format.");
        }
        $this->_setResponseJSON(Set::insert($saved, 'User.password', '*****'));
    }

    public function update($id = null) {
        parent::update($id);
        $this->_ReportUnsupportedMethod();
    }
    
    public function edit($id = null) {
        parent::edit($id);
        
        $this->User->id = $id;
        if (!$this->User->exists()) {
            $this->_ReportNotExistingUser($id);
        }

        $this->User->set($this->request->input('json_decode'));
        if ($this->User->validates()) {

            try {
                $user = $this->User->save();
            } catch (Exception $exc) {
                $this->_ReportError($exc);
            }
            $this->_setResponseJSON(Set::remove($user, 'User.password'));

        } else {
            $this->_ReportValidationErrors($this->User->validationErrors);
        }
    }

    public function delete($id = null) {
        parent::delete($id);
        
        $this->User->id = $id;
        if (!$this->User->exists()) {
            $this->_ReportNotExistingUser($id);
        }
        if ($this->User->delete()) {
            $this->_setResponseJSON('User deleted');
        } else {
            $this->_setResponseJSON('User Not deleted');
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
            $this->_ReportMethodNotAllowed("POST", 'login');
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
    
    private function getDafaultFormattedUser($id) {
        $result = $this->User->find('first', array(
            'conditions' => array('User.id' => $id),
            'associations' => array(
                'Profile'
                ,'ActivityLog' => array(
                    "unArray_if_single_value",
                    "fields" => array('id', 'title', 'content')
                ),
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
                    "fields" => array('id', 'username', 'role'),
                    'associations' => array(
                        'Supervisor' => array(
                            "unArray_if_single_value",
                            "fields" => array('id', 'username', 'role')
                        )
                    )
                )
            )
        ));
        $result = Set::insert($result, 'User.password', '*****');
        if(isset($result['User']['Supervisor']) && count($result['User']['Supervisor'])>0) {
            $result = Set::insert($result, 'User.Supervisor.password', '*****');
        }
        return $result;
    }


    /**
     * ERROR HANDLER HELPERS:
     */
    
    private function _ReportNotExistingUser($id){
        $message = array(
            'message' => 'Invalid user',
            'id' => $id,
            'status' => 404
        );
        throw new NotFoundException(json_encode($message));
    }
    
    private function _ReportExistingUser($id){
        $message = array(
            'message' => 'User already exists',
            'id' => $id,
            'status' => 400
        );
        throw new BadRequestException(json_encode($message));
    }

    private function _CheckUniqueUsername($username) {
        $user = $this->User->findByUsername($username);
        if ($user && count($user) > 0) {
            $message = array(
                'error' => array(
                    'username' => "Username aready exists"
                ),
                'status' => 400
            );
            throw new BadRequestException(json_encode($message));
        }
    }

}