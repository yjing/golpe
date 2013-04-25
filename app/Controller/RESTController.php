<?php

abstract class RESTController extends AppController {

    public $components = array('RequestHandler');
    
    public function beforeFilter() {
        $this->RequestHandler->renderAs($this, 'json');
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