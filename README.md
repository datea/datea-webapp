#Datea Web client

Angularjs based webapp for Datea. 

Datea is a corwdsourcing and civic engagement platform to create and visualize citizen reports (dateos) in maps, picture galleries, timelines and charts. It's mail goal is to allow citizens to share and visualize useful information for any purpose. It's flexibel, hashtag based structure allows anyone to create a map, timeline or gallery just by creating a report (dateo) using a hashtag. Furthermore, report iniciatives can be created by organizations such as NGOs, local governments and activists, which allow them to campaign for certain issues in order to obtain useful information from citizens (dateros).

If you are interested in using or contributing to this project, or want to know a litle bit more about us or the plattform, please feel free to contact us at contacto@datea.pe or via gitter (datea-gitter channel). For special a deployment or new feature, we also provide commercial support.

This repo is specifically for the Web App, current technologies are listed below:

* angularJS
* yeoman
* bower
* grunt
* bootstrap
* less
* leaflet

#Coding Style

* Smart Tabs - http://www.emacswiki.org/SmartTabs
* Comma first
Please reffer to the editorconfig dotfile for further information

##Installation

1. Make sure you got grunt and bower installed: npm install -g grunt bower
2. Install everything: npm install && bower install
3. To use datea's oauth configuration (own installation of http://oauth.io), replace "https://oauth.io" and "https://oauth.io/api" in app/bower_components/oauth-js/dist/oauth.js with "https://datea.io:57" and "https://datea.io:57/api" respectively.
4. to start developing run: grunt server

Compile with: grunt build

For any other issues, don't hessitate to contact us.

##License

GNU AFFERO PUBLIC LICENSE, see attached LICENSE file for details

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

