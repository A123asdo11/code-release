<?php
/*  
 *默认控制器
 * @author  wangguan
 */
class IndexController extends AbstractController {
    public function indexAction() {
    	
    	if(!isset($_SESSION['manager'])){
            echo '<script>location.href="/login"</script>';
			exit;
        }
		header('location: /pub');
        exit;
    }
}
