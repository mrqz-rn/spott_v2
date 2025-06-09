<template>
  <IonPage id="main-content">
    <ion-toast 
      :class="snackbar.type" style="scale: 0.98;"
      position="top" :is-open="snackbar.status"  @didDismiss="snackbar.status = false"
      :message="snackbar.message"
    ></ion-toast>
    <ion-content class="ion-padding pa-2"  v-if="webCapturing == false"> 
     
        <div class="pa-3 pt-6">
            <IonCard class="px-4 pt-4 pb-1 mb-2" color="dark" style="border-radius: 25px;" >
                <ion-card-title class="date pt-2">SPOTT</ion-card-title>
                <ion-card-content class="justify-center pa-0" >
                  <div class="d-grid pt-2">
                    <IonLabel class="time white-text">{{ display.time }}</IonLabel>
                    <IonLabel class="date white-text">{{ display.date }}</IonLabel>
                  </div>
                  <div class="pt-8 ">
                    <ion-button @click="validate()" class="main mb-4" :disabled="!btnvalid"
                    expand="full" size="large" shape="round" style="font-weight: 600;"
                    > {{ trxmodetype == '0' ? 'Time In' : 'Time Out' }}</ion-button>
                  </div>
                </ion-card-content>
            </IonCard> 

            <div v-if="busy == true" style="display: flex; justify-content: center; align-items: center;" :style="body(0.48)">
              <ion-spinner class="load" name="circles"></ion-spinner>
            </div>
            
            <ion-list v-else style="height: 45vh;">
                <div class="d-block" >
                  <div v-for="(data, key) in display_attlogs" :key="key" class="d-flex justify-space-between pa-2" style="border-bottom: 1px solid #3d3d3d;">
                  <ion-label class="align-self-center px-2" style="font-weight: 600; max-width: 105px;"> {{ data.trxIN.trxdate }}</ion-label>
                  <div class="d-block pe-4"  >
                    <div class="d-flex" style="width: max-content !important;" :class="data.trxIN.upload_status == '1' ? '' : 'not_uploaded'">
                      <ion-label style=" font-weight: 600; width: 50px;">In:</ion-label>
                      <ion-label style=" width: 95px;">{{ data.trxIN.trxtime ? formattedTime(data.trxIN.trxtime) : '---' }}</ion-label>
                    </div>
                    <div class="d-flex" style="width: max-content !important;" :class="data.trxOUT.upload_status == '1' ? '' : 'not_uploaded'">
                      <ion-label style="font-weight: 600; width: 50px;">Out:</ion-label>
                      <ion-label style=" width: 95px;">{{ data.trxOUT.trxtime ? formattedTime(data.trxOUT.trxtime) : '---' }}</ion-label>
                    </div>
                  </div>
                  <div class="py-1 align-self-center">
                    <ion-button @click="viewLogs(data)" id="open-dialog" expand="block" shape="round" size="small" dark>
                      <ion-icon class="px-2" :icon="eye" size="default" color="white" />
                    </ion-button>
                  </div>
                  </div>
                </div>
            </ion-list>
            
        </div>
        <ion-button class="open-custom-dialog" id="open-custom-dialog" expand="block" shape="round" style="display: none;"/>
        <ion-modal id="example-modal" ref="modal" trigger="open-custom-dialog" :can-dismiss="canDismiss" >
          <div class="wrapper" >
            <h2 class="d-flex justify-center pt-2">Attendance Log</h2>
            <div class="pa-2 px-4 d-block" >
              <h3>Time In</h3>
              <ion-label style="" class="px-2">
                <span class="pe-3">Date: {{ viewLog.trxIN.trxdate }}</span>
                <span class="pe-3">Time: {{ formattedTime(viewLog.trxIN.trxtime) }}</span>
              </ion-label>
              <p style="" class="px-2">Location:  {{ viewLog.trxIN.latitude + ' : ' + viewLog.trxIN.longitude }} </p>
              <h3>Time Out</h3>
              <ion-label style="" class="px-2">
                <span class="pe-3">Date: {{ viewLog.trxOUT.trxdate || '---' }}</span>
                <span class="pe-3">Time: {{ viewLog.trxOUT.trxtime ? formattedTime(viewLog.trxOUT.trxtime) : '---'  }}</span>
              </ion-label>
              <p style="" class="px-2">Location:  {{ viewLog.trxOUT.latitude + ' : ' + viewLog.trxOUT.longitude }} </p>
              <div class="d-flex justify-space-between pt-2">
                <h3>Remarks</h3>
                <p style=" color: #0068d1; text-decoration: underline" @click="inputrem = !inputrem">Input / Edit</p>
              </div>
              <div v-if="inputrem == true">
                <IonInput v-model="remarks"
                class="pt-3" label="Remarks" fill="outline"  label-placement="stacked" 
                placeholder="(Optional)">
                </IonInput>
                <ion-button class="pt-3" expand="full" shape="" @click="saveRemarks()">Save</ion-button> 
              </div>
              <p v-else style="" class="px-2" >{{ viewLog.trxIN.remark || '---' }}  </p>
              <ion-button class="pt-3" expand="full" color="medium" @click="closeModal()">Close</ion-button>
            </div>
          
          </div>
        </ion-modal>
    </ion-content>
    <div v-if="webCapturing == true" style="position: absolute; top: 50%; transform: translateY(-50%)">
      <img v-if="image" style="object-fit: contain;"
      :src="image" alt="Captured Image" :style="isonWeb ? ' width: 100vw !important; max-height: 60vh' : 'width: 100vw !important;'"/>
      <video v-else ref="video" autoplay :style="isonWeb ? 'width: 100vw !important; max-height: 60vh' : 'width: 100vw !important;'"></video>
      <div v-if="image" class="d-flex justify-center px-10 pt-4" style="gap: 5vw;">
        <ion-button shape="round" @click="retakeImage" class="" color="medium">
          <ion-icon slot="icon-only" :icon="arrowUndo" class="ma-2"></ion-icon>
        </ion-button>
        <ion-button shape="round" @click="saveCapture" class="" color="success" dark>
          <ion-icon slot="icon-only" :icon="save" class="ma-2"></ion-icon>
        </ion-button>
        <ion-button style="opacity: 0;"></ion-button>

      </div>
      <div v-else class="d-flex justify-center px-10 pt-4" style="gap: 5vw;">
        <ion-button shape="round" @click="stopCamera()" class="" color="medium">
          <ion-icon slot="icon-only" :icon="close" class="ma-2"></ion-icon>
        </ion-button>
        <ion-button shape="round" @click="captureImage" class="">
          <ion-icon slot="icon-only" :icon="camera" class="ma-2"></ion-icon>
        </ion-button>
        <ion-button style="opacity: 0;"></ion-button>
      </div>
      <canvas ref="canvas" width="640" height="480" style="display: none;"></canvas>
    </div>
    
  </IonPage>
</template>

<script>


import { 
  IonPage, IonContent, IonHeader, IonButton, IonToolbar, IonList, IonModal, modalController , IonToast,
  IonCard, IonCardTitle, IonCardContent, IonCardHeader, IonCardSubtitle, IonChip, IonSpinner, IonInput,
  IonMenu, IonMenuButton, IonTitle, IonLabel, IonItem, IonButtons, alertController ,loadingController, IonIcon
   
} from '@ionic/vue';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { getPlatforms } from '@ionic/vue';
import { Device } from '@capacitor/device';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { eye, book, camera, save, close, arrowUndo } from 'ionicons/icons';


export default {
  components: {
    IonPage, IonContent, IonHeader, IonButton, IonToolbar, IonItem,IonList,IonModal,modalController,IonToast,
    IonButtons,IonMenu,IonTitle,IonMenuButton,IonLabel, IonChip, alertController, loadingController,
    IonCard, IonCardTitle, IonCardContent, IonCardHeader, IonCardSubtitle,IonSpinner, IonInput, IonIcon
  },
  data(){
    return{
      eye, book,camera, save,close,arrowUndo,
      screen: {
        height: window.screen.height,
        width: window.screen.width
      },
      display: {
        time: '00:00:00 AM',
        date: ''
      },
      currentDate: '00:00:00 AM',
      currentTime: '',
      attlogs: [],
      trxmodetype: 0,
      device: {
        model: '',
        identifier: '',
        os: '',
      },
      remarks: '',
      inputrem: false,
      app_config:{},
      session_user:{},
      user_info:{},
      payperiod: {},
      snackbar: {
        status: false,
        message: '',
        type: 'info'
      },
      busy: false,
      dtrbusy: false,
      uploadOffline: false,
      checking: false,
      viewLog: {},
      canDismiss: false,
      btnvalid: false,
      offilne: false,
      count: 0,
      location: {
        status: false,
        lat: 0,
        long: 0,
        message: '',
        timestamp: new Date().toLocaleTimeString()
      },
      requireNet: false,
      settings: false,

      isonWeb: false,
      stream: null,
      image: null,
      webCapturing: false
    }
  },
  beforeCreate(){
    setInterval(() => {
      this.getTimeDate();
    }, 1000);
  },
  async created(){
   
    this.busy = true
    const info = await Device.getId();
    const deviceInfo = await Device.getInfo();
    
    this.device.os = getPlatforms().includes('android') ? 'android' : 'ios';
    this.device.model = deviceInfo.model;
    this.device.identifier = info.identifier;

   
    this.session_user = await this.$storage.getItem('session-user');
    this.user_info = await this.$storage.getItem('session-userinfo');
    this.app_config = await this.$storage.getItem('app-config');
    const net = await Network.getStatus()
    this.checkLogin(this.session_user)
    if(net.connectionType != 'none'){
      this.getPayperiod()
      
      try{
        const data = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,  
          timeout: 2500,            
          maximumAge: Infinity
        });
      }catch(err){
        this.setSnackBar(true, 'Location is disabled...', 'danger');
      }
    }else{
      this.payperiod = await this.$storage.getItem('session-payperiod')
    }
    if(await this.$storage.getItem('session-attlogs') != null){
      this.attlogs = await this.$storage.getItem('session-attlogs')
      if(this.attlogs.findIndex(e => e == null) != -1){
        this.attlogs = this.attlogs.filter(e => e != null)
      }
    }else{
      await this.getAttlogs()
    }

    
    this.busy = false
    setTimeout(() => {
      this.count++
    }, 2000);

  },
  computed:{
    display_attlogs(){
      const attlogs = this.attlogs;
      let result = [];
      let setTrx = {}
      if(attlogs.length == 0) return result
      attlogs.forEach((transaction, id) => {
        if (transaction.trxmode == "0") {  // IN
          setTrx.trxIN = transaction
        } else if (transaction.trxmode == "1" && setTrx.trxIN) {  // OUT
          setTrx.trxOUT = transaction
          result.push(setTrx);
          setTrx = {}
        }
      });
      if(attlogs[attlogs.length - 1].trxmode == "0" && setTrx.trxIN){
        setTrx.trxOUT = {
          trxmode: "1",
          trxdate: '',
          trxtime: '',
        }
        result.push(setTrx)
      }
      this.$forceUpdate()
      return result.reverse()
    },
    allowedLocations(){
        let loc =  this.user_info.allowedLocations ? this.user_info.allowedLocations.split(",") : [];
        let locs = [];
        loc.forEach(e => {
          let str = e.split(":");
          locs.push({'long': str[0],'lat': str[1],'radius':str[2]});
        })
        return locs;
      },
  },
  watch:{
    currentTime: {
      async handler(newValue) {
        let time = parseInt(newValue.substr(6,2))
        if((time % 3 == 0)){
          if(this.uploadOffline == false && this.checking == false){
            this.checking = true
            await this.checkOffline()
          }
        }
        if(time % 2 == 0){
          this.validateSettings()
        }
        
          
        
        
        let relogin = await this.$storage.getItem('relogin')
        if(relogin != null && this.$route.name == 'dashboard'){
          this.user_info = await this.$storage.getItem('session-userinfo')
          this.attlogs = await this.$storage.getItem('session-attlogs')
          await this.$storage.removeItem('relogin')
        }
        const newLoc = await this.$storage.getItem('newLoc')
        if(newLoc != null){
          this.user_info = await this.$storage.getItem('session-userinfo')
          this.$storage.removeItem('newLoc')
        }
      
      }
    },
    attlogs: {
      handler(newValue) {
        let data = newValue[newValue.length - 1];
        if(data){
          this.trxmodetype = data.trxmode == '0' ? '1' : '0';
        }else{
          this.trxmodetype = '0';
        }
        this.$forceUpdate()
      },
      deep: true, 
    },
    count: {
      async handler(newValue) {
        if(this.settings == false || this.dtrbusy == true){
          setTimeout(() => {
            this.count += 1
            this.$forceUpdate()
          }, 1500);
        }else{
          if(this.requireNet == true && this.location.status == true){
            const net = await Network.getStatus();
            if(net.connectionType != 'none'){
              this.requireNet = false
            }
          }
          try {
            if(this.location.status == false && this.location.lat == 0 && this.location.long == 0){
              this.setSnackBar(true, 'Establishing  your location...', 'info')
            }
            
            const data = await Geolocation.getCurrentPosition({
              enableHighAccuracy: false,  
              timeout: 2500,            
              maximumAge: Infinity
            });

            if(data.coords){
              if(this.location.lat == 0 && this.location.long == 0 && this.location.status == false){
                this.setSnackBar(true, 'Location established successfully...', 'success')
              }
              this.location.status = true
              this.location.lat = data.coords.latitude
              this.location.long = data.coords.longitude
              this.location.message = 'Location: ' + data.coords.latitude + ', ' + data.coords.longitude
              this.location.timestamp = new Date()
              this.btnvalid = true
              setTimeout(() => {
                this.setSnackBar(false, '', '')
              }, 2000);
              setTimeout(() => {
                this.count += 1
                this.$forceUpdate()
              }, 2000);
            }else{
              this.location.status = false
              this.location.message = data.message
              this.location.lat = 0
              this.location.long = 0
              this.setSnackBar(true, data.message, 'danger')
              setTimeout(() => {
                this.count += 1
                this.$forceUpdate()
              }, 2000);
            }
          
          } catch (error) {
            this.location.status = false
            this.location.message = 'Error: ' + error
            this.location.lat = 0
            this.location.long = 0
            this.btnvalid = false
            this.requireNet = true
            this.setSnackBar(true, 'Location is disabled...', 'danger')
            setTimeout(() => {
              this.count += 1
              this.$forceUpdate()
            }, 2000);
          }
        }
        
      }
    },
  },
  methods:{
    async startCamera() {
      this.image = null
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.$refs.video.srcObject = this.stream;
      } catch (error) {
        console.error('Error accessing the camera:', error);
      }
    },
    retakeImage(){
      this.image = null
      if (this.stream) {
        const tracks = this.stream.getTracks();
        tracks.forEach(track => track.stop());
        // this.$refs.video.srcObject = null;
        this.stream = null;
      }
      this.startCamera()
      this.$forceUpdate()
    },
    captureImage() {
      if (this.$refs.video.srcObject) {
        const canvas = this.$refs.canvas;
        const context = canvas.getContext('2d');
        context.drawImage(this.$refs.video, 0, 0, canvas.width, canvas.height);
      
        this.image = canvas.toDataURL('image/png');

      }
    },
    saveCapture() {
      const event = new CustomEvent('imageCaptured');
      document.dispatchEvent(event);
      this.stopCamera()
      this.webCapturing = false
    },
    stopCamera() {
      if (this.stream) {
        const tracks = this.stream.getTracks();
        tracks.forEach(track => track.stop());
        // this.$refs.video.srcObject = null;
        this.stream = null;
        this.webCapturing = false
      }
    },
    async checkLogin(data){
      const net = await Network.getStatus();
      if(net.connectionType != 'none'){
        const res = await this.$api.checklogin(data);
        if(res.requireLogin == 1){
          console.log('require login')
          await this.$storage.clearStorage(); 
          await this.$storage.removeItem('session-userinfo');
          await this.$storage.removeItem('session-user');
          await this.$storage.removeItem('session-attlogs');
           
          setTimeout(() => {
              this.$router.push('login')
            }, 250);
          
        }
      }
    },
    async getAttlogs(){
      let data = {
        username: this.user_info.username,
        isLive: this.user_info.isLive,
        dateFrom: '',
        dateTo: ''

      }
      let result = await this.$api.getattlogs(data)
      if(result.status == true){
        await this.$storage.setItem('session-attlogs', (result.attlogs.reverse()));
      }
      this.attlogs = await this.$storage.getItem('session-attlogs')
      this.$forceUpdate()
    },
    async getPayperiod(){
      let data = {
        username: this.session_user.username,
      }
      const pp = await this.$api.getpayperiod(data)
      if(pp.status == true){
        await this.$storage.setItem('session-payperiod', (pp.payperiod));
        this.payperiod = pp.payperiod;
      }
    },
    async saveRemarks(){
      let data = this.viewLog.trxIN
      data.isLive = this.user_info.isLive;
      data.remark = this.remarks
      const net = await Network.getStatus();
      if(data.upload_status == '1'){
        if(net.connectionType == 'none'){
          this.showAlert({header: 'Error!', message: "Attlogs that your are trying to edit is already been saved online. This requires internet connection.", buttons: ['Okay']})
          return
        }

        try {
        const res = await this.$api.saveremark(data);
          if(res.status == true){
            let index = this.attlogs.findIndex(e => e.id === data.id)
            this.attlogs[index].remark = this.remarks
            this.$forceUpdate()
            this.$storage.setItem('session-attlogs', this.attlogs)
            this.closeModal()
            this.showAlert({header: 'Success!', message: 'Remark saved successfully', buttons: ['Okay']})

          }else{
            this.showAlert({header: 'Error!', message: "Can't save remark, please try again later", buttons: ['Okay']})
          }
        } catch (error) {
          this.showAlert({header: 'Error!', message: "Can't save remark, please try again later", buttons: ['Okay']})
        }
      }else{
        let index = this.attlogs.findIndex(e => e.id === data.id)
        this.attlogs[index].remark = this.remarks
        this.$forceUpdate()
        this.$storage.setItem('session-attlogs', this.attlogs)
        this.closeModal()
        this.showAlert({header: 'Success!', message: 'Remark saved successfully', buttons: ['Okay']})
      }

  
      
    },
    viewLogs(data){
      this.canDismiss = false
      this.viewLog = data
      this.remarks = data.trxIN.remark
      const button = document.getElementById('open-custom-dialog');
      if (button) {
        button.click();
      }
    },
    closeModal(){
      this.canDismiss = true
      this.$refs.modal.$el.dismiss();
      this.inputrem = false
      this.remarks = ''
     
    },
    removeattlogs(){
      this.$storage.removeItem('session-attlogs')
    },
    async validate(){
      const net = await Network.getStatus();
      if(net.connectionType == 'none'){
        const alert = await alertController.create({
          header: 'Confirm',
          message: 'Your device is currently offline. Do you want to proceed?',
          buttons: [ 
            { text: 'No', role: 'cancel', handler: () => { console.log('Alert canceled') } },
            { text: 'Yes', role: 'confirm', handler: () => { this.getDtr() } },
        ],
        });
        await alert.present();
      }else{
        this.getDtr();
      }
   
    },
    async getDtr(){
      this.dtrbusy = true;
      const loading = await loadingController.create({ message: 'Please Wait a moment...', translucent: true });
      await loading.present();
      const validtime = await this.validateTimeIn()
      if(validtime == false){
        this.dtrbusy = false;
        await loading.dismiss();
        return
      }
      
      let location = {}
      if(this.location.status == true){
        if(this.requireNet == true){
          this.dtrbusy = false;
          await loading.dismiss();
          return this.showAlert({header: 'Warning!', message: 'The app needs internet connection to establish your location', buttons: ['Okay']})
        }


          let time = new Date();
          let valid_timestamp = new Date().setSeconds(time.getSeconds() - 5);
          if(Math.abs(this.location.timestamp - valid_timestamp) <= 5000){
              console.log('Valid within 5 sec');
              location = {
                status: true,
                coordinates: {
                  longitude: this.location.long,
                  latitude: this.location.lat
                }
              }
          }else{
              console.log('Invalid not within 5 sec');
              const loc = await this.getLocation();
                if(loc.status == false){
                  this.dtrbusy = false;
                  await loading.dismiss();
                  if(loc.err == 1){
                    return this.showAlert({header: 'Warning!', message: 'Location denied. Please check your app permissions.'})
                  }else{
                    return this.showAlert({header: 'Warning!', message: 'Error fetching location. Please try again.'})
                  }
                }
                location = loc;
          }
      }
       
      let photo_data = null;
      // VALIDATE IF IN ALLOWED LOCATION or IF GEOFENCE IS ENABLED
      const valid_loc = await this.checkIfWithinLocation(location.coordinates.longitude,location.coordinates.latitude)
      if(valid_loc == false){
        this.dtrbusy = false;
        await loading.dismiss();
        if(this.allowedLocations.length == 0){
          return this.showAlert({header: 'Warning!', message: 'Please configure your location.'})
        }else{
          return this.showAlert({header: 'Warning!', message: 'You are not within the perimeter of your allowed locations.'})           
        }
      }else{
        // VALIDATE IMAGECAPTURE
        if(this.user_info.imageCapture == '1'){
          if(this.isonWeb == true){
            this.webCapturing = true;
            await new Promise(resolve => {
              const handler = () => {
                document.removeEventListener('imageCaptured', handler);
                resolve();
              };
              
              document.addEventListener('imageCaptured', handler);
              loading.dismiss();
              this.startCamera()
              console.log('Waiting for image captured');
              
            });
            console.log('Image captured');
            photo_data = {
              status: true,
              picture: this.image
            }
          }else{
            photo_data = await this.openCam()
            if(photo_data.status == false){
              this.dtrbusy = false;
              await loading.dismiss();
              return this.showAlert({header: 'Warning!', message: 'Image capture failed. Please try again.'})
            }
          }
        }
      }


      // SAVE DATA
      let data_log = {};
      data_log.id = this.generateUniqueId();
      data_log.trxdatedb = this.currentDate;
      data_log.username = this.user_info.username;
      data_log.trxdate = new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      data_log.trxtime = this.currentTime;
      data_log.trxmode = this.trxmodetype;
      data_log.timestamp = String(new Date());
      data_log.longitude = location.coordinates.longitude;
      data_log.latitude = location.coordinates.latitude;
      data_log.platform = `${this.device.model}=>${this.device.identifier}`,
      data_log.picture = photo_data != null ? photo_data.picture : '';
      // data_log.picture = this.test_image;
      data_log.remark = this.remarks;
      data_log.datetime = this.currentDate + " " + this.currentTime;
      data_log.FBTYPE = this.user_info.FBTYPE;
      data_log.FPLCCD = this.user_info.FPLCCD;
      data_log.PCCD = this.user_info.PCCD;
      data_log.FPID = this.user_info.FPID;
      data_log.isLive = this.user_info.isLive;
      data_log.withApproval = this.user_info.withApproval;
      await this.upload_data(data_log)
      await loading.dismiss();
      this.remarks = '';
      this.dtrbusy = false;
    },

    async upload_data(data){
      let data_log = data;
      const network = await Network.getStatus();
      if(network.connectionType == 'wifi' || network.connectionType == 'data' || network.connectionType == 'cellular' || network.connectionType == 'unknown'){
        data_log.upload_status = 0;
        data_log.uploaded_on = '0000-00-00 00:00:00';

        let response = await this.upload_log(data_log)
        if(response.status == true){
          data_log.upload_status = 1;
          data_log.uploaded_on = this.currentDate + " " + this.currentTime;
        }
        this.timelog(data_log)
        this.showAlert({header: 'Success!', message: 'Your DTR was uploaded successfully'})
      }else{
        data_log.upload_status = 0;
        data_log.uploaded_on = '0000-00-00 00:00:00';
        this.timelog(data_log)
        this.showAlert({header: 'Warning!', message: 'Your data will be save offline and will be uploaded once there is a connection!'})
      }
    },
    async upload_log(data){
      try {
        const response = await this.$api.saveattlogs(data);
        let result = {
          status: response.status,
          data: response.data,
          message: response.message ? response.message : ''
        }
        return result
      } catch (error) {
        console.log(error)
        let result = {
          status: false,
          message: error,
          data: data
        }
        return result
      }
     
    },
    async timelog(data){
      this.attlogs.push(data);
      await this.$storage.pushAttlogs(data)
      this.$forceUpdate()
    },

    async checkOffline(){
      const network = await Network.getStatus();
        let attlogs = this.attlogs.filter(e => e.upload_status == '0');
        if(network.connectionType == 'cellular' || network.connectionType == 'wifi' || network.connectionType == 'unknown'){
          if(attlogs.length > 0 && this.uploadOffline == false){
            this.uploadOffline = true
            await this.offlineUpload(attlogs)
          }
        }
        this.checking = false
    },
    async offlineUpload(data) {
    const loading = await loadingController.create({ message: 'Uploading offline logs...', translucent: true });
    await loading.present();

    // data.forEach(async (element)  => {
    //   element.isLive = this.user_info.isLive;
    //   const check = await this.$api.checktrx(element);
    //   if (check.status == true && check.data == '0') {
    //     const result = await this.upload_log(element);
    //     if (result.status == true && result.message == '') {
    //       element.upload_status = 1;
    //       await this.$storage.updateAttlogs(element);
    //     } else if (result.status == true && result.message == 'duplicate') {
    //       element.upload_status = 1;
    //       await this.$storage.updateAttlogs(element);
    //     }
    //     this.attlogs = await this.$storage.getItem('session-attlogs');
    //     this.$forceUpdate();
    //   } else if(check.data == '1'){
    //     element.upload_status = 1;
    //     this.$forceUpdate();
    //     await this.$storage.updateAttlogs(element);
    //   }
    // });

    // await Promise.all(
    //   data.map(async (element) => {
    //     element.isLive = this.user_info.isLive;
    //     const check = await this.$api.checktrx(element);

    //     if (check.status === true && check.data === '0') {
    //       const result = await this.upload_log(element);
    //       if (result.status === true && (result.message === '' || result.message === 'duplicate')) {
    //         element.upload_status = 1;
    //         await this.$storage.updateAttlogs(element);
    //       }
    //     } else if (check.data === '1') {
    //       element.upload_status = 1;
    //       await this.$storage.updateAttlogs(element);
    //     }
        
    //     return element;
    //   })
    // ).then(async () => {
    //   this.attlogs = await this.$storage.getItem('session-attlogs');
    //   this.$forceUpdate();
    // }).catch(error => {
    //   console.error('Error processing data:', error);
    // });




    for (const element of data) {
      element.isLive = this.user_info.isLive;
        const check = await this.$api.checktrx(element);

        if (check.status == true && check.data == '0') {
        try {
            let result = await this.upload_log(element);

            if (result.status == true && result.message == '') {
              element.upload_status = 1;
              await this.$storage.updateAttlogs(element);
            } else if (result.status == true && result.message == 'duplicate') {
              element.upload_status = 1;
              await this.$storage.updateAttlogs(element);
            }

            this.attlogs = await this.$storage.getItem('session-attlogs');
            this.$forceUpdate();
          } catch (error) {
            console.error('Error uploading element:', error);
          }
        }else if(check.data == '1'){
          element.upload_status = 1;
          await this.$storage.updateAttlogs(element);
        }
    }
    await this.$storage.removeItem('session-attlogs');
    
    await this.$storage.setItem('session-attlogs', this.attlogs);
    this.uploadOffline = false;
    await loading.dismiss();
  },

  async validateSettings(){
         const loc = await Geolocation.checkPermissions();
        if(loc.location != 'granted'){
          this.setSnackBar(true, 'Please allow location permission', 'danger')
          this.btnvalid = false
          this.settings = false
          this.$forceUpdate()
          return false
        }

        const timezone = String(new Date()).substr(25, 8);
        if(timezone != 'GMT+0800'){
          this.setSnackBar(true, 'Please set your timezone to GMT+0800', 'danger')
          this.btnvalid = false
          this.settings = false
          this.$forceUpdate()
          return false
        }

        this.settings = false
        this.settings = true
        this.$forceUpdate()
        return true
  },

    async openCam(){
      let data = {
        status: false,
        picture: ''
      }
      try {
        const capturedPhoto = await Camera.getPhoto({
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
          direction: CameraDirection.Front,
          // quality: 80
        });

        const response = await fetch(capturedPhoto.webPath);
        const blob = await response.blob();
        const compressedBlob = await this.compressImage(blob, 0.3);
        const base64String = await this.convertBlobToBase64(compressedBlob);
        data.picture = base64String
        data.status = true
      } catch (error) {
        data.status = false
        data.picture = error
      }

      return data
    },

  






    validateTimeIn() {
        let userinfo = this.user_info;
        let appconfig = this.app_config;
        let current = {
          hour: this.pad(new Date().getHours()),
          min: this.pad(new Date().getMinutes()),
        };
        let currentTime = new Date(`2024-01-01T${current.hour}:${current.min}`);
        
        let t1 = userinfo.TIME_IN.substring(0, 2);
        let t2 = userinfo.TIME_IN.substring(2, 4);
        let timeIN = new Date(`2024-01-01T${t1}:${t2}`);
        let allowedTime = new Date(timeIN);
        allowedTime.setHours(allowedTime.getHours() - parseInt(appconfig.timein_allowance));
        if (currentTime < allowedTime && this.trxmodetype == '0') {
          this.showAlert({header: 'Warning!', message: 'You can only Time-In ' + appconfig.timein_allowance + ' hour before your schedule!'});
          return false
        } else{
          return true
        }
      },


    async getLocation(){
      let location_data = {
        status: false,
        coordinates: null,
        err: null
      }

      if(this.isonWeb){
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log(position.coords.latitude, position.coords.longitude);
            location_data.status = true
            location_data.coordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          },
          (error) => {
            console.error('Geolocation error:', error.message);
            switch(error.code) {
              case error.PERMISSION_DENIED:
                location_data.status = false
                this.showAlert({header: 'Warning!', message: 'User denied the request for Geolocation'});
                break;
              case error.POSITION_UNAVAILABLE:
                location_data.status = false
                this.showAlert({header: 'Warning!', message: 'Location information is unavailable'});
                break;
              case error.TIMEOUT:
                location_data.status = false
                this.showAlert({header: 'Warning!', message: 'The request to get user location timed out'});
                break;
              case error.UNKNOWN_ERROR:
                location_data.status = false
                this.showAlert({header: 'Warning!', message: 'An unknown error occurred'});
                break;
            }
          },
          { timeout: 5000, enableHighAccuracy: false, maximumAge: Infinity }
        );
        return location_data
      }else{
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
      }
   
    
     
    },


    checkIfWithinLocation(long,lat){
      if(this.user_info.geoFenceMode == '0'){
        return true
      }else{
        let status = 0;

        this.allowedLocations.forEach(e => {
          if(this.computeDistance(e.lat,e.long,lat,long) <= parseFloat(e.radius)){
            status = status + 1;
          }
        });
        return status > 0 ? true : false;
      }
      },
    computeDistance(lat1,lon1,lat2,lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
      var dLon = this.deg2rad(lon2-lon1); 
      var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = (R * c) * 1000 ; // Distance in m
      
      return d;
      
    },
    deg2rad(deg) {
      return deg * (Math.PI/180)
    },
   
    setSnackBar(status, message, type){
      this.snackbar.status = status;
      this.snackbar.message = message;
      this.snackbar.type = type;
    },
    async showAlert(data){
      const alert = await alertController.create({
        header: data.header,
        message: data.message,
        buttons: ['Okay'],
      });
      await alert.present();
    },
    async compressImage(blob, quality) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;

          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((compressedBlob) => {
              resolve(compressedBlob);
            }, 'image/jpeg', quality);
          };
          img.onerror = (error) => { reject(error) };
        };
        reader.onerror = (error) => { reject(error) };
        reader.readAsDataURL(blob);
      });
    },
    convertBlobToBase64(blob) {
      return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => { resolve(reader.result) };
      reader.onerror = (error) => { reject(error) };
      reader.readAsDataURL(blob);
    });
    },  
    getTimeDate(){
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('en-GB', { hour12: false });
      this.currentDate = now.toLocaleDateString('en-CA');

      this.display.time = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.display.date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    },
    formattedTime(time) {
      let [hours, minutes, seconds] = time.split(':');
      let date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      date.setSeconds(seconds);

      return date.toLocaleTimeString(); 
    },
    generateUniqueId() {
      const now = new Date();
      const year = now.getFullYear();
      const month = ('0' + (now.getMonth() + 1)).slice(-2); // Months are zero based
      const day = ('0' + now.getDate()).slice(-2);
      const hours = ('0' + now.getHours()).slice(-2);
      const minutes = ('0' + now.getMinutes()).slice(-2);
      const seconds = ('0' + now.getSeconds()).slice(-2);
      const miliseconds = ('00' + now.getMilliseconds()).slice(-3);

      return `${year}${month}${day}${hours}${minutes}${seconds}${miliseconds}`;
    },
    body(data){
      return `height: ${this.screen.height * data}px;`;
    },
    pad(str){
      str = '00' + str;
      return str.slice(-2);
    },
  },


}
</script>

<style scoped>
.time{
  font-size: 6.2vh;
  font-weight: 600;
  color: black;
  text-align: center;
}

.date{
  font-size: 3vh;
  font-weight: 600;
  color: black;
  text-align: center;
}
ion-input.custom {
  --color: #fff !important;
  --placeholder-color: #ddd !important;
  --placeholder-opacity: 0.8 !important;

}
ion-modal#example-modal {
    --width: fit-content;
    --min-width: 250px;
    --height: fit-content;
    --border-radius: 6px;
    --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
  }

  ion-modal#example-modal h1 {
    margin: 20px 20px 10px 20px;
  }

  ion-modal#example-modal ion-icon {
    margin-right: 6px;

    width: 48px;
    height: 48px;

    padding: 4px 0;

    color: #aaaaaa;
  }

  ion-modal#example-modal .wrapper {
    margin-bottom: 10px;
    width: 90vw !important;
  }
</style>



<style>
ion-spinner.load{
    width: 50px;
    height: 50px;
  }
.customInput label .input-outline-container{
  /* background-color: red !important; */
  height: 40px !important;
}

.customInput label .native-wrapper{
  margin: 5px !important;
  flex-grow: 0 !important;
}
</style>
