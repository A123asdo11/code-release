<?php
/**
 *  [The Introduce of this file]   
 *  入口文件
 * @author       chuansong,weibo Team <chuansong@staff.sina.com.cn>
 * @copyright    copyright(2013) weibo.com all rights reserved
 * @since        2013-12-31
 * @version      0.1
 */
header("content-type:text/html;charset=utf-8");
session_start();
define('ROOT_PATH', dirname(dirname(__FILE__)));
define('APP_PATH', ROOT_PATH . '/application');
define('TPLPATH', APP_PATH  . '/views');
define('LOGPATH', '/data/log/publish.ruanyun.com/');

error_reporting(E_ALL);
ini_set('display_errors', '1');
date_default_timezone_set('Asia/Shanghai');

try {
	$intBeg = microtime(true);
	$app = new Yaf_Application(APP_PATH . '/config/application.ini');
	$app->bootstrap()->run();
	$intEnd = microtime(true);
	Tool_Log_commlog::log_notice($_SERVER['PHP_SELF'],'cost[' . intval(1000 * ($intEnd - $intBeg)) . '] request finished');
	
} catch (Exception $e) {
	
	$exception_code = $e->getCode();
	$exception_code = empty($exception_code) ? 9001 : $exception_code;
	$exception_msg = $e->getMessage();
	$exception_args = isset($e->args) ? $e->args : NULL;
	Tool_Log_commlog::log_fatal($_SERVER['PHP_SELF'],"exception happened,code:$exception_code, msg:".$exception_msg);
	
	if(empty($exception_args)) {
		$msg = Comm_Config::conf ( 'errorcode.'.$exception_code );
	} else {
		$msg = vsprintf(Comm_Config::conf ( 'errorcode.'.$exception_code ), $exception_args);
	}
	
	if ( Comm_Context::is_xmlhttprequest() || preg_match('/api./', $_SERVER['HTTP_HOST'])) {
		Tool_Jsout::normal($exception_code, $msg);
	} else {
		echo $msg;
	}
	exit();
}



























/*

header("Content-type: text/html; charset=utf-8");
header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); 	// Date in the past
header("Pragma: no-cache");

// 定义应用路径常量APP_PATH
define("DS", DIRECTORY_SEPARATOR);
define('APP_PATH', dirname(__FILE__));

ini_set('include_path', "/data1/sinawap/code/weibo_platform:".ini_get('include_path'));

//error_reporting(E_ALL & ~E_NOTICE);
ini_set('display_errors', '1');

require APP_PATH . '/config/sysConfig.php';

// 主程序启动
try {
    $app = new Yaf_Application(APP_PATH . '/conf/application.ini');
    $app->bootstrap()->run();
} catch (Exception $e) {
    echo $e->getMessage();
}*/

