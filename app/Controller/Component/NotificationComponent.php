<?php
class NotificationComponent extends Component {
    public function initialize(Controller $controller) {
        debug($controller->components['Notification']);
    }
}