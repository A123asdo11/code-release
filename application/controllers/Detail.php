<?php
/*  
 * 代码发布详细
 * @author  wangguan
 */
class DetailController extends AbstractController {
    public function indexAction() {
    	$env = Comm_Context::param('env', 'test', true);
		$project =  Comm_Context::param('project', '', true);
		
		$view = Yaf_Registry::get("view");
		
		$error_msg = '';
		$orgin_branchlist = array();
		$branchlist = array();
		$svninfo = array();
		$projectinfo = array();
		
		$have_project = $_SESSION['manager']['project'];
		if (!isset($have_project[$env]) || !in_array($project, $have_project[$env])) {
			$error_msg = '没有权限';
		} else {
			$projectinfo_all = Comm_Config::conf('project');
			$projectinfo = $projectinfo_all[$env][$project];
			$trunk_output = array();
			exec('/usr/bin/svn log -l 10 ' . $projectinfo['svn'] . '/trunk/ |/bin/grep "^r"', $trunk_output);
			$svninfo['trunk'] = $trunk_output;
			//获取所有分支
			exec('/usr/bin/svn ls ' . $projectinfo['svn'] . '/branch', $orgin_branchlist);
			foreach ($orgin_branchlist as $value) {
				$branch_output = array();
				exec('/usr/bin/svn log -l 10 ' . $projectinfo['svn'] . '/branch/' . $value . ' |/bin/grep "^r"', $branch_output);
				$key = substr($value, 0, -1);
				$svninfo['branch/' . $key] = $branch_output;
				$branchlist[] = 'branch/' . $key;
			}
		}
		//print_r($svninfo);

		$view->assign(array(
			'env' => $env,
			'project' => $project,
			'projectinfo' => $projectinfo,
			'error_msg' => $error_msg,
			'branchlist' => $branchlist,
			'svnloglists' => $svninfo,
			)
		);
		
    }
}
