<?php
require_once 'NotificationProvider.php';

App::uses('CakeEmail', 'Network/Email');
App::import('Model', 'User');
class Email implements NotificationProvider {
    
    private $User = null;
    
    public function notify($notifications) {
        $user_notifications = array();
        $public_notifications = array();
        foreach ($notifications as $key => $notification) {
            $ids = $notification['Notification']['to'];
            if(strlen($ids)>0) {
                $ids = split(", ", $notification['Notification']['to']);
                
                foreach ($ids as $k => $id) {
                    if(!isset($user_notifications[$id])) {
                        $user_notifications[$id] = array();
                    }
                    $user_notifications[$id][] = $notification;
                }
                
            } elseif ($notification['Notification']['public']) {
                $public_notifications[] = $notification;
            }
        }
        
        $this->User = new User();
        
        $this->_sendUserNotifications($user_notifications);
        $this->_sendPabilcNotifications($public_notifications);
        
    }
    
    private function _sendUserNotifications($notifications) {
        foreach ($notifications as $user_id => $notification) {
            
            $this->User->id = $user_id;
            $email_address = $this->User->field('email');
            $this->_sendEmail($email_address, $notification);
            
        }
    }
    
    private function _sendPabilcNotifications($notifications) {
        $emails = $this->User->find('all', array(
            'fields' => 'email',
            'recursive' => -1
        ));
        $emails = Set::extract('/User/email', $emails);
        $this->_sendEmail($emails, $notifications);
    }
    
    private function _sendEmail($emails, $notifications, $subject = "Notifications") {
        
        if(!isset($notifications) || count($notifications) == 0) {
            return;
        }
        
        $inset = "<p class='lead'>There's some news for you: </p><p>";
        foreach ($notifications as $key => $value) {
            $resource = urldecode($value['Notification']['resource']);
            $message = $value['Notification']['message'];
            $inset .= "<a href='http://msc.cloudapp.net/client/resolve?res=$resource'>[ $message ]</a><br>\n";
        }
        $inset .= "</p>";
        
        $email_body = str_replace('##BODY##', $inset, Email::$email_template);
        
        $Email = new CakeEmail();
        try {
            $Email->from(array('notifier@msc.cloudapp.net' => 'MSCProject Notifier'))
                ->to('notifier@msc.cloudapp.net')
                ->bcc($emails)
                ->subject($subject)
                ->emailFormat('html')
                ->send($email_body);
        } catch (Exception $e) {
            
        }
    }
    
    private static $email_template = '
        <html>
            <head>
                <!-- Bootstrap -->
                <link href="http://mscazure.dyndns.org/client/css/bootstrap.css" rel="stylesheet" media="screen">
            </head>
            <body>
                ##BODY##
            </body>
        </html>
    ';
}