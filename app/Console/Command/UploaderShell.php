<?php

require_once APP . 'Vendor/WindowsAzure/vendor/autoload.php';
require_once APP . 'Vendor/pheanstalk/pheanstalk_init.php';


use WindowsAzure\Common\ServicesBuilder;
use WindowsAzure\Common\ServiceException;
use WindowsAzure\Blob\Models;
use WindowsAzure\Blob\Models\CreateBlobOptions;

class UploaderShell extends AppShell {
    private static $connectionString = Configure::read("APPCONFIG.AzureConnectionString");
    debug($connectionString);
    //private static $connectionString = 'DefaultEndpointsProtocol=http;AccountName=portalvhds6cy79yt8ky5b5;AccountKey=XxNdzdygZNwLJ3E7uvNTp00D8fQHftypaN0njds2+ZGBmcJAbiVPZ78ktwebQBi0gayqL5894FJulm7wpd2e5Q==';
    //private static $connectionString = 'DefaultEndpointsProtocol=http;AccountName=mscproject;AccountKey=kDb7vEfCwC56US6nOQgPzUgPkW511tgpf4spyuzd4f0LHnmoMXSq40Fjys6+vaK+n93hADHoRBpovkD6gQfMxg==';
    private static $CONTAINER = 'usermedia';
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
            'conditions' => array('Media.status !=' => UploaderShell::$mediaStatus_AVAILABLE),
            'recursive' => -1
        ));
        
        $meds = Set::extract('/Media/.', $meds);
        $uploads_dir = '/uploads';
        foreach ($meds as $key => $m) {
            
            $media_id = $m['id'];
            $filename = $m['filename'];
            $type = $m['content-type'];
            $size = $m['content-size'];
            $lockfile_path = "/uploads/$media_id.lock";
            $has_thumb = $m['has_thumb'];
            $b_thumb = null;
            $s_thumb = null;
            if($has_thumb) {
                $b_thumb = "$media_id.200.thumb";
                $s_thumb = "$media_id.75.thumb";
            }
            
            $lockfile_handle = fopen($lockfile_path, 'c');
            if( flock( $lockfile_handle, LOCK_EX+LOCK_NB ) ) {
                
                // CHECK FILES
                if(file_exists("$uploads_dir/$media_id")) {
                    $b_thumb_file_exists = file_exists("$uploads_dir/$b_thumb");
                    $s_thumb_file_exists = file_exists("$uploads_dir/$s_thumb");
                    if($has_thumb && (!$b_thumb_file_exists || !$s_thumb_file_exists)){
                        // MINOR ERROR -> delete thumbs and change DB
                        $has_thumb = false;
                        if($b_thumb_file_exists) {
                            unlink("$uploads_dir/$b_thumb");
                        }
                        if($s_thumb_file_exists) {
                            unlink("$uploads_dir/$s_thumb");
                        }
                        echo "Warning: media thumbs don't exists...";
                    }
                    
                    // Create BLOB SERVICE.
                    $blobRestProxy = ServicesBuilder::getInstance()->createBlobService(self::$connectionString);
                    
                    // ALL NEEDED FILES ARE AVAILABLE
                    // FIRST TRANSFER MAIN FILE
                    $uploading_file_handler = fopen("$uploads_dir/$media_id", 'r');
                    $uploaded = $this->uploafFile(
                        $blobRestProxy, 
                        $uploading_file_handler, 
                        $type, 
                        $media_id, 
                        3
                    );
                    if($uploaded) {
                        echo "Upload: $media_id done...\n";
                        
                        $up_b_thumb = false;
                        $up_s_thumb = false;
                        if($has_thumb) {
                            
                            $b_thumb_handler = fopen("$uploads_dir/$b_thumb", 'r');
                            $up_b_thumb = $this->uploafFile(
                                $blobRestProxy, 
                                $b_thumb_handler, 
                                "image/png", 
                                $b_thumb, 
                                3
                            );
                            
                            if($up_b_thumb) {
                                echo "Upload: $b_thumb done...\n";
                                
                                $s_thumb_handler = fopen("$uploads_dir/$s_thumb", 'r');
                                $up_s_thumb = $this->uploafFile(
                                    $blobRestProxy, 
                                    $s_thumb_handler, 
                                    "image/png", 
                                    $s_thumb, 
                                    3
                                );
                                
                                if($up_s_thumb) {
                                    echo "Upload: $s_thumb done...\n";
                                } else {
                                    // WARNING
                                    $has_thumb = false;
                                    // REMOVE THE UPLOADED BLOB
                                    $blobRestProxy->deleteBlob("usermedia", $b_thumb);
                                    echo "Warning: thumbs can't be uploaded...\n";
                                    echo "Warning: the thumb will be unavailable\n";
                                }
                            } else {
                                // WARNING
                                $has_thumb = false;
                                echo "Warning: thumbs can't be uploaded...\n";
                                echo "Warning: the thumb will be unavailable\n";
                            }
                        }
                        
                        // UPDATE MEDIA
                        $updated_media = array(
                            'id' => $media_id,
                            'status' => self::$mediaStatus_AVAILABLE,
                            'has_thumb' => $has_thumb
                        );
                        
                        $saved = $this->Media->save($updated_media);
                        echo "Saved media:\n";
                        debug($saved);
                        echo "\n";
                        
                        
                        if($saved) {
                            echo "Media $media_id updated...";
                            
                            // FILES ARE NO MORE NECESSARY, MEDIA IS AVAILABLE
                            if(flock($uploading_file_handler, LOCK_EX)){
                                unlink("$uploads_dir/$media_id");
                                flock($uploading_file_handler, LOCK_UN);
                                fclose($uploading_file_handler);
                            }
                            if($has_thumb) {
                                if(isset($b_thumb_handler) && 
                                        flock($b_thumb_handler, LOCK_EX)){
                                    unlink("$uploads_dir/$b_thumb");
                                    flock($b_thumb_handler, LOCK_UN);
                                    fclose($b_thumb_handler);
                                }
                                if(isset($s_thumb_handler) && 
                                        flock($s_thumb_handler, LOCK_EX)){
                                    unlink("$uploads_dir/$s_thumb");
                                    flock($s_thumb_handler, LOCK_UN);
                                    fclose($s_thumb_handler);
                                }
                            }
                            
                        } else {
                            // ERROR
                            fclose($uploading_file_handler);
                            if(isset($b_thumb_handler)){
                                fclose($b_thumb_handler);
                            }
                            if(isset($s_thumb_handler)){
                                fclose($s_thumb_handler);
                            }
                            
                            $blobRestProxy->deleteBlob("usermedia", $media_id);
                            if($up_b_thumb) {
                                $blobRestProxy->deleteBlob("usermedia", $b_thumb);
                            }
                            if($up_s_thumb) {
                                $blobRestProxy->deleteBlob("usermedia", $s_thumb);
                            }
                            
                            echo "Error: $media_id media can't be UPDATED...\n";
                        }
                        
                        
                    } else {
                        // ERROR
                        fclose($uploading_file_handler);
                        
                        echo "Error: $uploads_dir/$media_id can't be uploaded...\n";
                    }
                    
                } else {
                    // ERROR
                    echo "Error: $uploads_dir/$media_id doesn't exist...\n";
                }
                
                unlink($lockfile_path);
                flock($lockfile_handle, LOCK_UN);
            }
            fclose($lockfile_handle);
        }
    }
    
    private function uploafFile($service, $handler, $content_type, $filename, $max_attempts) {
        $attempts = 0;
        $ret = false;
        while ($attempts < $max_attempts) {
            try {
                
                $opts = new CreateBlobOptions();
                $opts->setBlobContentType($content_type);
                $service->createBlockBlob(
                        self::$CONTAINER,
                        $filename,
                        $handler,
                        $opts
                );
                return true;
                
            } catch (ServiceException $e) {
                echo "Attempt $attempts failed... ";
                echo "[" . $e->getCode(). " - " . $e->getMessage() . "]\n";
            }
            
            $lapse = pow(2, $attempts+1);
            echo "Waiting $lapse seconds...\n";
            sleep($lapse);
            
            $attempts++;
        }
        return $ret;
    }

}

?>
