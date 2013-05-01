<?php

require_once APP . 'Vendor/WindowsAzure/vendor/autoload.php';
require_once APP . 'Vendor/pheanstalk/pheanstalk_init.php';


use WindowsAzure\Common\ServicesBuilder;
use WindowsAzure\Common\ServiceException;
use WindowsAzure\Blob\Models;
use WindowsAzure\Blob\Models\CreateBlobOptions;

class UploaderShell extends AppShell {
    
    private static $connectionString = 'DefaultEndpointsProtocol=http;AccountName=mscproject;AccountKey=kDb7vEfCwC56US6nOQgPzUgPkW511tgpf4spyuzd4f0LHnmoMXSq40Fjys6+vaK+n93hADHoRBpovkD6gQfMxg==';
    private static $mediaStatus_AVAILABLE = 'AVAILABLE';

    public $uses = array('Media');

    public function upload() {
        
        // This user is used to inform the UserAwareModel (Media) that the 
        // call has been issued by the SHELL and has access to all data.
        App::uses('CakeSession', 'Model/Datasource');
        CakeSession::write("Auth.User", array(
            'id' => '-1',
            'username' => 'msc.shell',
            'role' => 'SHELL'
        ));
        
        $meds = $this->Media->find('all', array(
            'conditions' => array('status !=' => UploaderShell::$mediaStatus_AVAILABLE),
            'recursive' => -1
        ));
        
        foreach ($meds as $key => $value) {
            try {
                $m_id = $value['Media']['id'];
                // ACQUIRE THE LOCK ON THE LOCK FILE: avoid any other shell to pick the file for upload
                $lockfile_handle = fopen("/uploads/$m_id.lock", 'c');
                if(flock($lockfile_handle, LOCK_EX+LOCK_NB)) {

                    $result = $this->_transferFiles($m_id, $value['Media']['content-type'], $value['Media']['has_thumb']);
                    if($result != false) {
                        // MEDIA UPLOADED, UPDATE THE METADATA
                        $this->Media->id = $m_id;
                        $this->Media->saveField('status', 'AVAILABLE');debug("update $m_id");
                        // ACQUIRE EXCLUSIVE LOCK ON FILE TO WAIT READERS AND DELETE IT
                        foreach ($result as $location => $handle) {
                            if(flock($handle, LOCK_EX)) {
                                unlink($location);
                                flock($handle, LOCK_UN);
                                fclose($handle);
                            }
                        }
                    }
                    
                    // DELETE LOCKFILE
                    unlink("/uploads/$m_id.lock");
                    // RELEASE THE EX LOCK
                    flock($lockfile_handle, LOCK_UN);
                }
            } catch (Exception $e) {
                echo $e->getMessage();
                // POSSIBLY DELETE LOCKFILE
                unlink("/uploads/$m_id.lock");
                // POSSIBLY RELEASE THE EX LOCK
                flock($lockfile_handle, LOCK_UN);
                continue;
            }
        }
        
    }
    
    private function _transferFiles($m_id, $content_type, $has_thumbs){   
        $fileLocation = "/uploads/$m_id";
        $bigThumbLocation = "/uploads/$m_id.200.thumb";
        $smallThumbLocation = "/uploads/$m_id.75.thumb";
        
        if(!file_exists($fileLocation) ||
            ( $has_thumbs && ( !file_exists($bigThumbLocation) || !file_exists($smallThumbLocation)) )) {
            return false;
        }

        // OPEN AND READ THE UPLOADING FILES
        $uploading_file_handler = fopen($fileLocation, 'r');
        $uploading_big_thumb_handler = fopen($bigThumbLocation, 'r');
        $uploading_small_thumb_handler = fopen($smallThumbLocation, 'r');  
        
        try {

            $blobRestProxy = ServicesBuilder::getInstance()->createBlobService(UploaderShell::$connectionString);
            // Create BLOB.
            $blobOpts = new CreateBlobOptions();
            $blobOpts->setBlobContentType($content_type);
            $result = $blobRestProxy->createBlockBlob("usermedia", $m_id, $uploading_file_handler, $blobOpts);
            
            if($result) {
                $blobOpts = new CreateBlobOptions();
                $blobOpts->setBlobContentType($content_type);
                $result = $blobRestProxy->createBlockBlob("usermedia", "$m_id.200.thumb", $uploading_big_thumb_handler, $blobOpts);
                
                if ($result) {
                    $blobOpts = new CreateBlobOptions();
                    $blobOpts->setBlobContentType($content_type);
                    $result = $blobRestProxy->createBlockBlob("usermedia", "$m_id.75.thumb", $uploading_small_thumb_handler, $blobOpts);
                    
                    if ($result) {
                        
                        return array (
                            $fileLocation => $uploading_file_handler,
                            $bigThumbLocation => $uploading_big_thumb_handler,
                            $smallThumbLocation => $uploading_small_thumb_handler
                        );
                        
                    } else {
                        $blobRestProxy->deleteBlob("usermedia", $m_id);
                        $blobRestProxy->deleteBlob("usermedia", "$m_id.200.thumb");
                    }
                } else {
                    $blobRestProxy->deleteBlob("usermedia", $m_id);
                }
            }

        } catch (Exception $e) {
            fclose($uploading_file_handler);
            fclose($uploading_big_thumb_handler);
            fclose($uploading_small_thumb_handler);
        }
        
        return false;
    }

}

?>
