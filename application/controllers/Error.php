<?php

class ErrorController extends Yaf_Controller_Abstract {
	public function errorAction() {
	    $exception = $this->getRequest()->getException();
	    try {
	        var_dump($exception);
	        exit();
	        throw $exception;
	    } catch (Yaf_Exception_LoadFailed $e) {
	        //加载失败
	    } catch (Yaf_Exception $e) {
	        //其他错误
	    }
	}
}
