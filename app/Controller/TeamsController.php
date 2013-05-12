<?php

App::import('Controller', 'REST');

class TeamsController extends RESTController {

    public $uses = array('Project', 'Team', 'TeamUser', 'User');

    public function index() {
        parent::index();

        $results = $this->getDafaultFormattedTeams();
        $this->_setResponseJSON($results);
        
    }

    public function view($id = null) {
        parent::view($id);

        $this->Team->id = $id;
        if (!$this->Team->exists()) {
            throw new NotFoundException();
        }
        
        $results = $this->getDafaultFormattedTeam($id);

        $this->_setResponseJSON($results);
    }

    public function add() {
        if (isset($this->request->data)) {
            $data = Set::remove($this->request->data, 'Team.id');
            $project_id = $data['Team']['project_id'];

            $this->Project->id = $project_id;
            if ($this->Project->exists()) {

                if ($this->Team->save($data)) {
                    $this->_setResponseJSON( $this->getDafaultFormattedTeam($this->Team->id, false) );
                } else {
                    $this->_setResponseJSON( array( 'Team' => $this->Team->validationErrors ) );
                }
                
            } else {
                throw new BadRequestException();
            }
        } else {
            throw new BadRequestException();
        }
        
    }

    public function update($id = null) {
        parent::update($id);

        if (isset($this->request->data)) {
            $data = Set::remove($this->request->data, 'Team.id');
            $this->Team->id = $id;
            
            if (!$this->Team->exists()) {
                throw new NotFoundException();
            }
            
            if($this->Team->save($data)) {
                $this->_setResponseJSON( $this->getDafaultFormattedTeam($this->Project->id, false) );
            } else {
                $this->_setResponseJSON( array( 'Team' => $this->Team->validationErrors ) );
            }
            
        } else {
            throw new BadRequestException();
        }
        
    }

    public function delete($id = null) {
        parent::delete($id);

        $this->Team->id = $id;
        if (!$this->Team->exists()) {
            throw new NotFoundException();
        }
        $query = "delete from teams where id = '$id';";
        $deleted = $this->Team->query($query);

        $this->_setResponseJSON(array('deleted'=>is_array($deleted)));
        //$this->_setResponseJSON(array('deleted' => $deleted));
    }
    
    public function addMember($team_id, $user_id) {
        parent::add();
        
        $this->Team->id = $team_id;
        $this->User->id = $user_id;
        if(!$this->Team->exists() || !$this->User->exists()) {
            throw new BadRequestException();
        }
        
        $saved = $this->TeamUser->find('first', array(
            'recursive' => -1,
            'conditions' => array(
                'TeamUser.user_id' => $user_id,
                'TeamUser.team_id' => $team_id,
            )
        ));
        if(!$saved || count($saved) == 0) {
            $data = array(
                'TeamUser' => array(
                    'team_id' => $team_id,
                    'user_id' => $user_id
                )
            );

            $saved = $this->TeamUser->save($data);
            if(!$saved) {
                throw new InternalErrorException();
            }
        }
        
        $this->_setResponseJSON( $this->getDafaultFormattedTeam($team_id, true) );
        
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
            throw new NotFoundException();
        }
        
        $this->_setResponseJSON( $this->getDafaultFormattedTeam($team_id, true) );
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
    
    private function getDafaultFormattedTeam($id, $show_students = true) {
        $options =  array(
            'conditions' => array( 'Team.id' => $id ),
            'recursive' => -1
        );
        if($show_students) {
            $options['associations'] = array(
                'Student' => array(
                    'fields' => array('id', 'username')
                )
            );
        }
        
        return $this->Team->find('first', $options);
        
    }
    
}
