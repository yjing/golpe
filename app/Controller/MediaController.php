<?php


require_once '../Vendor/pheanstalk/pheanstalk_init.php';
require_once '../Vendor/WindowsAzure/vendor/autoload.php';

use WindowsAzure\Common\ServicesBuilder;
use WindowsAzure\Common\ServiceException;

App::import('Controller', 'REST');

class MediaController extends RESTController {

    public $components = array('LogActions');
    
    public function index() {
        parent::index();
        
        $result = $this->Media->find('all', array(
            'associations' => array(
                'Comment', 'ActivityLog'
            )
        ));
        
        $this->_setResponseJSON($result);
    }

    public function view($id = null) {
        parent::view($id);
        $this->Media->id = $id;
        if(!$this->Media->exists()) {
            throw new NotFoundException();
        }
        
        $result = $this->Media->find('first', array(
            'conditions' => array('Media.id' => $id),
            'associations' => array(
                'Comment', 'ActivityLog'
            )
        ));
        
        $this->_setResponseJSON($result);
        $this->LogActions->setActionResult(count($result) == 1);
    }
    
    public function download($id = null) {
        
        $this->Media->id = $id;
        if (!$this->Media->exists()) {
            throw new NotFoundException();
        }
        
        $result = $this->Media->find('first', array(
            'conditions' => array(
                'Media.id' => $id
            ),
            'recursive' => -1
        ));
        
        if($result) {
            $download_b = isset($this->request->query['download']) && $this->request->query['download'] == 'true';
            $thumb = false; 
            if(isset($this->request->query['thumb'])) {
                $thumb = $this->request->query['thumb'];
                if(!in_array($thumb, array("BIG", "SMALL"))) {
                    $thumb = "BIG";
                }
            }
            
            if($result['Media']['status']=="AVAILABLE") {
            	
    		$connectionString = 'DefaultEndpointsProtocol=http;AccountName=portalvhds6cy79yt8ky5b5;AccountKey=XxNdzdygZNwLJ3E7uvNTp00D8fQHftypaN0njds2+ZGBmcJAbiVPZ78ktwebQBi0gayqL5894FJulm7wpd2e5Q==';
                //$connectionString = 'DefaultEndpointsProtocol=http;AccountName=mscproject;AccountKey=kDb7vEfCwC56US6nOQgPzUgPkW511tgpf4spyuzd4f0LHnmoMXSq40Fjys6+vaK+n93hADHoRBpovkD6gQfMxg==';
                $blobRestProxy = ServicesBuilder::getInstance()->createBlobService($connectionString);
                
                try {
                    // Get blob.
                    $blob_name = $result['Media']['id'];
                    if($thumb != false) {
                        if ($thumb == "BIG") {
                            $blob_name = $blob_name . ".200.thumb";
                        } else {
                            $blob_name = $blob_name . ".75.thumb";
                        }
                    }
                    
                    $blob = $blobRestProxy->getBlob("usermedia", $blob_name);
                    $handle = $blob->getContentStream();
                    header("Content-Type: ".$result['Media']['content-type']);
                    if($download_b) {
                        $filename = $result['Media']['filename'];
                        header("Content-Disposition: attachment; filename=\"$filename\"");
                        $agent = env('HTTP_USER_AGENT');

			if (preg_match('%Opera(/| )([0-9].[0-9]{1,2})%', $agent)) {
				
			} elseif (preg_match('/MSIE ([0-9].[0-9]{1,2})/', $agent)) {
                                header("Content-Type: application/force-download");
                                header("Pragma: public");
                                header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
			}
                    }
                    
                    set_time_limit(0);
                    while (!feof($handle)) {
                        print(@fread($handle, 1024*8));
                        ob_flush();
                        flush();
                    }
                    
                } catch (ServiceException $e) {
                    // Handle exception based on error codes and messages.
                    // Error codes and messages are here: 
                    // http://msdn.microsoft.com/en-us/library/windowsazure/dd179439.aspx
                    $code = $e->getCode();
                    $error_message = $e->getMessage();

                    echo $code . ": " . $error_message . "<br />";
                }
            } else {
                try {
                    $filename = '/uploads/'.$result['Media']['id'];
                    if($thumb != false) {
                        if ($thumb == "BIG") {
                            $filename = $filename . ".200.thumb";
                        } else {
                            $filename = $filename . ".75.thumb";
                        }
                    }
                    
                    $handle = fopen($filename, 'r');
                    if(flock($handle, LOCK_SH+LOCK_NB)) {
                        $this->response->type($result['Media']['content-type']);
                        $this->response->file($filename, array('download' => $download_b, 'name' => $result['Media']['filename']));
                        flock($handle, LOCK_UN);
                        fclose($handle);
                    } else {
                        // FILE PROBABLY MOVED
                        throw new NotFoundException('File temporary unavailable.');
                    }
                } catch (Error $er) {
                    throw new NotFoundException('File temporary unavailable.', $er);
                }
            }
            
            return $this->response;
        }
    }

    public function add() {
        throw new MethodNotAllowedException();
    }

    public function edit($id = null) {
        throw new MethodNotAllowedException();
    }

    public function delete($id = null) {
        throw new MethodNotAllowedException();
    }
}
