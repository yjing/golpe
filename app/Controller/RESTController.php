<?php
abstract class RESTController extends AppController {

    public $components = array('RequestHandler');
    private $_authorization;
    private $_roles;
    private $_super_roles;
    
    public function beforeFilter() {
        $this->RequestHandler->renderAs($this, 'json');
        
        // In a REST service, if unauthorized, I just need to send a 501 status code to the client
        $this->Auth->autoRedirect = false;
        if (!$this->Auth->loggedIn() && !in_array($this->action, $this->Auth->allowedActions)) {
            throw new UnauthorizedException();
        }
        
        $this->Auth->authorize = 'Controller';
        $this->Auth->unauthorizedRedirect = false;
        
        $this->_authorization = $this->_normalize(Configure::read("APPCONFIG.authorization." . $this->name));
        $this->_roles = Configure::read("APPCONFIG.roles");
        $this->_super_roles = Configure::read("APPCONFIG.super_roles");
        
    }
    
    private function _normalize($array) {
        if(isset($array)) {
            if(is_array($array)){
                $ret = array();
                foreach ($array as $key => $value) {
                    $this->normalizeKeyValueToAssociative($key, $value);
                    if(isset($value) && is_array($value)) {
                        $value = $this->_normalize($value);
                    }
                    $ret[$key] = $value;
                }
                return $ret;
            }
            return $array;
        }
        return null;
    }
    // IMPORTANT: HAS SIDE EFFECT!!! MODIFY THE INPUT DATA!!!
    private function normalizeKeyValueToAssociative(&$key, &$value) {
        if(!is_string($key)) {
            $key = $value;
            $value = TRUE;
        }
    }
    
    public function isAuthorized($user = null) {
        // GENERAL RULES
        if(isset($user) && isset($user['role'])) {
            if(!in_array($user['role'], $this->_roles, true)) {
                return false;
            }
            if(in_array($user['role'], $this->_super_roles, true)) {
                return true;
            }
        } else {
            return false;
        }
        
        $user_role = $user['role'];
        $ret = false;
        if(is_array($this->_authorization)) {
            
            if(array_key_exists($user_role, $this->_authorization)) {
                $ret = $this->_authorization[$user_role];
            } else {
                $action_level = Set::get($this->_authorization, $this->action);
                if(isset($action_level)) {
                    if(is_array($action_level)) {
                        $role_level = Set::get($action_level, $user_role);
                        if(isset($role_level)) {
                            $ret = $role_level;
                        } else {
                            $ret = FALSE;
                        }
                    } else {
                        if (is_bool($action_level)) {
                            $ret = $action_level;
                        } elseif (is_string($action_level)) {
                            $ret = ($action_level == $user_role);
                        } else {
                            $ret = FALSE;
                        }
                    }
                } else {
                    $ret = FALSE;
                }
            }
            
        } else {
            if(is_bool($this->_authorization)) {
                $ret = $this->_authorization;
            } elseif (is_string($this->_authorization)) {
                $ret = ($this->_authorization == $user_role);
            } else {
                $ret = FALSE;
            }
        }
        
        if(!$ret) {
            $this->Auth->authError = "ROLE: $user_role Unauthorized";
        }
        return $ret;
            
    }

    public function index() {
      
        if (!$this->request->is('get')) {
            
            $this->_ReportMethodNotAllowed("GET", 'index');
            
        }
        
    }

    public function view($id = null) {
      
        if (!$this->request->is('get')) {
            
            $this->_ReportMethodNotAllowed("GET", 'view');
            
        }
        
    }

    public function add() {
      
        if (!$this->request->is('post')) {
            
            $this->_ReportMethodNotAllowed("POST", 'add');
            
        }
        
    }

    public function update($id = null) {
        
        if (!$this->request->is('post')) {
            
            $this->_ReportMethodNotAllowed("POST", 'update');
            
        }
        
    }

    public function edit($id = null) {
        
        if (!$this->request->is('put')) {
            
            $this->_ReportMethodNotAllowed("PUT", 'edit');
            
        }
        
    }

    public function delete($id = null) {
        
        if (!$this->request->is('delete')) {
            
            $this->_ReportMethodNotAllowed("DELETE", 'delete');
            
        }
        
    }
    
    
    /**
     * RESPONSE HELPERS: 
     */
    
    protected function _setResponseJSON($content) {
        $this->set(array(
            'content' => $content,
            '_serialize' => 'content'
        ));
    }


    
    /**
     * ERROR HANDLERS HELPERS:
     */    
    protected function _ReportValidationErrors($errors){
        $message = array(
            'errors' => $errors,
            'status' => 400
        );
        throw new BadRequestException(json_encode($message));
    }
    
    protected function _ReportError($exc) {
        $message = array(
            'errors' => array(
                'exception' => array(
                    'message' => $exc->getMessage(),
                    'code' => $exc->getCode()
                )
            ),
            'message' => 'Internal Server Error',
            'code' => 500
        );
        throw new InternalErrorException(json_encode($message));
    }
    
    protected function _ReportMethodNotAllowed($expected, $action = null) {
        $message = array(
            'message' => "Expected HTTP Method: $expected",
            'code' => 405
        );
        if($action) {
            $message['action'] = $action;
        }
        throw new MethodNotAllowedException(json_encode($message));
    }
    
    protected function _ReportUnsupportedMethod() {
        $message = array(
            'message' => "Unsupported Method",
            'code' => 405
        );
        throw new MethodNotAllowedException(json_encode($message));
    }

}