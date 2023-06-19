/**
 * This class is used to detect the long press on messages and fire the callback function
 */
export class ClickAndHold{
	constructor(target, timeOut, callback){
		this.target = target; //the target element
		this.callback = callback; //the callback function
		this.isHeld = false; //is the hold active
		this.activeHoldTimeoutId = null;  //the timeout id
		this.timeOut = timeOut; //the time out for the hold [in ms] eg: if timeOut = 1000 then the hold will be active for 1 second
		//start event listeners
		this.startTime = null;
		//event added to detect if the user is moving the finger or mouse
		try{
			this.target.addEventListener('touchstart', this._onHoldStart.bind(this));
			this.target.addEventListener('touchmove', this._onHoldMove.bind(this));
			this.target.addEventListener('touchend', this._onHoldEnd.bind(this));
		}
		catch(e){
			console.log(e);
		}


	}
	//this function is called when the user starts to hold the finger or mouse
	_onHoldStart(evt){
		this.isHeld = true;
		this.startTime = Date.now();
		//evt.preventDefault();
		//console.log('hold started for target: ', this.target, ' with timeout: ', this.timeOut, ' and callback: ', this.callback);
		this.activeHoldTimeoutId = setTimeout(() => {
			if (this.isHeld) {
				this.callback(evt);
			}
		}, this.timeOut);
	}
	//this function is called when the user is moving the finger or mouse
	_onHoldMove(){
		this.isHeld = false;
	}
	//this function is called when the user releases the finger or mouse
	_onHoldEnd(evt){
		this.isHeld = false;
		const timeElapsed = Date.now() - this.startTime;
		if (timeElapsed < this.timeOut){
			clearTimeout(this.activeHoldTimeoutId);
			return;
		}
		evt.preventDefault();
		//console.log('hold ended for target: ', this.target, ' with timeout: ', this.timeOut, ' and callback: ', this.callback);
		clearTimeout(this.activeHoldTimeoutId);
	}
	//a static function to use the class utility without creating an instance
	static applyTo(target, timeOut, callback){
		try{
			new ClickAndHold(target, timeOut, callback);
		}
		catch(e){
			console.log(e);
		}
	}
}