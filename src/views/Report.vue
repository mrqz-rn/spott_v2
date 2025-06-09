<template>
    <IonPage>
      <ion-content class="ion-padding">
        <h2 class="px-4 pt-3" id="title">DTR ATTLOGS</h2>
        <div class="pa-4 pb-2 pt-3">

          <div class="d-flex" style="gap: 10px;">
            <ion-input v-model="displaydate.from"  :readonly="true" @click="pickDate(1)"
            label="Date From" fill="outline" size="small" label-placement="stacked" ></ion-input>
            <ion-input v-model="displaydate.to" :readonly="true" @click="pickDate(2)"
            label="Date To" fill="outline"  label-placement="stacked" ></ion-input>
            <div class="align-self-center">
              <ion-button shape="round" class="main" @click="getAttlogsrpt()">View</ion-button>
            </div>
          </div>
          
        </div>
        <div class="pa-2" style=" max-height: 70vh; overflow-y: auto; overflow-x: hidden">
            <table class="" width="100%">
              <thead>
                <tr style="">
                  <th>Name</th>
                  <th>In/Out</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody >
                <tr v-for="(data, key) in attlogs" :key="key">
                  <td class="text-center">{{ data.EMPNAME }}</td>
                  <td class="text-center  ">
                     {{ formattedTime(data.trxtime) }}
                   
                    <b :style="'color: ' + (data.trxmode == '1' ? '#12358c' : '#128c33')">{{ (data.trxmode == '0' ? 'IN' : 'OUT') }}</b>
                  </td>
                  <td class="text-center">
                    <ion-button size="small" @click="viewMore(data)">
                      <ion-icon class="px-2" :icon="eye" size="default" color="white" />
                    </ion-button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="busy == true" class="d-flex justify-center" style="height: 50vh;">
              <ion-spinner name="circles" class="align-self-center" ></ion-spinner>
            </div>
            <div v-if="attlength == 0" class="d-flex justify-center pa-3">
              <ion-label><b>No Records Found</b></ion-label>
            </div>
          </div>
      </ion-content>
      <ion-button id="open-details" expand="block" style="display: none;">details</ion-button>
      <ion-modal id="example-modal" ref="modal2" trigger="open-details" >
        <div class="wrapper"  >
          <h2 class="d-flex justify-center pt-2" style="width: 85vw;" >Attendance Details</h2>
          <div class="pa-3">
            <div class="d-block" style="overflow-x: hidden;">
              <p><b>Employee No: </b>{{ viewlog.username }}</p>
              <p><b>Name: </b>{{ viewlog.EMPNAME }}</p>
              <p><b>Date/Time: </b>{{ viewlog.trxdate + ' ' + viewlog.trxtime }}</p>
              <p><b>Attendance Type: </b>{{ viewlog.trxmode == '0' ? 'IN' : 'OUT' }}</p>
              <p><b>Location: </b></p>
              <!-- <p>{{ viewlog.latitude + ', ' + viewlog.longitude }}</p> -->
              <p style="width: 80vw;" >{{ address }}</p>
              <p><b>Remarks: </b></p>
              <p>{{ viewlog.remark || '---' }}</p>
            </div>
          
            <div class="d-flex justify-center py-3">
              <ion-img 
              style="width: 65vw"
              :src="viewlog.picture" alt="No Image"
            ></ion-img>
            </div>
            <ion-button expand="full" color="medium" @click="closeModal()">close</ion-button>
          </div>
          
        </div>
      </ion-modal>
      <ion-button id="open-date" expand="block" style="display: none;">Date modal</ion-button>
      <ion-modal id="example-modal" ref="modal" trigger="open-date"  :can-dismiss="datepick.canDismiss">
        <div class="wrapper">
          <h2 class="d-flex justify-center pt-2"></h2>
          <ion-datetime v-model="datepick.model" presentation="date" 
          
          :min="datepick.type == 1 ? `` : `${new Date(modeldate.from).toLocaleDateString('en-CA')}T00:00:00`"
          :max="`${new Date().toLocaleDateString('en-CA')}T23:59:59`"/>
          <div class="pa-3">
            <ion-button expand="full" color="medium" @click="confirmPick()">Confirm</ion-button>
          </div>
        </div>
      </ion-modal>

    </IonPage>
</template>

<script>
import { IonPage, IonContent, IonButton, IonInput, IonModal, IonDatetime, IonIcon, IonImg, IonSpinner,
  IonLabel,
  alertController } from '@ionic/vue';
import { eye, } from 'ionicons/icons';
import { Network } from '@capacitor/network';
import { Device } from '@capacitor/device';

export default {
  components: { IonPage, IonContent, IonButton, IonInput ,IonModal, IonDatetime, IonIcon,  IonImg, IonSpinner, 
    IonLabel,
    alertController },
  data(){
    return{
      eye,
      displaydate:{
        from: '00/00/0000',
        to: '00/00/0000'
      },
      modeldate: {
        from: '',
        to: ''
      },
      datepick: {
        canDismiss: true,
        type: 1,
        model: new Date()
      },
      user_info: {},
      attlogs: [],
      attlength: null,
      busy: false,
      viewlog: {},
      address: '',
      isonWeb: false,
    }
  },
  async  created(){
    const deviceInfo = await Device.getInfo();
    if(!['android', 'ios'].includes(deviceInfo.platform)){
      this.isonWeb = true
    }
    
    this.datepick.model = this.dateModel(new Date())
    this.user_info = await this.$storage.getItem('session-userinfo')
    console.log(this.user_info)
    const pp = await this.$storage.getItem('session-payperiod')
    if(pp != null){
      this.displaydate.from = this.formatDate(pp.DATEFROM)
      this.displaydate.to = this.formatDate(pp.DATETO)
      this.modeldate.from = pp.DATEFROM
      this.modeldate.to = pp.DATETO
      await this.getAttlogsrpt()
    }else{
      this.modeldate.from = new Date().toLocaleDateString('en-CA');
      this.modeldate.to =  new Date().toLocaleDateString('en-CA');
      this.displaydate.from = this.formatDate(new Date().toLocaleDateString('en-CA'))
      this.displaydate.to =  this.formatDate(new Date().toLocaleDateString('en-CA'))
    }


  },
  methods: {
    async getAttlogsrpt() {
      this.attlength = null
      const network = await Network.getStatus();
      if(network.connectionType == 'none' ){
        return this.showAlert({header: 'Warning!', message: 'Please check your internet status'})
      }

      if(this.modeldate.from == '' || this.modeldate.to == ''){
        return this.showAlert({header: 'Warning!', message: 'Please select date range'})
      }

      this.attlogs = []
      this.busy = true
      let data = {
        dept: this.user_info.departmentAccess,
        comp: this.user_info.companyAccess,
        isLive: this.user_info.isLive,
        dateFrom: this.modeldate.from != '' ? this.modeldate.from : '',
        dateTo: this.modeldate.to != '' ? this.modeldate.to : '',
      }
      try {
        const response = await this.$api.getattlogrpt(data);
        if(response.status == true){
          this.attlogs = response.dtrinfo
        }else{
          this.attlogs = []
        }
      } catch (error) {
        this.showAlert({header: 'Error!', message: 'Something went wrong. Please try again.'})
      }
      
      this.busy = false
      this.attlength = this.attlogs.length
      // const unique = [...new Set(this.attlogs.map(item => item.username))];
    },
    formAttlogs(data){
      let attlogs = data
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

    async getAddress(lat,long){
      let data  = {
        latitude: lat,
        longitude: long
      }
      const response = await this.$api.addressapi(data)
      console.log(response)
      return response
    },













    closeModal(){
      this.$refs.modal2.$el.dismiss();
      this.$forceUpdate()
    },
    pickDate(data){
      this.datepick.canDismiss = false
      if(data == 1){
        this.datepick.type = 1
      }else if(data == 2){
        this.datepick.type = 2
      }

      const datebtn = document.getElementById('open-date');
      if (datebtn) {
        datebtn.click();
      }
    },
    confirmPick(){
      this.datepick.canDismiss = true
      if(this.datepick.type == 1){
        this.displaydate.from = this.formatDate(this.datepick.model)
        this.modeldate.from = this.dateFormat(this.datepick.model)
      }else{
        this.displaydate.to = this.formatDate(this.datepick.model)
        this.modeldate.to = this.dateFormat(this.datepick.model)
      }
      this.$refs.modal.$el.dismiss();
    },
    
    async viewMore(data){
      this.address = ''
     

      this.viewlog = data
      const modalbtn = document.getElementById('open-details');
      if (modalbtn) {
        modalbtn.click();
      }
      const res = await this.getAddress(data.latitude,data.longitude)
      this.address = res.display_name;
    },
    dateModel(date) {
      const pad = (number) => (number < 10 ? '0' + number : number);

      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1); // Months are zero-based
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    },
    formatDate(date){
      let year = date.substring(0, 4);
      let month = date.substring(5, 7)
      let day = date.substring(8, 10)
      // console.log(`${month}/${day}/${year}`)
      return `${month}/${day}/${year}`
    },
    dateFormat(date){
      let year = date.substring(0, 4);
      let month = date.substring(5, 7)
      let day = date.substring(8, 10)
      // console.log(`${month}/${day}/${year}`)
      return `${year}-${month}-${day}`
    },
    async showAlert(data){
      const alert = await alertController.create({
        header: data.header,
        message: data.message,
        buttons: ['Okay'],
      });
      await alert.present();
    },
    formattedTime(time) {
      let [hours, minutes, seconds] = time.split(':');
      let date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      // date.setSeconds(seconds);

      return date.toLocaleTimeString('en-GB', { hour12: true, hour: '2-digit', minute: '2-digit',  }); 
    },
  }
}
</script>

<style scoped>
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
  }
  ion-modal#example-modal .wrapper div{
    max-height: 70vh;
    overflow-y: scroll;
  }
  table, th, td {
    border: 1px solid black;
    border-collapse: collapse;
  }

  table thead tr {
    background-color: #2E7D32; color: white;
  }
  table thead tr th{
    padding: 4px;
  }
  table tbody tr td{
    padding: 4px;
  }
  .name{
    width: 45vw;
    white-space: break-spaces;
  }
  ion-spinner {
    width: 45px;
    height: 45px;
  }
</style>
