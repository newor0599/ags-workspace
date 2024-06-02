const audio = await Service.import('audio')

const time = Variable("", {
    poll: [1000, 'date "+%H:%M"']
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

const VolumeSlider = () => Widget.Slider({
    hexpand: true,
    drawValue: false,
    value: audio.speaker.bind('volume'),
    onChange: ({ value }) => audio.speaker.volume = value,
})

var showVolume = 0
const volumePopup = (monitor = 0) => Widget.Window({
    monitor,
    keymode: 'none',
    name: `volumePopup ${monitor}`,
    layer: "top",
    anchor: ["bottom"],
    vexpand: true,
    class_name: "volume",
    child: Widget.Box({
	vertical: true,
	vexpand: true,
	spacing: 0,
	homogeneous: true,
	children:[
	    Widget.Revealer({
		transitionDuration: 300,
		transition: "slide_up",
		vexpand: true,
		child: Widget.Box({
		    vertical: true,
		    vexpand: true,
		    children: [VolumeSlider()]
		}),
		setup: self => {
		    var hideVolume
		    audio.speaker.connect("changed",() => {
			showVolume++
			if (showVolume % 4 == 0){
			    clearTimeout(hideVolume)
			    print(audio.speaker.volume)
			    self.reveal_child = true
			    hideVolume = setTimeout(() => {
				self.reveal_child = false
			    }, 1000);}
		    })
		}
	    })
	]
    })
})


App.config({
    style: "./style.css",
    windows: [calendarWidget(0),clockWidget(0),volumePopup(0)],
})
