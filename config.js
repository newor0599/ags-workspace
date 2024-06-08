import brightness from './backlight.js';
const audio = await Service.import('audio')
const time = Variable("", { 
    poll: [1000,'date "+%H:%M"']
})

const clockWidget = (/** @type {number} */ monitor) => Widget.Window({
    monitor,
    name: `Clock ${monitor}`,
    class_name: "clock",
    layer: "background",
    anchor: ["bottom","right"],
    child: Widget.Box({
	children: [
	    Widget.Label({
		hpack:'center',
		label: time.bind(),
		class_name: "time clock",
	    }),
	]
    })
})

const calendarWidget = (/** @type {number} */ monitor) => Widget.Window({
    monitor,
    name: `Calander ${monitor}`,
    class_name: "calendar",
    layer: "background",
    anchor: ['top','left'],
    child: Widget.Box({
	vertical:true,
	children:[
	    Widget.Calendar({}),
	    Widget.Button({
		child: Widget.Label("Date"),
	    })
	],
    }),
})

const VolumeSlider = () => Widget.Box({
    children:[ 
	Widget.Label({ 
	    className: "volumeValue",
	    label: "Undetected",
	    setup: self => {
		audio.speaker.connect("changed",() => {
		    let vol = audio.speaker.volume*100
		    if (vol > 100){
			self.label = Math.round(vol).toString()
		    } else if(vol > 50){
			self.label = " "
		    } else if(vol > 0){
			self.label = ""
		    } else{
			self.label = " "
		    }
		})
	    }
	}),
	Widget.Slider({
	    hexpand: true,
	    drawValue: false,
	    value: audio.speaker.bind('volume'),
	    onChange: ({ value }) => audio.speaker.volume = value,
	}),
    ]
})

// Volume widget
let timeoutVol
let volumeChanged = 0
var showVol = Variable(false)
audio.speaker.connect("changed",() => {
    volumeChanged++
    if (volumeChanged % 4 == 0){
	volumeChanged = 0
	clearTimeout(timeoutVol)
	showVol.setValue(true)
	timeoutVol = setTimeout(() => {
	    showVol.setValue(false)
	}, 1500);
    }
})
const volumePopup = (monitor = 0) => Widget.Window({
    monitor,
    layer:"top",
    keymode: 'none',
    name: `volumePopup ${monitor}`,
    anchor: ["bottom"],
    class_name: "volume",
    child: Widget.Box({
	vertical:true,
	children: [
	    Widget.Revealer({
		revealChild: showVol.bind(),
		transitionDuration:500,
		transition: "slide_up",
		child: VolumeSlider(),
	    })
	]
    }),
})

App.config({
    style: "./style.css",
    windows: [calendarWidget(0),clockWidget(0),volumePopup(0)],
})
