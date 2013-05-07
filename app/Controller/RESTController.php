<?php
/**
 * Abstract class to be extended to easy implement a RESTFul Web Service 
 */
abstract class RESTController extends AppController {

    public $components = array('RequestHandler');
    private $_authorization;
    private $_roles;
    private $_super_roles;
    
    public function __construct($request = null, $response = null) {
        parent::__construct($request, $response);
        if(!isset($this->components)){
            $this->components = array(RequestHandler);
        } elseif (!in_array($this->components, 'RequestHandler')) {
            $this->components[] = 'RequestHandler';
        }
    }
    
    /**
     * Load the authentication configuration, and sets up the basic ENVIRONMENT variables
     * for RESTFul Web Services Support
     * 
     * @throws UnauthorizedException If the user is not authorized to access the requested action.
     */
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
    
    /**
     * Authorize ACTIONS execution according to the configuration provided on
     * /app/Config/appConfiguration.php.
     * 
     * INVOLVED CONFIG KEYS: APPCONFIG.authorization, APPCONFIG.roles, APPCONFIG.super_roles
     * 
     * @param type $user
     * @return boolean 
     */
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
            
            throw new MethodNotAllowedException();
            
        }
        
    }

    public function view($id = null) {
      
        if (!$this->request->is('get')) {
            
            throw new MethodNotAllowedException();
            
        }
        
    }

    public function add() {
      
        if (!$this->request->is('post')) {
            
            throw new MethodNotAllowedException();
            
        }
        
    }

    public function update($id = null) {
        
        if (!$this->request->is('post')) {
            
            throw new MethodNotAllowedException();
            
        }
        
    }

    public function edit($id = null) {
        
        if (!$this->request->is('put')) {
            
            throw new MethodNotAllowedException();
            
        }
        
    }

    public function delete($id = null) {
        
        if (!$this->request->is('delete')) {
            
            throw new MethodNotAllowedException();
            
        }
        
    }
    
    /**
     * CONFIGURATION HELPERS: 
     */
    
    /**
     * Normalize the Action Authorization configuration array.
     * Could be turned into an helper method
     * 
     * @param type $array
     * @return mixed Normalized Authorization configuration array
     */
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
    
    /**
     * If $key is a NUMERIC put the $value in it and assign $def_vale to $value.
     * Used to normalize numeric entries in an associative array
     * 
     * IMPORTANT: HAS SIDE EFFECT!!! MODIFY THE INPUT DATA!!!
     * 
     * @param type $key
     * @param type $value
     * @param type $def_val default = TRUE
     */
    private function normalizeKeyValueToAssociative(&$key, &$value, $def_val = TRUE) {
//        if(!is_string($key)) {
        if(!is_numeric($key)) {
            $key = $value;
            $value = $def_val;
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
        throw new BadRequestException( json_encode( array( 'errors' => $errors ) ) );
    }

}