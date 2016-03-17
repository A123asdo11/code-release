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
            this.currentApi = '';
            this.apiElementTemplName = 'ApiElementTemplate';
            this.apiElementMarkup = '<li><a>${name}</a></li>';
            this.apiDocPrefix = 'http://open.weibo.com/wiki/2/';
            this.apiUrlPrefix = 'https://api.weibo.com/2/';
            this.apiUrlPostfix = '.json';
            this.cacheElements();
            this.bindEvents();
            this.fetchApis();
            this.render();
        },
        cacheElements: function() {
            this.$apiTypeList = $("#apiCat");
            this.$apiList = $('#apiList');
            this.$excuteBtn = $('#excuteApi');
            this.$requestedApiUrl = $('#apiRequest');
            this.$apiUrl = $('#apiUrl');
            this.$apiDocUrl = $('#apiDoc');
            this.$rawJsonTab = $('#rawJson');
            this.$formatedJsonTab = $('#formatedJson');
            this.$collapsedJsonTab = $('#collapsedJson');
            this.$jsonTab = $('#myTab a');
            $.template(this.apiElementTemplName, this.apiElementMarkup);
        },
        bindEvents: function() {
            this.$apiTypeList.on('change', this.changeApiType );
            this.$apiList.delegate("li", "click", this.chooseApi);
            this.$excuteBtn.on('click', this.excuteApi);
            this.$jsonTab.on('click', this.showJsonTab);
            
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
                var id = parseInt(typeid);
                $.each( this.apis, function( i, apiType ) {
                    if (typeid == apiType.id) {
                        apilist = apiType.apilist
                    }
                });
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
            var params = '';
            $.each( apilist, function( i, api ) {
                if (api.name == App.currentApi) {
                    var len = api.param.length;
                    if (len > 0) params += '?';
                    for (var j = 0; j < len; j++) {
                        if (j > 0) params += '&';
                        params += api.param[j] + '=';
                    }
                }
            });
            var apiUrl = this.apiUrlPrefix + this.currentApi + this.apiUrlPostfix;
            this.$apiUrl.val(apiUrl + params);
        },
        renderApiDocUrl: function() {
            this.$apiDocUrl.attr("href", this.apiDocPrefix + this.currentApi);
        },
        excuteApi: function(event) {
            event.stopPropagation();
            if (App.currentApi == '')
                return;
            var url = "/rpc?api=" + App.currentApi;
            var param = Utils.parseUrlQueryString(App.$apiUrl.val());
            App.renderRequestApiUrl(param);
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                data: param,
                success: App.apiExcResult
            });
        },
        renderRequestApiUrl: function(paramObj) {
            var qs = Utils.constructQueryString(paramObj);
            var url = this.apiUrlPrefix + this.currentApi + this.apiUrlPostfix;
            this.$requestedApiUrl.text(url + qs);
        },
        apiExcResult: function(obj, textStatus, xhr) {
            xhr = null;
            var json = null;
            if (obj.status && (obj.status === 'success' || obj.status === 'error')) {
                json = obj.rst;
            } else {
                json = obj;
            }
            App.renderJson(json);
        },
        renderJson: function(json) {
            this.renderCollapsedJson(json);
            this.renderFormatedJson(json);
            this.renderRawJson(json);
        },
        renderCollapsedJson: function(json) {
            jsonview(json, this.$collapsedJsonTab);
        },
        renderFormatedJson: function(json) {
            this.$formatedJsonTab.html(JSON.stringify(json, null, 4));
            prettyPrint();
        },
        renderRawJson: function(json) {
            this.$rawJsonTab.text(JSON.stringify(json));
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