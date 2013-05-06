<?php

App::import('Controller', 'REST');
class TeamsController extends RESTController {

    public $uses = array('Project', 'Team');
    
    public function index() {
        parent::index();

        $results = $this->Project->find('all', array(
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
        if(isset($this->request->data)) {
            $data = Set::remove($this->request->data, 'Team.id');
            $project_id = $data['Team']['project_id'];

            $this->Project->id = $project_id;
            if($this->Project->exists()) {

                $saved = $this->Team->save($data);
                if($saved) {
                    $saved = $this->Team->find('first', array(
                        'conditions' => array(
                            'Team.id' => $saved['Team']['id']
                        ),
                        'associations' => array(
                            'Student' => array(
                                'fields' => array('id', 'username')
                            )
                        )
                    ));
                }

            } else {
                throw new BadRequestException("Project doesn't exists.");
            }
        } else {
            throw new BadRequestException("Team: wrong data format.");
        }
        $this->_setResponseJSON($saved);
    }
    
    public function addddd() {
        parent::add();

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
                    ));
        }

        $this->_setResponseJSON($saved);
    }

    public function update($id = null) {
        parent::update($id);

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
    
    public function addTeam($project_id) {
        
        $this->Project->id = $project_id;
        if($this->Project->exists()) {
            
            $data = Set::remove($this->request->data, 'Team.id');
            $data['Team']['project_id'] = $project_id;
            $saved = $this->Team->save($data);
            if($saved) {
                $saved = $this->Team->find('first', array(
                    'conditions' => array(
                        'Team.id' => $saved['Team']['id']
                    ),
                    'associations' => array(
                        'Student' => array(
                            'fields' => array('id', 'username')
                        )
                    )
                ));
            }
        } else {
            throw new BadRequestException("Project doesn't exists.");
        }
        $this->_setResponseJSON($saved);
    }

}