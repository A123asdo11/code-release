<?php

/*
 * 登陆
 * @author wangguan
 */

class LoginController extends AbstractController {

	public function indexAction() {
		$username = Comm_Context::form('username', '', true);
		$password = Comm_Context::form('password', '', true);
		$error_msg = '';
		if (!empty($username) && !empty($password)) {
			//验证
			$md5pwd = md5($password);
			$userarray = Comm_Config::conf('userinfo');
			if (!isset($userarray[$username])) {
				$error_msg = '用户不存在';
			} else {
				if ($md5pwd == $userarray[$username]['pwd']) {
					$cookie_val = $username . "." . md5($md5pwd);
					setcookie('php_session', $cookie_val, time() + 600, '/');
					$_SESSION[$cookie_val] = $userarray[$username];
					header('location:/pub');
					exit();
				} else {
					$error_msg = '密码不正确';
				}
			}
		}
		if (!empty($username) && empty($password)) {
			$error_msg = '密码不能为空';
		}
		if (empty($username) && !empty($password)) {
			$error_msg = '用户名不能为空';
		}

		$view = Yaf_Registry::get("view");
		$view->assign(array(
			'error_msg' => $error_msg,
			'username' => $username,
				)
		);
	}
}
