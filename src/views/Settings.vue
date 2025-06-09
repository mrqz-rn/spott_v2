<template>
    <ion-page>
        <ion-content class="pa-4">
            <ion-card class=" pb-3 ma-3" color="dark"  style="border-radius: 25px; padding: 3vh;">
              <div class="d-flex pb-2">
                  <ion-icon :icon="camera" size="large" style="scale: 1.2 !important; width: 65px;" class="pa-2"/>
                  <ion-label class="px-3 align-self-center" style="font-size: 3vh; font-weight: 600;">ImageCapture: {{ user_info.imageCapture_desc }}</ion-label>
                </div>
                <div class="d-flex pb-2">
                  <ion-icon :icon="location" size="large" style="scale: 1.2 !important; width:65px;" class="pa-2"/>
                  <ion-label class="px-2 align-self-center" style="font-size: 3vh; font-weight: 600;">GeoFencing: {{ user_info.geoFenceMode_desc }}</ion-label>
                </div>
               
                <div >
                  <ion-button @click="startCalibrate()" v-if="calibrate.length < 3" :disabled="user_info.calibrateStatus == '1' && user_info.isReachedMaxLocation == '0' ? false : true"
                  expand="full" class="main pt-2" shape="round" size="large" 
                  style="min-height: 2vh !important; height: 8vh; color: white; font-weight: 600; font-size: 3vh;">CALIBRATE</ion-button>
                  <ion-button @click="uploadLocation()" v-else
                  expand="full" class="main pt-2" shape="round" size="large" style="color: white; font-weight: 600;">UPLOAD LOCATION</ion-button>
                </div>
                <h4 class="d-flex justify-center pt-1" style="font-size: 2.2vh;">Max Location: {{ user_info.noOfLocations }}</h4>
              </ion-card>
            <h4 class="px-4" style="font-size: 2.7vh;">Configured Locations({{ Locations.length }}):</h4>
            <ion-list  class="mx-3" style="height: 40vh; overflow-y: auto;">
              <ion-item v-for="(loc, key) in Locations" :key="key"> 
                <div class="d-block">
                  <ion-label style="font-size: 2.4vh;">{{ address[key] ? address[key] : 'Searching Address....' }}</ion-label>
                  <div class="d-flex ">
                    <h5 class="pe-5" style="font-size: 2vh;">Lat: {{ loc.lat }}</h5>
                    <h5 style="font-size: 2vh;">Long: {{ loc.long }}</h5>
                  </div>
                </div>
              </ion-item>
          
            </ion-list>
            <div style="position: absolute; bottom: 0px; left: 0px; transform: translate(0%, 0%); width:100%;">
              <ion-button @click="logout()" expand="full" class="main pa-3 pb-4" shape="round"  style="color: white; font-weight: 600;">Log Out</ion-button>
            </div>
            
        </ion-content>
    </ion-page>
</template>

<script>
import { IonPage, IonContent,IonList, IonItem, IonLabel, IonButton, IonIcon,IonCard,
  alertController,loadingController } from '@ionic/vue';
import { camera, location, book} from 'ionicons/icons';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';


export default {
  components: { IonPage,IonContent,IonList, IonItem, IonLabel, IonButton, IonIcon,IonCard,alertController,loadingController },
  data(){
    return{
      camera, location,book ,
      calibrate: [],
      busy: false,
      app_config:{},
      session_user:{},
      user_info:{},
      allowedLocations:[],
      address: [],
    }
  },
  async created(){
    this.session_user = await this.$storage.getItem('session-user');
    this.user_info = await this.$storage.getItem('session-userinfo');
    this.app_config = await this.$storage.getItem('app-config');
    console.log(this.user_info)
    this.allowedLocations = this.user_info.allowedLocations ? this.user_info.allowedLocations.split(",") : [];
    setInterval(async () => {
      await this.checkPageStatus()
    }, 1000);
    await this.fetchAddress()
  },
  computed: {
    Locations(){
      let locs = this.allowedLocations;
      let allowed = [];
      locs.forEach(e => {
        let str = e.split(":");
        allowed.push({'long': str[0],'lat': str[1],'radius':str[2],});
      })
      return allowed;
    },
  },
  methods: {
async fetchAddress(){
  this.address = []
  let locs = this.Locations
  for(let e of locs){
    let data = {
      latitude: e.lat,
      longitude: e.long
    }
    const res = await this.$api.addressapi(data)
    this.address.push(res.display_name)
  }
  this.$forceUpdate()
},
    async startCalibrate(){
        const alert = await alertController.create({
          header: 'Confirm',
          message: 'The app will require you to have an internet connection and location access. Would you like to proceed?',
          buttons: [ 
            { text: 'No', role: 'cancel', handler: () => { console.log('Alert canceled') } },
            { text: 'Yes', role: 'confirm', handler: () => { this.getCalibrate() } },
        ],
        });
        await alert.present();
      },
    async getCalibrate(){
      const network = await Network.getStatus();
      const loading = await loadingController.create({ message: 'Please Wait a moment...', translucent: true });
      await loading.present();

      if(this.user_info.isReachedMaxLocation == '1'){
        await loading.dismiss();
        return this.showAlert({header: 'Warning', message: 'You have reached maximum allowed locations.', buttons: ['Okay'], })
      }


      if(network.connectionType == 'none'){
        await loading.dismiss();
        return this.showAlert({header: 'Warning!', message: 'Please check your network settings.'})
      }
     
      let loc = {}
      try {
        loc = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,  
          timeout: 5000,            
          maximumAge: Infinity
        });
      } catch (error) {
        await loading.dismiss();
        this.showAlert({header: 'Warning', message: 'Please enable device location', buttons: ['Okay'], })
        return
      }

      const coords = async () => {
        const coords = await this.getLocation();
        return coords
      }
      do {
        this.calibrate.push(await coords());
      } while (this.calibrate.length < 8);

      this.$forceUpdate()
      await loading.dismiss();
      if(this.calibrate.length == 8){
        this.showAlert({header: 'Success', message: 'Location captured successfully. Please proceed to uploading', buttons: ['Okay'], })
      }

    },
    async getLocation(){
      let location_data = {
        status: false,
        coordinates: null,
        err: null
      }
      const loc = await Geolocation.checkPermissions();

      let data = {}
      if(loc.location != 'granted'){
        // await this.Geolocation.requestPermissions();
        location_data.status = false
        location_data.err = 1
        return location_data
      }
     
      data = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,  
        timeout: 5000,            
        maximumAge: Infinity
      });
      if(data){
        location_data.status = true
        location_data.coordinates = {
          latitude: data.coords.latitude,
          longitude: data.coords.longitude
        }
        return location_data
      }else{
        location_data.status = false
        location_data.err = 2
        return location_data
      }
    
     
    },

    async uploadLocation(){
      
      let long = 0;
      let lat = 0;

      // get mean of long and lat
      this.calibrate.forEach(e => {
        let coords = e.coordinates;
        long = long + parseFloat(coords.longitude);
        lat = lat + parseFloat(coords.latitude);
      });

      long = long/8;
      lat = lat/8;
      let data = {
        username: this.user_info.username,
        longitude: long,
        latitude: lat
      };

      let dup = false
      this.Locations.forEach(element => {
          if(element.lat == data.latitude.toFixed(4) && element.long == data.longitude.toFixed(4)){
            dup = true
          }
          
      });

      if(dup == true){
        this.showAlert({header: 'Warning', message: 'Location already exists', buttons: ['Okay'], })
      }else{
        const res = await this.$api.uploadLocation(data);
        if(res.status == true){
          this.$storage.setItem('session-userinfo', (res.userinfo));
          this.user_info = res.userinfo;
          this.allowedLocations = this.user_info.allowedLocations.split(",");
          this.calibrate = [];
          this.$forceUpdate()
          this.showAlert({header: 'Success', message: 'Location uploaded successfully', buttons: ['Okay'], })
          this.$storage.setItem('newLoc', ({status: true}));
          setTimeout(() => {
            this.$router.go()
          }, 250);
        }else{
          this.showAlert({header: 'Warning', message: 'Something went wrong. Please try again', buttons: ['Okay'], })
        }
      }
      
      this.calibrate = [];
    },
    checkLocs(){

    },
    async logout(){
      const alert = await alertController.create({
        header: 'Confirm',
        message: 'Are you sure you want to logout?',
        buttons: [ 
          { text: 'No', role: 'cancel', handler: () => { console.log('Alert canceled') } },
          { text: 'Yes', role: 'confirm', handler: async  () => { 
            await this.$storage.clearStorage(); 
            await this.$storage.removeItem('session-userinfo');
            await this.$storage.removeItem('session-user');
            await this.$storage.removeItem('session-attlogs');
            
            setTimeout(() => {
              this.$router.push('login').then(() => { window.location.reload() });
            }, 250);
          } },
      ],
      });
      await alert.present();
    },
    async showAlert(data){
      const alert = await alertController.create({
        header: data.header,
        message: data.message,
        buttons: ['Okay'],
      });
      await alert.present();
    },
    async checkPageStatus(){
      let log = await this.$storage.getItem('logout');
      if(this.$route.name == 'login'){
        await this.$storage.setItem('logout', ({status: true}));
        await this.$storage.setItem('relogin', ({status: true}));
      }
      if(log != null && this.$route.name == 'settings'){
        this.session_user = await this.$storage.getItem('session-user');
        this.user_info = await this.$storage.getItem('session-userinfo');
        this.app_config = await this.$storage.getItem('app-config');
        this.allowedLocations = this.user_info.allowedLocations ? this.user_info.allowedLocations.split(",") : [];
        await this.$storage.removeItem('logout');
        this.$forceUpdate()

      }
    },
  }

}
</script>