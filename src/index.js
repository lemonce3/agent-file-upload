const {utils, window: agentWindow, frame} = require('@lemonce3/agent-core/src');
const pmc = require('@lemonce3/pmc/src');

const isTop = window.top === window.self;
const hasFile = !!window.File;

const state = {
	isUpload: false, target: null
};

const timer = setInterval(function () {
	if (frame.id === null) {
		return;
	}
	
	clearInterval(timer);

		if(frame.testing) {
			if (utils.isIE8) {
				document.attachEvent('onclick', startUpload);
			} else {
				document.addEventListener('click', startUpload, true);
			}
		}
}, 100);

function changeState(isUpload = false, target = null, frame = undefined) {
	state.isUpload = isUpload;
	state.target = target;
	state.frame = frame;
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

pmc.on('file.upload.start', function (data, source) {
	if (state.isUpload) {
		return false;
	}

	changeState(true, null, source);

	return true;
});

pmc.on('file.upload.end', function (data, source) {
	resolveUpload();
});

agentWindow.program('file.upload', function (data) {
	if (!state.isUpload) {
		// 可以强制改变状态吗？
		return false;
	}

	const {file} = data;

	if (state.target !== null) {
		resolveUpload(state.target, file);
	} else {
		pmc.request(state.frame, 'file.upload.end', {
			file: file
		});
	}
});

function resolveUpload(element, file) {
	if (inForm(element)) {
		const input = document.createElement('input');

		input.setAttribute('type', 'hidden');
		input.setAttribute('name', `lc-${element.name}`);

		element.parentNode.appendChild(input);
	}

	if (hasFile) {
	}

	changeState();
}

function inForm(element) {
	if (!element.parentNode.tagName) {
		return false;
	}

	if (element.parentNode.tagName === 'FORM') {
		return true;
	} else {
		return inForm(element.parentNode);
	}
}