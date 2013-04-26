<?php
class AppJSONExceptionHandler {
    
    public static function handleException(Exception $error) {
        
        header("Content-Type: application/json");
        header('HTTP/1.1 '.$error->getCode());
        
        $err = array(
            'message' => AppJSONExceptionHandler::_parseMessage($error->getMessage())
        );
        
        if(Configure::read('debug') == 2) {
            $err['file'] = $error->getFile();
            $err['line'] = $error->getLine();
            $err['trace'] = array();
            
            $prev = $error->getPrevious();
            while ($prev != null) {
                $err['trace'][] = array(
                    'message' => $prev->getMessage(),
                    'file' => $prev->getFile(),
                    'line' => $prev->getLine()
                );
                $prev = $prev->getPrevious();
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
