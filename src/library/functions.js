const MyFunctions = {
  install(app) {
      app.config.globalProperties.$function = {
        test(){
          console.log('hello');
          return
        },
  
      };
  }
};

export default MyFunctions;
