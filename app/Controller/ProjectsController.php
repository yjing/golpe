<?php

App::import('Controller', 'REST');

class ProjectsController extends RESTController {

    public $uses = array('Project');

    public function index() {
        parent::index();

        $results = $this->getDafaultFormattedProjects();
        $this->_setResponseJSON($results);
        
    }

    public function view($id = null) {
        parent::view($id);

        $results = $this->getDafaultFormattedProject($id);
        $this->_setResponseJSON($results);
    }

    public function add() {
        parent::add();

        if ($this->request->data) {
            $data = Set::remove($this->request->data, 'Project.id');
            
            if ($this->Project->save($data)) {
                $this->_setResponseJSON( $this->getDafaultFormattedProject($this->Project->id, false) );
            } else {
                $this->_ReportDataValidationErrors( array( 'Project' => $this->Project->validationErrors ) );
            }
            
        } else {
            throw new BadRequestException();
        }
    }

    public function update($id = null) {
        parent::update($id);

        if ($this->request->data) {
            $data = Set::remove($this->request->data, 'Project.id');
            
            $this->Project->id = $id;
            if (!$this->Project->exists()) {
                throw new BadRequestException();
            }
            
            if ($this->Project->save($data)) {
                $this->_setResponseJSON( $this->getDafaultFormattedProject($this->Project->id, false) );
            } else {
                $this->_ReportDataValidationErrors( array( 'Project' => $this->Project->validationErrors ) );
            }
            
        } else {
            throw new BadRequestException();
        }
        $this->_setResponseJSON($saved);
    }

    public function delete($id = null) {
        parent::delete($id);

        $this->Project->id = $id;
        if ($this->Project->exists()) {
            $deleted = $this->Project->delete($id);
        } else {
            throw new BadRequestException("Project doesn't exists.");
        }

        $this->_setResponseJSON(array('deleted' => $deleted));
    }
    
    
    private function getDafaultFormattedProjects($show_teams = false) {
        $options =  array(
            'recursive' => -1
        );
        if($show_teams) {
            $options['associations'] = array(
                'Team' => array(
                    'associations' => array(
                        'Student' => array(
                            'fields' => array('id', 'username')
                        )
                    )
                )
            );
        }
        
        return $this->Project->find('all',$options);
        
    }
    
    private function getDafaultFormattedProject($id, $show_teams = true) {
        $options =  array(
            'conditions' => array( 'Project.id' => $id ),
            'recursive' => -1
        );
        if($show_teams) {
            $options['associations'] = array(
                'Team' => array(
                    'associations' => array(
                        'Student' => array(
                            'fields' => array('id', 'username')
                        )
                    )
                )
            );
        }
        
        return $this->Project->find('first', $options);
    }

}