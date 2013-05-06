<?php


require_once '../Vendor/pheanstalk/pheanstalk_init.php';
require_once '../Vendor/WindowsAzure/vendor/autoload.php';

use WindowsAzure\Common\ServicesBuilder;
use WindowsAzure\Common\ServiceException;

App::import('Controller', 'REST');

class MediaController extends RESTController {

    public $components = array('RequestHandler', 'LogActions');
    
    public function index() {
        parent::index();
        
        $this->Media->recursive = -1;
        $result = $this->Media->find('all', array(
            'associations' => array(
                'Comment', 'ActivityLog'
            )
        ));
        
        $this->_setResponseJSON($result);
    }

    public function view($id = null) {
        parent::view($id);
        
        $this->Media->recursive = -1;
        $result = $this->Media->findById($id);
        $this->_setResponseJSON($result);
        $this->LogActions->setActionResult(count($result) == 1);
    }
    
    public function download($id = null) {
        
        $this->Media->id = $id;
        if (!$this->Media->exists()) {
            $this->_ReportValidationErrors($id);
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
                $connectionString = 'DefaultEndpointsProtocol=http;AccountName=mscproject;AccountKey=kDb7vEfCwC56US6nOQgPzUgPkW511tgpf4spyuzd4f0LHnmoMXSq40Fjys6+vaK+n93hADHoRBpovkD6gQfMxg==';
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
            
            $this->LogActivities->beforeRender($this);
            return $this->response;
        }
    }

    public function add() {
        parent::add();

        $this->Media->create();
        $this->Media->set($this->request->data);
        if ($this->Media->validates()) {
            
            try {
                $medium = $this->Media->save();
            } catch (Exception $exc) {
                $this->_ReportError($exc);
            }
            $this->set(array(
                'content' => $medium,
                '_serialize' => 'content'
            ));
            
        } else {
            $this->_ReportValidationErrors($this->Media->validationErrors);
        }
        
    }

    public function edit($id = null) {
        parent::edit($id);
        
        $this->Media->id = $id;
        if (!$this->Media->exists()) {
            $this->_ReportValidationErrors($id);
        }

        $this->Media->set($this->request->input('json_decode'));
        if ($this->Media->validates()) {

            try {
                $medium = $this->Media->save();
            } catch (Exception $exc) {
                $this->_ReportError($exc);
            }
            $this->_setResponseJSON($medium);

        } else {
            $this->_ReportValidationErrors($this->Media->validationErrors);
        }
    }

    public function delete($id = null) {
        parent::delete($id);
        
        $this->Media->id = $id;
        if (!$this->Media->exists()) {
            $this->_ReportValidationErrors($id);
        }
        if ($this->Media->delete()) {
            $this->_setResponseJSON('Medium deleted');
        } else {
            $this->_setResponseJSON('Medium Not deleted');
        }
        
    }

}

?>
