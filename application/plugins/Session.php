<?php
/*
 * 从session中获取用户信息 $author wangguan
 */
class SessionPlugin extends Yaf_Plugin_Abstract {
	public function routerStartup(Yaf_Request_Abstract $request, Yaf_Response_Abstract $response) {
	}
	public function routerShutdown(Yaf_Request_Abstract $request, Yaf_Response_Abstract $response) {
		$this->admin_session ( $request, $response );
	}
	
	public function admin_session(Yaf_Request_Abstract $request, Yaf_Response_Abstract $response) {
		
		$php_session = isset($_COOKIE ['php_session']) ? trim($_COOKIE ['php_session']) : '';
		if (!empty($php_session)) {
			if (isset($_SESSION[$php_session])) {
				$islogin = true;
				$_SESSION['manager'] = $_SESSION[$php_session];
			}
		}
		
		$req_url = strtolower ( $request->getRequestUri () );
		if (!empty($_SESSION['manager'])) {
			//header("location: /pub");
			//exit();
		} else {
			// 没有登陆的跳转到登陆页
			$allow_url = array(
				'/login',
			);
			if (!in_array($req_url, $allow_url)) {
				header("location: /login");
				exit();
			}
		}
	}
}

