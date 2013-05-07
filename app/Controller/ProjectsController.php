<?php

App::import('Controller', 'REST');

class ProjectsController extends RESTController {

    public $uses = array('Project');

    public function index() {
        parent::index();

        $results = $this->getDafaultFormattedProjects();
//        = $this->Project->find('all', array(
//            'associations' => array(
//                'Team' => array(
//                    'associations' => array(
//                        'Student' => array(
//                            'fields' => array('id', 'username')
//                        )
//                    )
//                )
//            )
//                ));

        $this->_setResponseJSON($results);
    }

    public function view($id = null) {
        parent::view($id);

        $results = $this->Project->find('first', array(
            'conditions' => array(
                'Project.id' => $id
            ),
            'associations' => array(
                'Team' => array(
                    'associations' => array(
                        'Student' => array(
                            'fields' => array('id', 'username')
                        )
                    )
                )
            )
                ));

        $this->_setResponseJSON($results);
    }

    public function add() {
        parent::add();

        if ($this->request->data) {
            $data = Set::remove($this->request->data, 'Project.id');
            $saved = $this->Project->save($data);

            if ($saved) {
                $saved = $this->Project->find('first', array(
                        'conditions' => array(
                            'Project.id' => $saved['Project']['id']
                        ),
                        'associations' => array(
                            'Team' => array(
                                'associations' => array(
                                    'Student' => array(
                                        'fields' => array('id', 'username')
                                    )
                                )
                            )
                        )
                    )
                );
            }
        } else {
            throw new BadRequestException("Project: wrong data format.");
        }
        $this->_setResponseJSON($saved);
    }

    public function update($id = null) {
        parent::update($id);

        if ($this->request->data) {
            $this->Project->id = $id;
            if ($this->Project->exists()) {
                $data = Set::remove($this->request->data, 'Project.id');
                $saved = $this->Project->save($data);
                if ($saved) {
                    $saved = $this->Project->find('first', array(
                        'conditions' => array(
                            'Project.id' => $id
                        ),
                        'associations' => array(
                            'Team' => array(
                                'associations' => array(
                                    'Student' => array(
                                        'fields' => array('id', 'username')
                                    )
                                )
                            )
                        )
                            ));
                }
            } else {
                throw new BadRequestException("Project doesn't exists.");
            }
        } else {
            throw new BadRequestException("Project: wrong data format.");
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
    
    private function getDafaultFormattedProject($id, $show_activity_logs = false) {
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
        
        return $this->Project->find('all',$options);
    }

}