<?php

class OutloginController extends AbstractController {
    public function indexAction(){
		
		$managerinfo = $_SESSION['manager'];
		$cookie_val = $managerinfo['username'] . "." . $managerinfo['pwd'];
		setcookie('php_session', $cookie_val, time() -1, '/');
		unset($_SESSION['manager']);
        echo '<script>location.href="/login"</script>';
        exit;
    }
}
