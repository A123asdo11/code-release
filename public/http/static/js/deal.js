jQuery(function( $ ) {
    'use strict';

    var Utils = {
        parseUrlQueryString: function(url) {
            var urlParams = {};
            (function () {
                var match,
                    pl     = /\+/g,  // Regex for replacing addition symbol with a space
                    search = /([^&=]+)=?([^&]*)/g,
                    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                    ind = url.indexOf('?'),
                    query  = ((ind != -1) ? url.substring(ind + 1) : '');

                while (match = search.exec(query))
                   urlParams[decode(match[1])] = decode(match[2]);
            })();
            return urlParams;
        },
        constructQueryString: function(paramObj) {
            var keys = this.validKeys(paramObj);
            var queryString = '';
            if (keys.length > 0) queryString += '?';
            $.each( keys, function( i, key ) {
                if (paramObj[key] != '') {
                    if (i > 0) queryString += '&';
                    queryString += key + '=' + paramObj[key];
                }
            });
            return queryString;
        },
        validKeys: function(obj) {
            var keys = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (obj[key] && obj[key] != '')
                        keys.push(key);
                }
            }
            return keys;
        }
    };

    var App = {
        init: function() {
            this.apis = [];
            this.default_params = {};
            this.currentApi = '';
            this.apiElementTemplName = 'ApiElementTemplate';
            this.apiElementMarkup = '<li><a>${name}</a></li>';
            this.apiDocPrefix = '';
            this.apiUrlPrefix = 'https://storeapi/';
            this.apiUrlPostfix = '';
            this.cacheElements();
            this.init_default();
            this.bindEvents();
            //this.fetchApis();
            this.render();
            
            
        },
        //刷新后的处理
        init_default:function(){
            if( localStorage.default_params != undefined ){
                App.default_params = JSON.parse( localStorage.default_params );
                $("input[rel='default_params']").each(function(i,n){
                    if( App.default_params[ $(n).attr('name') ] ){
                        $(this).attr('value' , App.default_params[ $(this).attr('name') ] ); 
                    }
                })
            }

            if( localStorage.apiUrlPrefix!=undefined ){
                App.apiUrlPrefix = localStorage.apiUrlPrefix;

                this.$apiServerList.val( App.apiUrlPrefix );
            }
        },
        //保存默认参数
        saveDefaultParam:function(){
            $("input[rel='default_params']").each(function(i,n){
                App.default_params[ $(this).attr('name') ] = $(this).attr('value');
            })
            localStorage.default_params = JSON.stringify( App.default_params );
            alert('设置成功');
        },
        cacheElements: function() {
            this.$apiTypeList      = $("#apiCat");
            this.$apiServerList    = $("#apiServers");
            this.$apiList          = $('#apiList');
            this.$excuteBtn        = $('#excuteApi');
            this.$requestedApiUrl  = $('#apiRequest');
            this.$apiUrl           = $('#apiUrl');
            this.$apiDocUrl        = $('#apiDoc');
            this.$rawJsonTab       = $('#rawJson');
            this.$formatedJsonTab  = $('#formatedJson');
            this.$originalJsonTab  = $('#originalJson');
            this.$collapsedJsonTab = $('#collapsedJson');
            this.$debugInfoTab     = $('#debugInfo');
            this.$jsonTab          = $('#myTab a');
            $.template(this.apiElementTemplName, this.apiElementMarkup);
        },
        bindEvents: function() {
            this.$apiTypeList.on('change', this.changeApiType );
            this.$apiServerList.on('change', this.changeApiServer );
            this.$apiList.delegate("li", "click", this.chooseApi);
            this.$excuteBtn.on('click', this.excuteApi);
            this.$jsonTab.on('click', this.showJsonTab);
            $("#save_default_params").on('click' , this.saveDefaultParam );
        },

        fetchApis: function() {
            $.ajax({
                url: '/api/list',
                type: "GET",
                dataType: "json",
                success: this.fetchApisResult
            });
        },
        fetchApisResult: function(obj, textStatus, xhr) {
            xhr = null;
            if (obj.status && obj.status === 'success') {
                App.apis = obj.rst;
                App.renderApiTypeList();
            }
        },
        renderApiTypeList: function() {
            $.each( this.apis, function( i, apiType ) {
                App.$apiTypeList.append('<option id=' + apiType.id + '>' + apiType.name + '</option>');
            });
            this.$apiTypeList.find('option:first').trigger('change');
        },
        changeApiType: function() {
            App.renderApiList();
        },
        //切换服务器
        changeApiServer: function() {
            App.apiUrlPrefix =  $(this).find('option:selected').attr('value') ;
            localStorage.apiUrlPrefix = App.apiUrlPrefix;
        },

        renderApiList: function() {
            var apilist = this.getCurrentApiList();
            if (apilist) {
                this.$apiList.empty();
                $.tmpl(this.apiElementTemplName, apilist).appendTo(this.$apiList);
            }
        },
        getCurrentApiList: function() {
            var apilist = null;
            var typeid = this.$apiTypeList.find('option:selected').attr('id');
            if (typeid){
                try{
                    apilist = apilists[typeid]['list'];
                }catch(e){
                    console.log( '无子级' );
                }
                
            }
            return apilist;
        },
        chooseApi: function(event) {
            event.stopPropagation();
            var item = $(this);
            item.siblings(".active").removeClass("active");
            item.addClass("active");
            App.currentApi = item.text();
            App.renderApiUrl();
            App.renderApiDocUrl();
        },
        renderApiUrl: function() {
            var apilist = this.getCurrentApiList();
            console.log(apilist);
            var params = '';
            $.each( apilist, function( i, api ) {
                if (api.name == App.currentApi) {
                    var len = api.param.length;
                    for (var j = 0; j < len; j++) {
                    	var input_param_name = api.param[j];
                    	
                        if( App.default_params[ api.param[j] ]!=undefined ){
                        	var default_value = App.default_params[ api.param[j] ];
                        }else{
                        	 if(api.api_default[input_param_name]['default'] != undefined){
                        		 var default_value = api.api_default[input_param_name]['default'] ;
                        	 }else{
                        		 var default_value = '';
                        	 }
                        }
                        if(api.api_default[input_param_name]['comment'] != undefined){
                        	var api_comment = api.api_default[input_param_name]['comment'];
                        }else{
                        	var api_comment = false;
                        }
                        params += '<li><span>'+api.param[j] + '';
                        if(api_comment){
                        	params +='('+api_comment+')';
                        }
                        params +=':</span>';
                        params +='<input type="text" rel="api_params" params_name=' + api.param[j] + ' value="'+default_value+'">';
                        params +='</li>';
                    }
                }
            });
            $("#params_list").html( params );
        },
        renderApiDocUrl: function() {
            this.$apiDocUrl.attr("href", this.apiDocPrefix + this.currentApi);
        },
        excuteApi: function(event) {
            event.stopPropagation();
            if (App.currentApi == '')
                return;

            var params = {};

            params.r_api    = App.currentApi;
            params.r_server = App.apiUrlPrefix;
            params.sign_state = (App.default_params.sign_state!=undefined && App.default_params.sign_state!='') ? App.default_params.sign_state : $("select[name='sign_state']").val();
            params.channel = (App.default_params.channel!=undefined && App.default_params.channel!='') ? App.default_params.channel : $("select[name='channel']").val();
            params.curl_method = (App.default_params.curl_method!=undefined && App.default_params.curl_method!='') ? App.default_params.curl_method : $("select[name='curl_method']").val();
            params.api_debug   = (App.default_params.api_debug!=undefined && App.default_params.api_debug!='') ? App.default_params.api_debug : $("input[name='api_debug']").val();

            $("input[rel='api_params']").each(function(i,n){
                params[ $(this).attr('params_name') ] = $(this).attr('value');
            });
            App.renderViewEmpty('loading...');

            $.post( '/test/curlrequest' , params , function(json){
                App.renderJson(json);
            },'json')

        },
        renderRequestApiUrl: function(paramObj) {
            var qs = Utils.constructQueryString(paramObj);
            var url = this.apiUrlPrefix + this.currentApi + this.apiUrlPostfix;
            this.$requestedApiUrl.text(url + qs);
        },

        renderViewEmpty: function(json) {
            this.renderApiRequesteson(json);
            this.renderCollapsedJson(json);
            this.renderFormatedJson(json);
            this.renderOriginalJsonJson(json);
            this.renderRawJson(json);
            this.renderdebugInfoJson(json);
        },

        renderJson: function(json) {
            this.renderApiRequesteson(json.header);
            this.renderCollapsedJson(json.body);
            this.renderFormatedJson(json.body);
            this.renderOriginalJsonJson(json);
            this.renderRawJson(json.trace);
            this.renderdebugInfoJson(json.debug);
        },
        renderdebugInfoJson:function(json){
            jsonview(json, this.$debugInfoTab);
        },
        renderApiRequesteson: function(json) {
            $("#apiRequestUrlInfo").html( '[ ' +App.apiUrlPrefix + '/' + App.currentApi + ' ]' );
            jsonview(json, this.$requestedApiUrl);
        },
        renderCollapsedJson: function(json) {
            jsonview(json, this.$collapsedJsonTab);
        },
        renderFormatedJson: function(json) {
            this.$formatedJsonTab.text(JSON.stringify(json, null, 4));
            prettyPrint();
        },
        renderOriginalJsonJson: function(json) {
            this.$originalJsonTab.text(JSON.stringify(json, null, 4));
//            prettyPrint();
        },
        renderRawJson: function(json) {
            //this.$rawJsonTab.text( JSON.stringify(json) );
            jsonview(json, this.$rawJsonTab);
        },
        showJsonTab: function (e) {
            e.preventDefault();
            $(this).tab('show');
        },
        render: function() {
        }
    };

    App.init();

});
