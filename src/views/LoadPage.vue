<template>
    <ion-page style="display: flex; justify-content: center; align-items: center;">
      <ion-spinner name="circles"></ion-spinner>
    </ion-page>

</template>

<script>
import { IonPage, IonSpinner } from '@ionic/vue';
import { Network } from '@capacitor/network';

export default {
  components: { IonPage, IonSpinner },
  async created(){
    const user = await this.$storage.getItem('session-user');
    const appVersion = '1.2.5';

    const net = await Network.getStatus();
        if(user){
          this.$router.push('dashboard');
        }else{
          this.$router.push('login');
        }
    // if(net.connectionType != 'none'){
    //   const res = await this.$api.getappconfig();
    //   console.log('Current Ver: ' + appVersion + ' | Latest Ver: ' + res.version);
    //   if (res.version != appVersion) {
    //     this.$router.push('update');
    //   }else{
    //     if(user){
    //       this.$router.push('dashboard');
    //     }else{
    //       this.$router.push('login');
    //     }
    //   }
    // }else{
    //   if(user){
    //     this.$router.push('dashboard');
    //   }else{
    //     this.$router.push('login');
    //   }
    // }
  }
}
</script>

<style>
ion-spinner {
    width: 60px;
    height: 60px;
  }
</style>