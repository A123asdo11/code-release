<?php
/** 
 * Controller的上下文。用来存储一些在请求中共用的数据，以及提供GET/POST参数的简便封装。
 * 
 * @package Swift
 * @author  wangguan<jiu999jiu999@126.com>
 */
class Comm_Context {
	private static $context_data = array();
	private static $has_inited = false;
	protected static $server = array();
	
	/**
	 * 是否保持$_SERVER变量。默认为false，不保持。
	 * 
	 * 注：Comm_Context::init()默认行为会在得到$_SERVER的内容后删除。为了保持某些lib的兼容性，添加此开关。
	 * 
	 * @var bool
	 */
	public static $keep_server_copy = true;
	
	/**
	 * 初始化context。
	 */
	public static function init(){
		if(self::$has_inited){
			return ;
		}
		self::$has_inited = true;
		self::$server = $_SERVER;
		if(!self::$keep_server_copy){
			unset($_SERVER);
		}
	}
    
    /**
     * 重新初始化context，只用于PL服务化后端
     */
    public static function reinit($server){
        $_SERVER = array_merge(self::$server, $server);
        self::$server = $_SERVER;
    }

	/**
	 * 转换过滤字符串
	 *
	 * @param string $string
	 * @return string
	 */
	public static  function filter_tring($string)
	{
		if($string===NULL)
		{
			return false;
		}
		return htmlspecialchars($string, ENT_QUOTES);
	}
	/**
	 * 从$_GET中获取指定参数的值。
	 * 如果指定参数未找到，则会返回默认值$if_not_exist的值。
	 * 
	 * @param string $name 参数名。
	 * @param mixed $if_not_exist 若指定的$name的值不存在的情况下返回的默认值。可选，采用NULL作为默认值。
	 * @return string 
	 */
	public static function param($name, $if_not_exist = NULL, $is_filter = false){
		if($is_filter){
            return isset($_GET[$name]) ?  (self::filter_tring($_GET[$name])) : $if_not_exist;
		} 
		return isset($_GET[$name]) ?  $_GET[$name] : $if_not_exist;
	}
	
	/**
	 * 从$_Cookie中获取指定参数的值。
	 * 如果指定参数未找到，则会返回默认值$if_not_exist的值。
	 * @param string $name 参数名称
	 * @param mixed $if_not_exist 若指定的$name的值不存在的情况下返回的默认值。可选，采用NULL作为默认值。
	 * @return string
	 */
	public static function cookie($name, $if_not_exist = NULL) {
	    return isset($_COOKIE[$name]) ? $_COOKIE[$name] : $if_not_exist;
	}
	
	/**
	 * 从$_POST中获取指定参数的值。如果指定参数未找到，则会返回默认值$if_not_exist的值。
	 * 
	 * @param string $name 参数名。
	 * @param mixed $if_not_exist 若指定的$name的值不存在的情况下返回的默认值。可选，采用NULL作为默认值。
	 * @return string 
	 */
	public static function form($name, $if_not_exist = NULL, $is_filter = false){
            if($is_filter){
                return isset($_POST[$name]) ?  (self::filter_tring($_POST[$name])) : $if_not_exist;
            } 
            return isset($_POST[$name]) ? $_POST[$name] : $if_not_exist;
	}
	
	/**
	 * 得到当前请求的环境变量
	 * 
	 * @param string $name
	 * @return string|null 当$name指定的环境变量不存在时，返回null
	 */
	public static function get_server($name){
		return isset(self::$server[$name]) ? self::$server[$name] : null;
	}
	
	/**
	 * 根据指定的上下文键名获取一个已经设置过的上下文键值
	 * 
	 * @param string|int|float $key 键名
	 * @param mixed $if_not_exist 当键值未设置的时候的默认返回值。可选，默认是Null。如果该值是Null,当键值未设置则会抛出一个异常；否则，返回该值。
	 * @return mixed 如果指定的$key不存在，根据 $if_not_exist 的值，会抛出一个异常或者 $if_not_exist 本身。
	 */
	public static function get($key, $if_not_exist = NULL){
		if (!isset(self::$context_data[$key])) {
			if($if_not_exist === NULL){
				throw new Comm_Exception_Program('context has no "' . $key . '" in it');
			}else{
				return $if_not_exist;
			}
		}
		return self::$context_data[$key];
	}
	
	/**
	 * 往一个指定的上下文键名中设置键值。如果该键值已经被设置，则会抛出异常。
	 * 
	 * @param string|int|float $key
	 * @param mixed $value
	 * @param array $rule
	 * @throws Comm_Exception_Program
	 */
	public static function set($key, $value, array $rule = array()){
		if(array_key_exists($key, self::$context_data)){
			throw new Comm_Exception_Program('context has been already setted');
		}
		
		if($rule){
			$type = $rule[0];
			$rule[0] = $value;
			$value = call_user_func_array(array('Comm_Argchecker', $type), $rule);
		}
		self::$context_data[$key] = $value;
	}
	
	/**
	 * 获取当前域名
	 * 
	 * @return string
	 */
	public static function get_domain(){
		return self::get_server('SERVER_NAME');
	}
	
	/**
	 * 获取客户端ip地址
	 * 
	 * This function is copied from login.sina.com.cn/module/libmisc.php/get_ip()
	 * 
	 * @param boolean $to_long	可选。是否返回一个unsigned int表示的ip地址
	 * @return string|float		客户端ip。如果to_long为真，则返回一个unsigned int表示的ip地址；否则，返回字符串表示。
	 */
	public static function get_client_ip($to_long = false){
		$forwarded = self::get_server('HTTP_X_FORWARDED_FOR');
		if($forwarded){
			$ip_chains = explode(',', $forwarded);
			$proxied_client_ip = $ip_chains ? trim(array_pop($ip_chains)) : '';
		}
		
		if(Comm_Util::is_private_ip(self::get_server('REMOTE_ADDR')) && isset($proxied_client_ip)){
			$real_ip = $proxied_client_ip;
		}else{
			$real_ip = self::get_server('REMOTE_ADDR');
		}
		
		return $to_long ? Comm_Util::ip2long($real_ip) : $real_ip;
	}
	
	/**
	 * 
	 * 获取http请求方法。
	 * @return string GET/POST/PUT/DELETE/HEAD等
	 */
	public static function get_http_method(){
		return self::get_server('REQUEST_METHOD');
	}
	
	/**
	 * 判断当前请求是否是XMLHttpRequest(AJAX)发起
	 * @return boolean
	 */
	public static function is_xmlhttprequest () {
		return (self::get_server('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest') ? true : false;
	}
	
	/**
	 * 返回当前url
	 * 
	 * @param bool $urlencode 是否urlencode后返回，默认true
	 */
    public static function get_current_url($urlencode = true) {
        $req_uri = self::get_server('REQUEST_URI');	
        if (NULL === $req_uri) {
            $req_uri = self::get_server('PHP_SELF');
        }
        $https = self::get_server('HTTPS');
        $s = NULL === $https ? '' : ('on' == $https ? 's' : '');
        
        $protocol = self::get_server('SERVER_PROTOCOL');
        $protocol =  strtolower(substr($protocol, 0, strpos($protocol, '/'))).$s;
        
        $port = self::get_server('SERVER_PORT');
        $port = ($port == '80') ? '' : (':'.$port);
        //context::init()初始化server变量时机不对,具体请参看Bootstrap.php.在这做一下
		$server_name =self::get_server('HTTP_HOST');
		if (empty($server_name)){
			$server_name = self::get_server('SERVER_NAME');
		}
        $current_url = $server_name.$port.$req_uri;
        
        return $urlencode ? rawurlencode($current_url): $current_url;
    }
	
	/**
	 * 为访问上下文中的共享变量设置的魔术方法。PHP >= 5.3.0 有效
	 * magic method to provide shortcuts for access share vars in context.
	 * 
	 * Tutorial 示例:
	 * <code>
	 * Comm_Context::set_rodin('foo');
	 * Comm_Context::get_rodin() === Comm_Context::get('rodin'); // true
	 * Comm_Context::set('bar', 'rodin');
	 * Comm_Context::get_bar() === Comm_Context::get('bar'); // true
	 * </code>
	 * This func won't work until php >= 5.3.0
	 * @param string $func
	 * @param array $params
	 */
	public static function __callstatic($func, $params){
		if(substr($func, 0, 4) === 'get_'){
			return self::get(substr($func, 4));
		}elseif (substr($func, 0, 4) === 'set_'){
			if(!$params){
				return self::set(substr($func, 4), null);
			}elseif(isset($params[1])){
				return self::set(substr($func, 4), $params[0], $params[1]);
			}else{
				return self::set(substr($func, 4), $params[0]);
			}
		}
	}
	

	/**
	 * 清除context中的所有内容
	 */
	public static function clear(){
		//为了防止引用计数产生的内存泄漏，此处显式的unset掉所有set进来的值
		foreach (self::$context_data as $key => $value){
			self::$context_data[$key] = null;
			$value = null;
		}
		self::$context_data = array();
	}
}

?>
