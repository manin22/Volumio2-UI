class PluginController {
  constructor($rootScope, $stateParams, socketService, modalService, mockService) {
    'ngInject';
    this.socketService = socketService;
    this.$stateParams = $stateParams;
    this.modalService = modalService;
    this.mockService = mockService;
    this.init();
  }

  saveSection(section) {
    console.info(section);
    let saveObj = section.onSave;
    if (section.saveButton.data) {
      let data = {};
      section.saveButton.data.forEach((value) => {
        let item = section.content.filter((item) => {
          return item.id === value;
        })[0];
        if (item) {
          data[value] = item.value;
        }
      });
      saveObj.data = data;
    }
    console.log(saveObj);
    if (section.onSave.askForConfirm) {
      let modalPromise = this.modalService.openModal(
        'ModalConfirmController',
        'app/components/modals/modal-confirm.html',
        section.onSave.askForConfirm);
      modalPromise.then((yes) => {
        delete saveObj.askForConfirm;
        this.socketService.emit('callMethod', saveObj);
      }, () => {});
    } else {
      this.socketService.emit('callMethod', saveObj);
    }
  }

  saveButton(item) {
    console.info(item);
    if (item.onClick.askForConfirm) {
      let modalPromise = this.modalService.openModal(
        'ModalConfirmController',
        'app/components/modals/modal-confirm.html',
        item.onClick.askForConfirm);
      modalPromise.then((yes) => {
        if (item.onClick.type === 'emit') {
          console.log('emit', item.onClick.message, item.onClick.data);
          this.socketService.emit(item.onClick.message, item.onClick.data);
        } else {
          this.socketService.emit('callMethod', item.onClick);
        }
      }, () => {});
    } else {
      if (item.onClick.type === 'emit') {
        console.log('emit', item.onClick.message, item.onClick.data);
        this.socketService.emit(item.onClick.message, item.onClick.data);
      } else {
        this.socketService.emit('callMethod', item.onClick);
      }
    }
  }

  init() {
    this.registerListner();
    this.initService();
  }

  registerListner() {
    this.socketService.on('pushUiConfig', (data) => {
      //data.sections.unshift({coreSection: 'wifi'});
      //data.sections.unshift({coreSection: 'my-music'});
      //data.sections.unshift({coreSection: 'network-drives'});
      console.log('pushUiConfig', data);
      this.pluginObj = data;
      //this.pluginObj = this.mockService.get('getSettings');
    });
  }

  initService() {
    this.socketService.emit('getUiConfig',
        {'page': this.$stateParams.pluginName.replace('-', '/')});
  }
}

export default PluginController;
