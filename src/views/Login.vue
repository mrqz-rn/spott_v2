<template>
    <ion-page class="backdrop">
      <IonLabel style="color: white; font-size: 13px;" class="pa-2"> Version: 1.2 </IonLabel>
        <div id="container" class="pa-6" style="margin-top: -10%">
          <div>
            <img style="height: 15vh; margin: auto;" src="/icon.png"/>
            <IonCardTitle class="pb-5" style="color: white; font-weight: 600; padding: 4vh">STERLING PAPER GROUP ONLINE TIME TRACKER</IonCardTitle>
            <IonInput v-model="logindata.username" 
              label="Username" fill="outline"  label-placement="stacked" 
              placeholder="Enter Username" style="text-align: left !important" 
              class="pb-3 custom">
            </IonInput>
            <IonInput v-model="logindata.password" type="password" label="Password" fill="outline" 
              placeholder="Enter Password" label-placement="stacked" 
              style="text-align: left !important" class="custom">
              <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
            </IonInput>
            <IonButton  @click="login()" class="mt-4" expand="full" shape="round" size="large">LOG IN</IonButton>
          </div>
        </div>
    </ion-page>
  </template>



<script>
import { 
  IonPage, IonContent, IonHeader, IonButton, IonToolbar,
  IonCard, IonCardTitle, IonCardContent, IonCardHeader, IonCardSubtitle,
  IonChip, IonIcon, IonAvatar, IonImg, IonThumbnail,
  IonMenu, IonMenuButton, IonMenuToggle, IonSplitPane, IonTitle, IonLabel,
  IonModal, IonBackdrop, IonPopover, IonLoading, IonProgressBar,
  IonInput, IonTextarea,  IonItem, IonInputPasswordToggle, loadingController, alertController
   
} from '@ionic/vue';
import { getPlatforms } from '@ionic/vue';
import MD5 from 'md5';
import { Device } from '@capacitor/device';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { Camera } from '@capacitor/camera';


export default {
  components: {
    IonPage, IonContent, IonHeader, IonButton, IonToolbar,
    IonCard, IonCardTitle, IonCardContent, IonCardHeader, IonCardSubtitle,
    IonChip, IonIcon, IonAvatar, IonImg, IonThumbnail,
    IonMenu, IonMenuButton, IonMenuToggle, IonSplitPane, IonTitle, IonLabel,
    IonModal, IonBackdrop, IonPopover, IonLoading, IonProgressBar,
    IonInput, IonTextarea, IonItem, IonInputPasswordToggle ,loadingController 
    
  },
    data(){
        return{
          logindata: {
            username: '',
            password: '',
          },
          device: {
            model: '',
            identifier: '',
            os: ''
          },
          location: {
            latitude: 0,
            longitude: 0
          },
          loc: '',
          settings: {},
          isonWeb: false,
        }
    },
    async created(){
      this.checkperms()
      const info = await Device.getId();
      const deviceInfo = await Device.getInfo();
      if(!['android', 'ios'].includes(deviceInfo.platform)){
        this.isonWeb = true
      }
      
      this.device.os = getPlatforms().includes('android') ? 'android' : 'ios';
      this.device.model = deviceInfo.model;
      this.device.identifier = info.identifier;
      const user = await this.$storage.getItem('session-user');
      if(this.isonWeb){
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log(position.coords.latitude, position.coords.longitude);
            // this.showAlert({header: 'Warning!', message: JSON.stringify(position)});
          },
          (error) => {
            console.error('Geolocation error:', error.message);
            switch(error.code) {
              case error.PERMISSION_DENIED:
                this.showAlert({header: 'Warning!', message: 'User denied the request for Geolocation'});
                break;
              case error.POSITION_UNAVAILABLE:
                this.showAlert({header: 'Warning!', message: 'Location information is unavailable'});
                break;
              case error.TIMEOUT:
                this.showAlert({header: 'Warning!', message: 'The request to get user location timed out'});
                break;
              case error.UNKNOWN_ERROR:
                this.showAlert({header: 'Warning!', message: 'An unknown error occurred'});
                break;
            }
          },
          { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
        );
      }else{
        try{
          const data = await Geolocation.getCurrentPosition({
            enableHighAccuracy: false,  
            timeout: 2500,            
            maximumAge: Infinity
          });
        if(!data){
          // this.showAlert({header: 'Warning!', message: 'Please turn on your device location or ensure you have an internet connection.'});
          this.showAlert({header: 'Warning!', message: JSON.stringify(data)});
        }
        }catch(err){
          // this.showAlert({header: 'Warning!', message: 'Please turn on your device location or ensure you have an internet connection.'});
          this.showAlert({header: 'Warning!', message: JSON.stringify(err)});
        }
      }
      // this.checkperms()
    },
    methods: {
      async checkperms(){
        
        const loc = await Geolocation.checkPermissions();
        if(loc.location == 'prompt' || loc.location == 'denied' || loc.location == 'prompt-with-rationale'){
          if(!this.isonWeb){
            await Geolocation.requestPermissions()
          }
        }
        const cam = await Camera.checkPermissions()
        if(cam.camera == 'prompt' || cam.camera == 'denied' || cam.camera == 'prompt-with-rationale'){
          if(!this.isonWeb){
            await Camera.requestPermissions()
          }
        }
      },
      async login(){
        const loading = await loadingController.create({ message: 'Please Wait a moment...', translucent: true });
        await loading.present();

        // try{
        // const data = await Geolocation.getCurrentPosition({
        //     enableHighAccuracy: false,  
        //     timeout: 2500,            
        //     maximumAge: Infinity
        //   });
        //   if(!data){
        //     // this.showAlert({header: 'Warning!', message: 'Please turn on your device location or ensure you have an internet connection.'});
        //     await loading.dismiss();
        //     this.showAlert({header: 'Warning!', message: JSON.stringify(data)});
        //     return
        //   }
        // }catch(err){
        //   // this.showAlert({header: 'Warning!', message: 'Please turn on your device location or ensure you have an internet connection.'});
        //   this.showAlert({header: 'Warning!', message: JSON.stringify(err)});
        //   await loading.dismiss();
        //   return  
        // }

        let valid = null;
        valid = await this.validateSettings()
        if(valid == null || valid != true){
          await loading.dismiss();
          return
        }
        if(this.logindata.username == '' || this.logindata.password == ''){
          await loading.dismiss();
          return this.showAlert({header: 'Warning!', message: 'Please enter username and password.'})
        }
        let platform = `${this.device.model}=>${this.device.identifier}`;
        // let platform = 'SM-G955U=>074d8861-04bf-46de-8fff-0c5caae12784';
        let data = {
          username: this.logindata.username,
          password: MD5(this.logindata.password),
          model: platform
        }
        try {
          this.$api.login(data).then( async (response) => {
          if(response.status == true){
            this.$storage.setItem('app-config', (response.appconfig));
            this.$storage.setItem('session-userinfo', (response.userinfo));
            this.$storage.setItem('session-user', (response.user));
            const pp = await this.$api.getpayperiod(response.user)
            if(pp.status == true){
              this.$storage.setItem('session-payperiod', (pp.payperiod));
            }
         
            setTimeout(async () => {
              await loading.dismiss();
              this.$router.push('dashboard').then(() => { window.location.reload() });
            }, 1000);
           
          }else{

            if(response.status == false && response.userlogin == true){
            if(response.deviceRegistered == true){
              if(response.deviceValid == false){
                await loading.dismiss();
                return this.showAlert({header: 'Alert', message: 'Device is already registered to another user'})
              }
            }else{
              await loading.dismiss();
              await this.registerDevice()
            }
          }else{
            await loading.dismiss();
            if(response.status == null && response.userlogin == null){
              return this.showAlert({header: 'Warning!', message: 'An error occured. Please try again.'})
            }else{
              return this.showAlert({header: 'Warning!', message: 'Invalid username or password.'})
            }
          }
          }
          
        })
        } catch (error) {
          await loading.dismiss();
          return this.showAlert({header: 'Warning!', message: error})
        }
        
      },
      async registerDevice(){
        const alert = await alertController.create({
          header: 'Confirm',
          message: 'Device not registered. Do you want to register it into your account?',
          buttons: [ 
            { text: 'No', role: 'cancel', handler: () => { console.log('Alert canceled') } },
            { text: 'Yes', role: 'confirm', handler: () => { this.register() } },
        ],
        });
        await alert.present();
      },
      async register(){
        let data = {
          username: this.logindata.username,
          model: `${this.device.model}=>${this.device.identifier}`
        }
        const response = await this.$api.register(data);
        console.log(response);
        if(response.status == true){
          this.showAlert({header: 'Success!', message: 'Device registered successfully. Please login to continue.'})
        }
        return response.status
      },
      async validateSettings(){
        const network = await Network.getStatus();
        if(network.connectionType == 'none' ){
          console.log('Network status: ', network);
          return this.showAlert({header: 'Warning!', message: 'Please check your network settings.'})
        }
        
        if(this.isonWeb == false){
          const loc = await Geolocation.checkPermissions();
          if(loc.location != 'granted'){
            console.log("Location status: ", loc.location);
            return this.showAlert({header: 'Warning!', message: 'Please enable location services.'})
          }
        }
      

        const timezone = String(new Date()).substr(25, 8);
        if(timezone != 'GMT+0800'){
          console.log('Timezone: ', timezone);
          return this.showAlert({header: 'Warning!', message: 'Please set your timezone to GMT+0800.'})
        }
        return true
      },
      async showAlert(data){
        const alert = await alertController.create({
          header: data.header,
          message: data.message,
          buttons: ['Okay'],
        });
        await alert.present();
      },
      async showLoader(){
        const loading = await loadingController.create({
          message: 'Dismissing after 3 seconds...',
          duration: 3000,
        });
        await loading.present();
      }
    }
}
</script>
<style scoped>
.backdrop{
  background: rgb(0,18,64);
  background: linear-gradient(326deg, rgba(0,18,64,1) 0%, rgba(4,15,46,1) 43%, rgba(3,18,68,1) 74%, rgba(4,37,97,1) 100%);  
}
ion-button {
    --background: #f05454;
    --background-hover: #8d1a1a;
    --background-activated: #8d1a1a;
    --background-focused: #8d1a1a;

    --color: rgb(255, 255, 255);

    --border-radius: 50px;
    /* --border-color: #000; */
    /* --border-style: solid; */
    /* --border-width: 1px; */

    --box-shadow: 0 2px 6px 0 rgb(0, 0, 0, 0.25);

    --ripple-color: #8d1a1a;

    --padding-top: 10px;
    --padding-bottom: 10px;
  }
  ion-input.custom {
    --color: #fff !important;
    --placeholder-color: #ddd !important;
    --placeholder-opacity: 0.8 !important;

  }

  ion-input.custom.ios .input-bottom .helper-text,
  ion-input.custom.ios .input-bottom .counter,
  ion-input.custom.md .input-bottom .helper-text,
  ion-input.custom.md .input-bottom .counter {
    color: red;
  }
  ion-label{
    --color: rgb(255, 255, 255) !important;
  }
  ion-label.black{
    --color: rgb(0, 0, 0) !important;
  }
  ion-label.white{
    --color: rgb(255, 255, 255) !important;
  }
</style>