<?php
return array(
	//线上工程
	'online' => array(
		'flow' => array(
			'name' => '流量后台',
			'svn' => 'svn://svn.publish.com/publish/flow/admin/',//svn地址
			'domain' => 'flow.ponline.com',//域名
			'target_machines' => array( //要发布的机器
				'192.168.1.112',
				'192.168.1.245',
			)
		),
		'channel' => array(
			'name' => '流量渠道',
			'svn' => 'svn://svn.publish.com/publish/flow/channel/',
			'domain' => 'channel.flow.ponline.com',
			'target_machines' => array(
				'192.168.1.112',
				'192.168.1.245',
			)
		),
	),
	//仿真环境
	'sanbox' => array(
		'flow' => array(
			'name' => '流量后台【仿真】',
			'svn' => 'svn://svn.publish.com/publish/flow/admin/',
			'domain' => 't.flow.ponline.com',
			'target_machines' => array(
				'192.168.1.197',
			)
		),
		'channel' => array(
			'name' => '流量渠道【仿真】',
			'svn' => 'svn://svn.publish.com/publish/flow/channel/',
			'domain' => 't.channel.flow.ponline.com',
			'target_machines' => array(
				'192.168.1.197',
			)
		),
	),
	//测试环境
	'test' => array(
		'flow' => array(
			'name' => '流量后台【测试】',
			'svn' => 'svn://svn.publish.com/publish/flow/admin/',
			'domain' => 't.flow.publish.com',
			'target_machines' => array(
				'192.168.1.75',
			)
		),
		'channel' => array(
			'name' => '流量渠道【测试】',
			'svn' => 'svn://svn.publish.com/publish/flow/channel/',
			'domain' => 't.channel.flow.publish.com',
			'target_machines' => array(
				'192.168.1.75',
			)
		),
	),
);
