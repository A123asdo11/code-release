<?php

/*
 * 发布代码
 * @author wangguan
 */

class PubController extends AbstractController {

	public function indexAction() {
		$env = Comm_Context::param('env', 'test', true);
		$error_msg = '';
		//读取项目配置文件
		$env_array = array(
			'test','sanbox','online'
		);
		if (!in_array($env, $env_array)){
			$error_msg = '参数错误';
		}
		
		$project = Comm_Config::conf('project');
		$project_info = array();
		
		$have_project = $_SESSION['manager']['project'];
		if (!isset($have_project[$env])){
			$error_msg = '没有权限';
		} else {
			foreach ($have_project[$env] as $value) {
				$project_info[$value] = $project[$env][$value];
			}
		}
		
		$view = Yaf_Registry::get("view");
		$view->assign(array(
			'env' => $env,
			'error_msg' => $error_msg,
			'project_info' => $project_info,
				)
		);
	}

}
