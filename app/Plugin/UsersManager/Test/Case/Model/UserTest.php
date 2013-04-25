<?php
App::uses('User', 'UsersManager.Model');

/**
 * User Test Case
 *
 */
class UserTest extends CakeTestCase {

/**
 * Fixtures
 *
 * @var array
 */
	public $fixtures = array(
		'plugin.users_manager.user',
		'plugin.users_manager.activity_log',
		'plugin.users_manager.comment',
		'plugin.users_manager.media',
		'plugin.users_manager.messages_recipient',
		'plugin.users_manager.profile',
		'plugin.users_manager.team',
		'plugin.users_manager.teams_user'
	);

/**
 * setUp method
 *
 * @return void
 */
	public function setUp() {
		parent::setUp();
		$this->User = ClassRegistry::init('UsersManager.User');
	}

/**
 * tearDown method
 *
 * @return void
 */
	public function tearDown() {
		unset($this->User);

		parent::tearDown();
	}

}
