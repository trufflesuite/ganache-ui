export default class CancellationToken {
  noop = () => void 0;
  constructor() {
    this.isActive = true;
  this.canceller =  { cancel: this.noop };
  }
  
  register(canceller){
    this.canceller = {cancel: () => {canceller.cancelled = true}};
  }
  
  getCanceller(){
    const canceller = {cancelled: false};
    this.register(canceller);
    return canceller;
  }

  isCancelled(){
    return !!this.canceller.cancelled;
  }

  cancel(){
    this.canceller.cancel();
  }
}
