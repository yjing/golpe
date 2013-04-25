<?php

class CommentMedia extends AppModel {
    public $useTable = "comments_media";

    public $name = 'CommentMedia';
    
    public $belongsTo = array('Comment','Media');
    

}

?>
