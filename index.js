window.onload = () => {
    barcode();
}


const barcode = () => {
	const liveStreamConfig = {
			inputStream: {
				type : "LiveStream",
				constraints: {
					width: {min: 640},
					height: {min: 480},
					aspectRatio: {min: 1, max: 100},
					facingMode: "environment" // or "user" for the front camera
				}
			},
			locator: {
				patchSize: "medium",
				halfSample: true
			},
			numOfWorkers: (navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4),
			decoder: {
				"readers":[
					{"format":"ean_reader","config":{}}
				]
			},
			locate: true
		};
	
    const fileConfig = Object.assign(liveStreamConfig,{inputStream: {size: 800}})
    
    document.getElementById('modalBtn').addEventListener('click', () => {
        Quagga.init(
			liveStreamConfig, 
			function(err) {
				if (err) {
					Quagga.stop();
					return;
				}
				Quagga.start();
			}
		);
    });
	
	Quagga.onProcessed(result => {
		const drawingCtx = Quagga.canvas.ctx.overlay,
			drawingCanvas = Quagga.canvas.dom.overlay;
 
		if (result) {
			if (result.boxes) {
				drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
				result.boxes.filter(box => {
					return box !== result.box;
				}).forEach(box => {
					Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
				});
			}
 
			if (result.box) {
				Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
			}
 
			if (result.codeResult && result.codeResult.code) {
				Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
			}
		}
	});
	
	Quagga.onDetected(result => {	
		if (result.codeResult.code){
            document.getElementById('scanner_input').value = result.codeResult.code;
			Quagga.stop();	
			setTimeout(() => { document.querySelector('[data-dismiss="modal"]').click() }, 1000);			
		}
	});
    
    Array.from(document.getElementsByClassName('close-modal')).forEach(element => {
        element.addEventListener('click', () => {
            if (Quagga){
                Quagga.stop();	
            }
        })
    });
}