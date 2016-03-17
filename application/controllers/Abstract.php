<?php
/**
 *  [The Introduce of this file]   
 * 控制层基类
 * @since        2014-1-2
 * @version      0.1
 */
abstract class AbstractController extends Yaf_Controller_Abstract{
        
    public function render_page($tpl,$data) {
        $this->getView()->display($this->getViewPath() . $tpl,$data);
        exit();
    }
    public function render_csv($data,$filename) {
    	header ( "Content-type:text/csv" );
    	header ( "Content-Disposition:attachment;filename=" . $filename );
    	header ( 'Cache-Control:must-revalidate,post-check=0,pre-check=0' );
    	header ( 'Expires:0' );
    	header ( 'Pragma:public' );
    	echo $data;
    	exit ();
    }
}