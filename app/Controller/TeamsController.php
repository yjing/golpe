<?php

App::import('Controller', 'REST');

class TeamsController extends RESTController {

    public $uses = array('Project', 'Team', 'TeamUser');

    public function index() {
        parent::index();

        $results = $this->Team->find('all', array(
            'associations' => array(
                'Student' => array(
                    'fields' => array('id', 'username')
                )
            )
                ));

        $this->_setResponseJSON($results);
    }

    public function view($id = null) {
        parent::view($id);

        $results = $this->Team->find('first', array(
            'conditions' => array(
                'Team.id' => $id
            ),
            'associations' => array(
                'Student' => array(
                    'fields' => array('id', 'username')
                )
            )
                ));

        $this->_setResponseJSON($results);
    }

    public function add() {
        if (isset($this->request->data)) {
            $data = Set::remove($this->request->data, 'Team.id');
            $project_id = $data['Team']['project_id'];

            $this->Project->id = $project_id;
            if ($this->Project->exists()) {

                $saved = $this->Team->save($data);
                if ($saved) {
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

    public function update($id = null) {
        parent::update($id);

        if (isset($this->request->data)) {
            $this->Team->id = $id;
            if ($this->Team->exists()) {
                $data = Set::remove($this->request->data, 'Team.id');
                $saved = $this->Team->save($data);
                if ($saved) {
                    $saved = $this->Team->find('first', array(
                        'conditions' => array(
                            'Team.id' => $id
                        ),
                        'associations' => array(
                            'Student' => array(
                                'fields' => array('id', 'username')
                            )
                        )
                            ));
                }
            } else {
                throw new BadRequestException("Team doesn't exists.");
            }
        } else {
            throw new BadRequestException("Team: wrong data format.");
        }
        $this->_setResponseJSON($saved);
    }

    public function delete($id = null) {
        parent::delete($id);

        $this->Team->id = $id;
        if ($this->Team->exists()) {
            $deleted = $this->Team->delete($id);
        } else {
            throw new BadRequestException("Team doesn't exists.");
        }

        $this->_setResponseJSON(array('deleted' => $deleted));
    }
    
    public function addMember($team_id, $user_id) {
        if (!$this->request->is('put')) {
            $this->_ReportMethodNotAllowed("PUT", 'addMember');
        }
        
        debug($team_id->TeamUser->find('all'));
        die();
        
    }

}