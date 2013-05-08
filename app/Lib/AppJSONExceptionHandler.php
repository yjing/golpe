<?php
class AppJSONExceptionHandler {
    
    public static function handleException(Exception $error) {
        
        header("Content-Type: application/json");
        header('HTTP/1.1 '.$error->getCode());
        
        $err = array(
            'message' => AppJSONExceptionHandler::_parseMessage($error->getMessage())
        );
        
        $debug_l = Configure::read('APPCONFIG.debug');
        if($debug_l > 0) {
            $err['file'] = $error->getFile();
            $err['line'] = $error->getLine();
            $err['trace'] = array();
            
            if($debug_l > 1) {
                $t = $error->getTrace();
                foreach ($t as $value) {
                    $err['trace'][] = $value;
                }
            }
        }
        
        echo json_encode($err);
        
    }
    
    private static function _parseMessage($msg) {
        if ($msg == null) {
            return null;
        }
        
        $json_dec = json_decode($msg);
        if($json_dec == null) {
            return $msg;
        }
        
        return $json_dec;
        
    }
    
}
