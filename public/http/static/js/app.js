jQuery(function( $ ) {
    'use strict';

    var App = {
        init: function() {
            this.apis = [];
            this.currentApi = '';
            this.apiElementTemplName = 'ApiElementTemplate';
            this.apiElementMarkup = '<li><a>${name}</a></li>';
            this.apiDocPrefix = '';
            this.apiUrlPrefix = 'https://publish.ruanyun.com/';
            this.apiUrlPostfix = '';
            this.cacheElements();
            this.bindEvents();
            
        },
        cacheElements: function() {

            this.$apiList          = $('#apiList');
            this.$excuteBtn        = $('.excuteApi');
            this.$requestedApiUrl  = $('#apiRequest');
            this.$apiUrl           = $('#apiUrl');
            this.$apiDocUrl        = $('#apiDoc');
            this.$paramlist        = $('#params_list');
            this.$formatedJsonTab  = $('#formatedJson');
            this.$originalJsonTab  = $('#originalJson');
            this.$collapsedJsonTab = $('#collapsedJson');
            
            this.$jsonTab          = $('#myTab a');
            $.template(this.apiElementTemplName, this.apiElementMarkup);
        },
        
        bindEvents: function() {
            
            this.$apiList.delegate("li", "click", this.chooseApi);
            this.$paramlist.delegate('button','click', this.excuteApi);
            this.$jsonTab.on('click', this.showJsonTab);
            $("#save_default_params").on('click' , this.saveDefaultParam );
        },
        
        chooseApi: function(event) {
            event.stopPropagation();
            var item = $(this);
            item.siblings(".active").removeClass("active");
            item.addClass("active");
            App.currentApi = item.text();
            App.renderApiUrl();
        },
        getCurrentApiList: function() {
            var branchid = App.currentApi;
            var apilists = '';
            apilists = svnloglists[branchid];
            return apilists;
        },
        
        //渲染每个版本的log 列表
        renderApiUrl: function() {
            var apilist = this.getCurrentApiList();
            var params = '';
            params += '<table class="table table-bordered">';
            params += '<caption><h2>好人一生平安</h2></caption>';
            params += '<thead><tr><th>项目名</th><th>域名</th><th>时间</th><th>操作</th></tr></thead>';
            $.each( apilist, function( i, api ) {
                var svnlog_array = api.split("|");
                params += '<tr>';
                var svn_version = '';
                $.each(svnlog_array, function (k,v){
                    if (k==3){
                        return false;
                    }
                    if (k==2){
                        v = v.substr(0,20);
                    }
                    v = v.trim();
                    if (k ==0){
                        svn_version = v.substr(1);
                    }
                     params += '<td>' + v + '</td>';
                });
                params += '<td><button class="btn btn-primary pull-right excuteApi" svn_version="'+svn_version+'">发布</button></td>';
                params += '</tr>';
           });
           params += '</table>';
            $("#params_list").html( params );
        },
        //发布按钮
        
        excuteApi: function(event) {
            event.stopPropagation();
            if (App.currentApi == '')
                return;
            var params = {};
            
            var target_value =[];//定义一个数组    
            $('input[name="target_machines"]:checked').each(function(){
                target_value.push($(this).val());
            });
            params.env    = $("input[name='env']").val();
            params.project    = $("input[name='project']").val();
            params.branch = App.currentApi;
            params.iplist = target_value;
            params.svn_version = $(this).attr('svn_version');
            
            App.renderViewEmpty('loading...');

            $.post( '/dealpub' , params , function(json){
                App.renderJson(json);
            },'json')

        },
        renderViewEmpty: function(json) {
            this.renderApiRequesteson(json);
            this.renderCollapsedJson(json);
            this.renderFormatedJson(json);
            this.renderOriginalJsonJson(json);
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
        renderJson: function(json) {
            this.renderApiRequesteson(json.header);
            this.renderCollapsedJson(json.body);
            this.renderFormatedJson(json.body);
            this.renderOriginalJsonJson(json);
        },
        showJsonTab: function (e) {
            e.preventDefault();
            $(this).tab('show');
        },
    }   


    App.init();

});
