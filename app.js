 const moby_response = document.querySelector("#response");
 const icon = document.querySelector("#myimage");
 const aboutInfo = document.querySelector("#about");
 let token = undefined;

 function close_app() {
     console.log("Close app");
     moby.miniapp.close("close");
 }

 function pop_app() {
     console.log("Pop App");
     moby.miniapp.pop(false, "pop");
 }

 function get_apps() {
     console.log("Get installed apps");
     moby_response.innerText = "";

     moby.miniapp.get_installed_apps()
         .then(rv => {
             console.log("done");
             token = rv;
             moby_response.innerText = JSON.stringify(rv);
         })
         .catch(error => {
             console.log("ooops");
             moby_response.innerText = error.description;
         });
 }


 function share_link() {
     console.log("share link");

     moby.share.link('http://google.com')
         .then(rv => {
             console.log("done");
             moby_response.innerText = JSON.stringify(rv);
         })
         .catch(error => {
             console.log("ooops");
             moby_response.innerText = error;
         });
 }

 function share_text() {
     console.log("share text");

     moby.share.text('this is text to share')
         .then(rv => {
             console.log("done");
             moby_response.innerText = JSON.stringify(rv);
         })
         .catch(error => {
             console.log("ooops");
             moby_response.innerText = error;
         });
 }

 function get_firebase_token() {
     console.log("get_firebase_token");

     moby.firebase.get_token()
         .then(rv => {
             console.log("done");
             token = rv;
             moby_response.innerText = JSON.stringify(rv);
         })
         .catch(error => {
             console.log("ooops");
             moby_response.innerText = error;
         });
 }

 function get_miniapp_info() {
     console.log("get_miniapp_info");

     moby.info.miniapp()
         .then(rv => {
             console.log("done");
             moby_response.innerText = JSON.stringify(rv);
         })
         .catch(error => {
             console.log("ooops");
             moby_response.innerText = error;
         });
 }

 function get_mobile_info() {
     console.log("get_mobile_info");

     moby.info.app()
         .then(rv => {
             console.log("done");
             moby_response.innerText = JSON.stringify(rv);
         })
         .catch(error => {
             console.log("ooops");
             moby_response.innerText = error;
         });
 }

 function scan_qr() {
     console.log("scan_qr");

     moby.camera.scan_qr()
         .then(rv => {
             console.log("done");
             moby_response.innerText = JSON.stringify(rv);
         })
         .catch(error => {
             console.log("ooops");
             moby_response.innerText = error;
         });
 }

 function scan_card() {
     console.log("scan_card");

     moby.camera.scan_emv()
         .then(rv => {
             console.log("done");
             moby_response.innerText = JSON.stringify(rv);
         })
         .catch(error => {
             console.log("ooops");
             moby_response.innerText = error;
         });
 }

 function get_geo() {
     console.log("get_geo");

     moby.geo.get_position()
         .then(rv => {
             console.log("done");
             moby_response.innerText = JSON.stringify(rv);
         })
         .catch(error => {
             console.log("ooops");
             moby_response.innerText = error;
         });
 }

 async function show_icon() {
     console.log("Show icon");

     const miniapp = await moby.info.miniapp();

     moby.miniapp.get_app_icon(miniapp.id, 'menu')
         .then(rv => {
             console.log("done");
             var b64encoded = btoa(String.fromCharCode.apply(null, rv));
             var datapng = "data:image/png;base64," + b64encoded;
             icon.src = datapng;
         })
         .catch(error => {
             console.log("ooops");
             moby_response.innerText = error;
         });
 }

 async function open_external_miniapp() {
     console.log("open_external_miniapp");

     moby.miniapp.open_url("https://landingpage3.bubbleapps.io", "hello from boot")
         .then(rv => {
             console.log("done");
             moby_response.innerText = JSON.stringify(rv);
         })
         .catch(error => {
             console.log("ooops");
             moby_response.innerText = error;
         });
 }

 async function show_external_miniapp() {
     console.log("show_external_miniapp");

     moby.miniapp.show_url("https://landingpage3.bubbleapps.io", "hello from boot")
         .then(rv => {
             console.log("done");
             moby_response.innerText = JSON.stringify(rv);
         })
         .catch(error => {
             console.log("ooops");
             moby_response.innerText = error;
         });
 }

 function get_ntf() {
     console.log("get_ntf");
     const ntf = moby.jsbridge.get_notifications();
     moby_response.innerText = JSON.stringify(ntf);
 }

 async function about() {
     const os = moby.jsbridge.getOSType();
     if (os === 0 || os === 3) {
         aboutInfo.innerText = 'unknown miniapp';
         return;
     }

     //  get_ntf();

     const miniapp = await moby.info.miniapp();
     aboutInfo.innerText = (miniapp.name + ' v' + miniapp.version + '(id: ' + miniapp.id + ')');
 }

 about();