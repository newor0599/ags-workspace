import brightness from './backlight.js';
const audio = await Service.import('audio')
const hyprland = await Service.import('hyprland')
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
let oldVolume
var showVol = Variable(false)
audio.speaker.connect("changed",() => {
    volumeChanged++
    if (audio.speaker.bind('volume') != oldVolume){
	oldVolume = audio.speaker.bind('volume')
	if (volumeChanged % 4 == 0){
	    volumeChanged = 0
	    clearTimeout(timeoutVol)
	    showVol.setValue(true)
	    timeoutVol = setTimeout(() => {
		showVol.setValue(false)
	    }, 1500);

	}
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

function workspaceDot(workspaceNumber) {
    return Widget.Box({
	children:[
	    Widget.EventBox({
		vexpand:true,
		hexpand:true,
		on_primary_click: () => {
		    Utils.exec(`hyprctl dispatch workspace ${workspaceNumber.toString()}`)
		}
	    })
	],
	class_name: "spaceDot",
	setup: self => {
	    hyprland.connect("event",() => {
		let currentFocus = hyprland.getMonitor(0)?.activeWorkspace.id
		if (currentFocus == workspaceNumber){
		    self.toggleClassName('focus',true)
		}else{
		    self.toggleClassName('focus',false)
		}
	    })
	},
    })
}


const workspaceInd = (monitor = 0) => Widget.Window({
    monitor,
    layer:"top",
    name: `workspace Indicator ${monitor}`,
    anchor: ["top"],
    class_name: "workspace",
    child: Widget.Box({
	vertical:true,
	children: [
	    Widget.Revealer({
		transitionDuration: 500,
		transition: "slide_down",
		child:Widget.Box({
		    children: [
			workspaceDot(1),
			workspaceDot(2),
			workspaceDot(3),
			workspaceDot(4),
			workspaceDot(5),
			workspaceDot(6),
			workspaceDot(7),
			workspaceDot(8),
			workspaceDot(9),
			workspaceDot(10),
		    ]
		}),
		setup: self => {
		    let oldFocus
		    let currentFocus
		    let timeOut
		    hyprland.connect("event",()=>{
			currentFocus = hyprland.getMonitor(monitor)?.activeWorkspace.id
			if (currentFocus != oldFocus){
			    oldFocus = currentFocus
			    clearTimeout(timeOut)
			    self.reveal_child = true
			    timeOut = setTimeout(() => {
				self.reveal_child = false
			    },1000)
			}
		    })
		}
	    })
	]
    }),
})

// Bluetooth


App.config({
    style: "./style.css",
    windows: [calendarWidget(0),clockWidget(0),volumePopup(0),workspaceInd(0)],
})
