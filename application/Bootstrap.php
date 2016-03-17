<?php
/**
 *  [The Introduce of this file]   
 *	引导程序
 * @since        2013-12-31
 * @version      0.1
 */

class Bootstrap extends Yaf_Bootstrap_Abstract{

    /**
     * 加载
     * @param Yaf_Dispatcher $dispatcher
     */
    public function _initLoader (Yaf_Dispatcher $dispatcher) {
        Yaf_Loader::getInstance()->registerLocalNamespace(array('Comm', 'Cache', 'Da', 'Tool'));
    }
    /**
     * 初始化配置
     * @param Yaf_Dispatcher $dispatcher
     */
    public function _initConfig (Yaf_Dispatcher $dispatcher) {
        Yaf_Registry::set("config", Yaf_Application::app()->getConfig());     
    }
	
	public function _initContext(Yaf_Dispatcher $dispatcher) {
		Comm_Context::init();
	}
    /**
     * 加载插件
     * @param Yaf_Dispatcher $dispatcher
     */
    public function _initPlugin (Yaf_Dispatcher $dispatcher) {
        $dispatcher->registerPlugin(new SessionPlugin());
    }
    
    
    /**
     * 初始化模板
     * @param Yaf_Dispatcher $dispatcher
     */
    public function _initView (Yaf_Dispatcher $dispatcher) {
        /* 关闭视图引擎 */
        //$dispatcher->disableView();
        $view = $dispatcher->initView(APP_PATH . '/views');
        Yaf_Registry::set("view", $view);
    }
}
