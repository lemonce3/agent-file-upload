const {utils, window: agentWindow, frame} = require('@lemonce3/agent-core/src');
const pmc = require('@lemonce3/pmc/src');

const isTop = window.top === window.self;
let state = initState();

function initState() {
	return {
		isUpload: false, target: null
	};
}

if (utils.isIE8) {
	document.attachEvent('onclick', changeUploadState);
} else {
	document.addEventListener('click', changeUploadState, true);
}

function changeUploadState(event) {
	const targetObj = event.target || event.srcElement;
	const {tagName, type} = targetObj;

	if (tagName === 'INPUT' && type === 'file') {
		event.preventDefault ? event.preventDefault() : event.returnValue = false;

		state.isUpload = true;
		state.target = target;

		if (!isTop) {
			pmc.request(top, 'file.upload.start');
		}
	}
}

pmc.on('file.upload.start', function (data, source) {
	if (!isTop || state.isUpload) {
		return;
	}

	state.isUpload = true;
	state.iframe = source;

	if (frame.testing) {
		// window.open('http://www.baidu.com', '_blank');
	}
});

pmc.on('file.upload.end', function (data, source) {
	if (isTop) {
		return;
	}

	resolveUpload(state.target, 'change');
});

agentWindow.program('file.upload', function () {
	if (!state.isUpload) {
		return;
	}

	if (isTop) {
		resolveUpload(state.target, 'change');
	} else {
		pmc.request(state.iframe, 'file.upload.end');
	}
});

function resolveUpload(element, eventName) {
	if (utils.isIE8) {
		element.fireEvent(`on${eventName}`);
	} else {
		element.dispatchEvent('事件对象');
	}

	state = initState();
}