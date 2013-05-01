<?php

App::import('Controller', 'REST');

class UsersController extends RESTController {

    public function beforeFilter() {
        $this->Auth->allow(array('add', 'login', 'logout'));
        parent::beforeFilter();
    }
    
    public function index() {
        parent::index();
        
        $this->User->recursive = 0;
        $result = $this->User->find('all');
        $result = Set::remove($result, '{n}.User.password');
        $result = Set::remove($result, '{n}.Supervisor.{n}.Supervisor.password');
        $this->_setResponseJSON($result);
    }

    public function view($id = null) {
        parent::view($id);
        
        $this->User->id = $id;
        if (!$this->User->exists()) {
            $this->_ReportNotExistingUser($id);
        }

        $result = $this->User->find('first', array(
            'conditions' => array('User.id' => $id),
//            'supervisor'
//            => array(
//                'fields' => array('username', 'id')
//            )
        ));
        $this->_setResponseJSON(Set::remove($result, 'User.password'));
    }

    public function add() {
        parent::add();
        
        $this->_CheckUniqueUsername($this->request->data['username']);

        $this->User->create();
        $this->User->set($this->request->data);
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
        $this->logs['disable'] = true;
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
        if ($user) {
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