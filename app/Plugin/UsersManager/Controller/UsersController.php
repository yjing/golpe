<?php
App::uses('UsersManagerAppController', 'UsersManager.Controller');
/**
 * Users Controller
 *
 */
class UsersController extends UsersManagerAppController {

    public $uses = array('UsersManager.User');
    
    public function index() {
//        parent::index();
        
        $this->User->recursive = 0;
        $result = $this->paginate();
        
        debug($result);die();
        
//        $this->_setResponseJSON(Set::remove($result, '{n}.User.password'));
    }

}
