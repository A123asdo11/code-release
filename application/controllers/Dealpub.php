<?php
/*  
 * 执行代码发布
 * @author  wangguan
 */
class DealpubController extends AbstractController {
	public function indexAction() {
		$env = Comm_Context::form('env', '', true);
		$project =  Comm_Context::form('project', '', true);
		$branch = Comm_Context::form('branch', '', true);
		$iplist = Comm_Context::form('iplist');
		$svn_version = Comm_Context::form('svn_version', '', true);
		
		if (empty($env) || empty($project) || empty($branch) || empty($iplist) || empty($svn_version)){
			return self::render_result(1, '参数有误',array());
		}
		
		$have_project = $_SESSION['manager']['project'];
		if (!isset($have_project[$env]) || !in_array($project, $have_project[$env])){
			return self::render_result(1, '没有权限',array());
		}
		
		$projectinfo_all = Comm_Config::conf('project');
		$projectinfo = $projectinfo_all[$env][$project];
		//验ip
		if (!is_array($iplist)){
			return self::render_result(1, 'ip有误',array());
		}
		if ($iplist != array_intersect($iplist, $projectinfo['target_machines'])){
			return self::render_result(1, 'ip有误',array());
		}
		
		$basepath = "/data/code/";
		
		$dirname = $basepath.$projectinfo['domain'].'/'.$branch; //发布机上存放代码的目录
		$svndir = $projectinfo['svn'].'/'.$branch;
		
		$publog2 = array();
		if (!is_dir($dirname)){
			exec("/usr/bin/svn co  '".$svndir."'  '".$dirname."'", $publog2['co']);
		}else{
			exec("/usr/bin/svn update". " -r " . $svn_version ." ".$dirname, $publog2['update']);
		}
		
		$pwd = '/data/app/nginx/html/p.publish.com'; //发布机上本系统的代码的目录
		$publog = '';
		$publog = "$env.$project | $projectinfo[domain] | $svndir | $svn_version | " . date('Y-m-d H:i:s') . " | " . $_SESSION['manager']['username'] . ' | ';
		$cmd = '';
		foreach ($iplist as $machine) {
			$tmplog = '';
			$cmd .= $pwd . '/publish.sh ' . $projectinfo['domain'] . ' ' . $branch . ' ' . $svndir . ' ' . $svn_version . ' ' . $machine;
			$cmd .= "<br>";
			exec($pwd . '/publish.sh ' . $projectinfo['domain'] . ' ' . $branch . ' ' . $svndir . ' ' . $svn_version . ' ' . $machine, $tmplog);
			$publog2[$machine] = $tmplog;
			$publog .= $machine . " : " . json_encode($tmplog) . "\n";
		}
		//write log
		self::writelog($publog);
		return self::render_result(0, $cmd, $publog2);
	}
	public static function render_result($code, $msg, $body) {
		$rs = array(
			'header' => array(
				'code' => $code,
				'info' => $msg,
			),
			'body' => $body,
		);
		echo json_encode($rs);
		exit;
	}
	public static function writelog($str){
		file_put_contents('/data/app/nginx/html/p.publish.com/pub.log', $str, FILE_APPEND);
	}
}
