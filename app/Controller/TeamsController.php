<?php

App::import('Controller', 'REST');

class TeamsController extends RESTController {

    public $uses = array('Project', 'Team', 'TeamUser');

    public function index() {
        parent::index();

        $results = $this->getDafaultFormattedTeams();
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
    
    public function addMember($team_id, $user_id, $team_leader = false) {
        parent::add();
        
        $saved = $this->TeamUser->find('first', array(
            'recursive' => -1,
            'conditions' => array(
                'TeamUser.user_id' => $user_id,
                'TeamUser.team_id' => $team_id,
            )
        ));
        if(!$saved) {
            $data = array(
                'TeamUser' => array(
                    'team_id' => $team_id,
                    'user_id' => $user_id,
                    'team_leader' => $team_leader
                )
            );

            $saved = $this->TeamUser->save($data);
            if($saved) {
                $saved = $this->Team->find('first', array(
                    'conditions' => array(
                        'Team.id' => $team_id
                    ),
                    'associations' => array(
                        'Student' => array(
                            'fields' => array('id', 'username')
                        )
                    )
                        ));
            }
        }
        $this->_setResponseJSON($saved);
        
    }
    
    public function removeMember($team_id, $user_id) {
        parent::delete();
        $data = $this->TeamUser->find('first', array(
            'recursive' => -1,
            'conditions' => array(
                'TeamUser.user_id' => $user_id,
                'TeamUser.team_id' => $team_id,
            )
        ));
        
        if($data) {
            $query = "delete from teams_users where user_id = $user_id and team_id = $team_id;";
            $deleted = $this->TeamUser->query($query);
        } else {
            throw new BadRequestException("The User is not member of the selected Team.");
        }
        
        $this->_setResponseJSON(array('deleted'=>isset($deleted)));
    }

    
    private function getDafaultFormattedTeams($show_students = false) {
        $options =  array(
            'recursive' => -1
        );
        if($show_students) {
            $options['associations'] = array(
                'Student' => array(
                    'fields' => array('id', 'username')
                )
            );
        }
        
        return $this->Team->find('all', $options);
        
    }
    
}