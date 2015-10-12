Angular-SEO
-----------

SEO for AngularJS apps made easy. Based on [PhantomJS](http://phantomjs.org/) and [yearofmoo's article](http://www.yearofmoo.com/2012/11/angularjs-and-seo.html).


Requirements
============

You will need [PhantomJS](http://phantomjs.org/) to make this work, as it will render the application to HTML.


How to use
==========

The solution is made of 3 parts:
- small modification of your static HTML file
- an AngularJS module, that you have to include and call
- PhantomJS script


Modifying your static HTML
==========================

Just add this to your `<head>` to enable AJAX indexing by the crawlers.
```
    <meta name="fragment" content="!" />
```

AngularJS Module
================

Just include `angular-seo.js` and then add the `seo` module to you app:
```
angular.module('app', ['ng', 'seo']);
```

If you are using [RequireJS](http://requirejs.org/), the script will detect it and auto define itself *BUT* you will need to have an `angular` shim defined, as `angular-seo` requires it:
```
requirejs.config({
    paths: {
        angular: 'http://cdnjs.cloudflare.com/ajax/libs/angular.js/1.0.8/angular.min',
    },
    shim: {
        angular: {
            exports: 'angular'
        }
    }
});
```

Then you must call `$scope.htmlReady()` when you think the page is complete. This is nescessary because of the async nature of AngularJS (such as with AJAX calls).
```
function MyCtrl($scope) {
    Items.query({}, function(items) {
        $scope.items = items;
        $scope.htmlReady();
    });
}
```

If you have a complicated AJAX applicaiton running, you might want to automate this proccess, and call this function on the config level.

**Please that this is only a suggestion we've came up with in order to make your life easier, and might work great with some set-ups, while not working at all with others, overall, you should try it yourself and see if it's a good fit for your needs.**
There's alwasys the basic setup of calling $rootScope.htmlReady() from the controller.

Example:
```javascript
var app = angular.module('myApp', ['angular-seo'])
.config(function($routeProvider, $httpProvider){
    $locationProvider.hashPrefix('!');
    $routeProvider.when({...});

    var $http,
            interceptor = ['$q', '$injector', function ($q, $injector) {
                var error;
                function success(response) {
                    $http = $http || $injector.get('$http');
                    var $timeout = $injector.get('$timeout');
                    var $rootScope = $injector.get('$rootScope');
                    if($http.pendingRequests.length < 1) {
                        $timeout(function(){
                            if($http.pendingRequests.length < 1){
                                $rootScope.htmlReady();
                            }
                        }, 1000);
                    }
                    return response;
                }

                function error(response) {
                    $http = $http || $injector.get('$http');

                    return $q.reject(response);
                }

                return function (promise) {
                    return promise.then(success, error);
                }
            }];

        $httpProvider.responseInterceptors.push(interceptor);
```

And that's all there is to do on the app side.


PhantomJS Module
================

For the app to be properly rendered, you will need to run the `angular-seo-server.js` with PhantomJS.
Make sure to disable caching:
```
$ phantomjs --disk-cache=no angular-seo-server.js [port] [URL prefix]
```

`URL prefix` is the URL that will be prepended to the path the crawlers will try to get.

Some examples:
```
$ phantomjs --disk-cache=no angular-seo-server.js 8888 http://localhost:8000/myapp
$ phantomjs --disk-cache=no angular-seo-server.js 8888 file:///path/to/index.html
```


Testing the setup
=================

Google and Bing replace `#!` (hashbang) with `?_escaped_fragment_=` so `htttp://localhost/app.html#!/route` becomes `htttp://localhost/app.html?_escaped_fragment_=/route`.

So say you app is running on `http://localhost:8000/index.html` (works with `file://` URLs too).
First, run PhantomJS:
```
$ phantomjs --disk-cache=no angular-seo-server.js 8888 http://localhost:8000/index.html
Listening on 8888...
Press Ctrl+C to stop.
```

Then try with cURL:
```
$ curl 'http://localhost:8888/?_escaped_fragment_=/route'
```

You should then have a complete, rendered HTML output.


Running in behind Nginx or Apache
==================================

If course you don't want regular users to see this, only crawlers.
To detect that, just look for an `_escaped_fragment_` in the query args.

Nginx(hasbang url):
```
server{
    listen 80;
    server_name example.com;

    if ($args ~ _escaped_fragment_) {
        proxy_pass http://127.0.0.1:8888;
        break;
    }
}

```
Nginx(pushState url):
The second condition won't work for non-pushState URLs since those bots that don't support the _escaped_fragment_ format will just
remove anythin that's after the hasbang from the the requested url.
```
server{
    listen 80;
    server_name example.com;
    if ($args ~ _escaped_fragment_) {
        proxy_pass http://127.0.0.1:8888;
        break;
    }
    if ($http_user_agent ~* (LinkedInBot|UnwidFetchor|voyager)){
        rewrite ^(.*)$ /?_escaped_fragment=$1 last;
        proxy_pass http://127.0.0.1:8888;
        break;
    }
}
```

Apache(untested):
```
<IfModule mod_rewrite.c>
  RewriteEngine On
  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

RewriteCond %{HTTP_USER_AGENT}   ^(LinkedInBot|UnwidFetchor|voyager).+
RewriteRule ^/[a-zA-Z0-9]+[/]?$ /?_escaped_fragment_=$1 [QSA,L]
ProxyPass / http://127.0.0.1:8888
ProxyPassReverse / http://127.0.0.1:8888
#Simulate _escaped_fragment_ query string for bots that don't do it on their

  # Rewrite everything else to index.html to allow pushState deep linking
  RewriteRule ^/[a-zA-Z0-9]+[/]?$ /index.html [QSA,L]
</IfModule>
```

Upstart script for auto-start & respawn:
$sudo vi /etc/init/phantomjs.conf
```
description "phantomjs"

start on runlevel [2345]
stop on runlevel [!2345]

console log
setuid tomigo
setgid tomigo
respawn

script
  exec phantomjs --disk-cache=no --ignore-ssl-errors=yes /opt/path/to/angular-seo-server.js 8888 https://example.com/$
end script

```

And then just:
```
$phantomjs start
```
and you're on!

For development enviorments\staging(remote, local), just run the command with nohup or setsid:
```
$setsid phantomjs --disk-cache=no /opt/path/to/angular-seo-server.js 8888 http://127.0.0.1
```

```
$nohup phantomjs --disk-cache=no /opt/path/to/angular-seo-server.js 8888 http://127.0.0.1
```

Differenct is that nohup outputs to ~/nohup.out while running in the background, and setsid run in the current terminal session, and
when it's closed outputs to /dev/null
[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/3a55c16a191c4c8222beddcf429c2608 "githalytics.com")](http://githalytics.com/steeve/angular-seo)
