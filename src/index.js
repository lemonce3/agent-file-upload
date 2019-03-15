const {utils, window: agentWindow} = require('@lemonce3/agent-core/src');
const pmc = require('@lemonce3/pmc/src');

const isTop = window.top === window.self;
const isTesting = true;
const state = {
	isUpload: false, target: null
};

let opener = null;

if (utils.isIE8) {
	document.attachEvent('onclick', startUpload);
} else {
	document.addEventListener('click', startUpload, true);
}

function startUpload(event) {
	const targetObj = event.target || event.srcElement;
	const {tagName, type} = targetObj;

	if (tagName === 'INPUT' && type === 'file') {
		event.preventDefault ? event.preventDefault() : event.returnValue = false;

		if (state.isUpload) {
			return;
		}

		if (isTop) {
			changeState(true, targetObj);
		} else {
			pmc.request(top, 'file.upload.start').then((isUpload) => {
				if (isUpload) {
					changeState(isUpload, targetObj);
				}
			});
		}
	}
}

function changeState(isUpload = false, target = null, frame = undefined) {
	state.isUpload = isUpload;
	state.target = target;
	state.frame = frame;
}

pmc.on('file.upload.start', function (data, source) {
	if (state.isUpload) {
		return false;
	}

	changeState(true, null, source);

	return true;
});

pmc.on('file.upload.end', function (data, source) {
	resolveUpload(state.target, 'change');
});

agentWindow.program('file.upload', function () {
	if (!state.isUpload) {
		return;
	}

	// 改变文件上传状态

	if (state.target !== null) {
		resolveUpload(state.target, 'change');
	} else {
		pmc.request(state.frame, 'file.upload.end');
	}
});

function resolveUpload(element, eventName) {
	if (utils.isIE8) {
		element.fireEvent(`on${eventName}`);
	} else {
		element.dispatchEvent('事件对象');
	}

	changeState();
}