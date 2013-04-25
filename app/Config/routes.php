<?php
/**
 * Routes configuration
 *
 * In this file, you set up routes to your controllers and their actions.
 * Routes are very important mechanism that allows you to freely connect
 * different urls to chosen controllers and their actions (functions).
 *
 * PHP 5
 *
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://cakephp.org CakePHP(tm) Project
 * @package       app.Config
 * @since         CakePHP(tm) v 0.2.9
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 */

/**
 * Load all plugin routes. See the CakePlugin documentation on
 * how to customize the loading of plugin routes.
 */
	CakePlugin::routes();

/**
* REST Configuration
*/
        Router::resourceMap(array(
            array('action' => 'index', 'method' => 'GET', 'id' => false),
            array('action' => 'view', 'method' => 'GET', 'id' => true),
            array('action' => 'add', 'method' => 'POST', 'id' => false),
            array('action' => 'edit', 'method' => 'PUT', 'id' => true),
            array('action' => 'delete', 'method' => 'DELETE', 'id' => true),
            array('action' => 'update', 'method' => 'POST', 'id' => true)
        ));

        Router::mapResources(array('users'));

/**
 * Load the CakePHP default routes. Only remove this if you do not want to use
 * the built-in default routes.
 */
	require CAKE . 'Config' . DS . 'routes.php';
